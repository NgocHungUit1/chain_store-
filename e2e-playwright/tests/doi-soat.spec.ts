import {test, expect, Page} from '@playwright/test';
import {open, watchErrors} from './helpers';

/**
 * Báo cáo › Đối soát phòng khám: số tổng tháng khớp nhau (đầu kỳ + phát sinh − đã trả = cuối kỳ = cộng còn nợ hoá đơn),
 * chuyển tháng mang nợ sang đầu kỳ, xuất Excel. Dữ liệu mẫu: python3 pharma_chain/tools/dat-thuoc/demo_cong_no.py
 */
const shot = (page: Page, name: string) => page.screenshot({path: `test-results/screens/${name}.png`, fullPage: true});
const num = (s: string) => Number((s || '').replace(/[^\d-]/g, '')) || 0;

test('Đối soát phòng khám: số tổng khớp, sang tháng sau nợ thành đầu kỳ, xuất Excel', async ({page}) => {
  const w = watchErrors(page);
  await open(page, '/report/clinic-reconciliation');
  await expect(page.getByRole('heading', {name: 'Đối soát phòng khám'})).toBeVisible();
  // Chọn phòng khám ở dropdown
  await page.locator('[data-test=clinic-select]').click();
  await page.getByRole('option', {name: /Phòng khám Da liễu Dr Tuấn/}).click();
  const kpi = (label: string) => page.locator('.tv-kpi', {hasText: label}).locator('.k-value');
  await expect(kpi('Phát sinh trong tháng')).toBeVisible();

  const opening = num(await kpi('Nợ đầu kỳ').innerText());
  const increase = num(await kpi('Phát sinh trong tháng').innerText());
  const paid = num(await kpi('Đã thanh toán').innerText());
  const closing = num(await kpi('Còn nợ cuối').innerText());
  expect(opening + increase - paid).toBe(closing);
  expect(num(await page.locator('.rc-invoices tfoot td.num').first().innerText())).toBe(closing);
  // Tab Lịch sử thanh toán: tổng các lần trả = Đã thanh toán (khi không có trả hàng)
  await page.getByRole('tab', {name: /Lịch sử thanh toán/}).click();
  const payCells = await page.locator('.rc-payments tbody td.num').allInnerTexts();
  expect(payCells.reduce((a, s) => a + num(s), 0)).toBe(paid);
  await shot(page, 'doi-soat-thang-nay');

  // Tháng sau: nợ cuối tháng này thành nợ đầu kỳ, hoá đơn còn nợ hiện nhãn "tháng trước"
  await shot(page, 'doi-soat-lich-su-thanh-toan');
  await page.getByRole('tab', {name: /Hoá đơn/}).click();
  await page.getByRole('button', {name: 'Tháng sau'}).click();
  await expect(kpi('Nợ đầu kỳ')).toHaveText(closing.toLocaleString('en-US'));
  if (closing > 0) {
    await expect(page.locator('.rc-tag', {hasText: 'tháng trước'}).first()).toBeVisible();
  }
  await shot(page, 'doi-soat-thang-sau');
  await page.getByRole('button', {name: 'Tháng trước'}).click();
  await expect(kpi('Còn nợ cuối')).toHaveText(closing.toLocaleString('en-US'));

  // Xuất Excel: mở tab tải file
  // Nút mở link tải trong tab mới: chặn window.open để lấy link, rồi tải bằng request để kiểm file
  await page.evaluate(() => { (window as any).__opened = null; window.open = (u?: string | URL) => { (window as any).__opened = String(u); return null; }; });
  await page.getByRole('button', {name: /Xuất Excel/}).click();
  const url = await page.evaluate(() => (window as any).__opened as string);
  expect(url).toContain('export-clinic-reconciliation');
  const file = await page.request.get(url);
  expect(file.status()).toBe(200);
  expect(file.headers()['content-type']).toContain('spreadsheetml');
  expect(file.headers()['content-disposition']).toMatch(/doi-soat-.*\.xlsx/);
  w.assertClean();
});

test('Đối soát: nhiều phòng khám có bảng tổng hợp; Thu nợ xem trước trừ hoá đơn cũ nhất, chặn nhập quá nợ', async ({page}) => {
  const w = watchErrors(page);
  await open(page, '/report/clinic-reconciliation');
  const overview = page.locator('.rc-overview');
  await expect(overview).toBeVisible();
  const rows = overview.locator('tbody tr');
  expect(await rows.count()).toBeGreaterThan(1);
  await shot(page, 'doi-soat-nhieu-phong-kham');

  // Phòng khám nợ nhiều nhất (bảng xếp theo còn nợ giảm dần)
  const first = rows.first();
  const name = (await first.locator('td').first().locator('b').innerText()).trim();
  await first.click();
  await expect(page.locator('[data-test=clinic-select]')).toContainText(name);
  await expect(overview).toHaveCount(0);
  const kpi = (label: string) => page.locator('.tv-kpi', {hasText: label}).locator('.k-value');
  const before = num(await kpi('Còn nợ cuối').innerText());
  test.skip(before < 10000, 'Phòng khám không còn đủ nợ để thử');

  await page.getByRole('button', {name: /Thu nợ/}).click();
  const dialog = page.locator('mat-dialog-container');
  await expect(dialog.locator('h2')).toHaveText('Thu nợ ' + name);
  // Mặc định trả hết số đang nợ (tính tới hôm nay)
  const debtText = await dialog.locator('input[name=collect_amount]').inputValue();
  expect(num(debtText)).toBeGreaterThan(0);
  await dialog.locator('input[name=collect_amount]').fill('10000');
  await dialog.locator('input[name=collect_amount]').press('End');
  // Xem trước: hoá đơn cũ nhất nhận 10,000, các hoá đơn sau 0
  await expect(dialog.locator('tbody tr').first().locator('td').nth(4)).toHaveText('10,000');
  await expect(dialog.getByText(/Trả một phần, còn lại/)).toBeVisible();
  // Nhập quá số nợ: báo lỗi, khoá nút lập phiếu
  await dialog.locator('input[name=collect_amount]').fill(String(num(debtText) + 1000));
  await dialog.locator('input[name=collect_amount]').press('End');
  await expect(dialog.getByText(/Lớn hơn số đang nợ/)).toBeVisible();
  await expect(dialog.getByRole('button', {name: /Lập phiếu thu/})).toBeDisabled();
  await shot(page, 'doi-soat-thu-no');
  // Không lập phiếu thật để khỏi đụng dữ liệu đang test tay (lập phiếu đã kiểm bằng API: thu đủ, thu một phần, chặn trả thừa)
  await dialog.getByRole('button', {name: 'Bỏ qua'}).click();
  await expect(dialog).toHaveCount(0);
  await expect(kpi('Còn nợ cuối')).toHaveText(before.toLocaleString('en-US'));
  w.assertClean();
});
