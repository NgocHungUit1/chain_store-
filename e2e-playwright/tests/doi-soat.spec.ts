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
  const kpi = (label: string) => page.locator('.tv-kpi', {hasText: label}).locator('.k-value');
  await expect(kpi('Phát sinh trong tháng')).toBeVisible();

  const opening = num(await kpi('Nợ đầu kỳ').innerText());
  const increase = num(await kpi('Phát sinh trong tháng').innerText());
  const paid = num(await kpi('Đã thanh toán').innerText());
  const closing = num(await kpi('Còn nợ cuối').innerText());
  expect(opening + increase - paid).toBe(closing);
  expect(num(await page.locator('tfoot td.num').first().innerText())).toBe(closing);
  // Tổng các lần trả = Đã thanh toán (khi không có trả hàng)
  const payCells = await page.locator('.tv-table-card', {hasText: 'Các lần phòng khám trả tiền'}).locator('tbody td.num').allInnerTexts();
  expect(payCells.reduce((a, s) => a + num(s), 0)).toBe(paid);
  await shot(page, 'doi-soat-thang-nay');

  // Tháng sau: nợ cuối tháng này thành nợ đầu kỳ, hoá đơn còn nợ hiện nhãn "tháng trước"
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
