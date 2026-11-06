import {test, expect, Page, request as pwRequest} from '@playwright/test';
import {open, watchErrors, E2E_USER, E2E_PASS} from './helpers';

/**
 * Sổ quỹ: form phiếu thu / phiếu chi (kiểu form khách hàng), phiếu tự động gắn hoá đơn chỉ xem,
 * phiếu thu nợ có bảng hoá đơn phân bổ. Dữ liệu mẫu: python3 pharma_chain/tools/dat-thuoc/demo_cong_no.py
 */
const shot = (page: Page, name: string) => page.screenshot({path: `test-results/screens/${name}.png`});
const API = process.env.E2E_API_URL || 'http://127.0.0.1:33081/v1';

/**
 * Mã phiếu thu mới nhất theo loại: 'auto' = phiếu tự động gắn thanh toán hoá đơn, 'debt' = phiếu thu nợ khách hàng
 * (không gắn hoá đơn). Lấy qua API theo loại thay vì đoán theo số tiền (các test khác cũng sinh phiếu 20,000).
 */
async function receiptNo(kind: 'auto' | 'debt'): Promise<string> {
  const login = await (await pwRequest.newContext()).post(API + '/auth/login', {data: {username: E2E_USER, password: E2E_PASS}});
  const body = await login.json();
  const api = await pwRequest.newContext({extraHTTPHeaders: {Authorization: 'Bearer ' + (body.access_token || body.token)}});
  const rows = await (await api.get(API + '/cash-flow?per-page=100&sort=-id')).json();
  const row = rows.find(r => r.type === 'receipt' && +r.value > 0 && !+r.deleted
    && (kind === 'auto' ? r.parent_table === 'payment' : !r.parent_table && r.doi_tuong_nop === 'customer'));
  await api.dispose();
  expect(row, 'Không có phiếu thu loại ' + kind + ' (chạy pharma_chain/tools/dat-thuoc/demo_cong_no.py)').toBeTruthy();
  return row.no;
}

/** Mở rộng dòng phiếu có mã `no` rồi bấm Cập nhật để mở form */
async function openCashFlow(page: Page, no: string) {
  await page.locator('tr.example-element-row', {hasText: no}).first().click();
  // Mọi dòng đều có khung chi tiết (thu gọn = cao 0): lấy nút ở khung ngay dưới dòng đang mở
  await page.locator('tr.example-expanded-row + tr').getByRole('button', {name: /Cập nhật/}).click();
  await expect(page.locator('mat-dialog-container')).toBeVisible();
}

test('Sổ quỹ: form lập phiếu thu, phiếu chi mới', async ({page}) => {
  const w = watchErrors(page);
  await open(page, '/cash-flow');
  await page.getByRole('button', {name: /Lập phiếu/}).click();
  await page.getByRole('menuitem', {name: 'Lập phiếu thu'}).click();
  const dialog = page.locator('mat-dialog-container');
  await expect(dialog.locator('.cff-header h2')).toHaveText('Lập phiếu thu');
  await expect(dialog.getByText('Thông tin phiếu')).toBeVisible();
  await expect(dialog.getByText('Số tiền')).toBeVisible();
  await expect(dialog.getByRole('button', {name: /Lưu phiếu thu/})).toBeVisible();
  await shot(page, 'so-quy-lap-phieu-thu');
  await dialog.getByRole('button', {name: 'Bỏ qua'}).click();

  await page.getByRole('button', {name: /Lập phiếu/}).click();
  await page.getByRole('menuitem', {name: 'Lập phiếu chi'}).click();
  await expect(dialog.locator('.cff-header h2')).toHaveText('Lập phiếu chi');
  await expect(dialog.locator('.cff-money.out')).toBeVisible();
  await shot(page, 'so-quy-lap-phieu-chi');
  await dialog.getByRole('button', {name: 'Bỏ qua'}).click();
  w.assertClean();
});

test('Sổ quỹ: phiếu thu tự động gắn hoá đơn chỉ xem; phiếu thu nợ có bảng hoá đơn', async ({page}) => {
  const w = watchErrors(page);
  // Phiếu thu nợ mẫu lập từ mấy ngày trước; các test khác sinh thêm phiếu mỗi lần chạy nên mở 50 dòng / trang để vẫn thấy
  await open(page, '/cash-flow?pageSize=50');
  const rows = page.locator('tr', {hasText: 'Phòng khám Da liễu Dr Tuấn'});
  // Không còn phiếu thu 0 đồng do bán nợ
  await expect(page.locator('tr.example-element-row', {hasText: /\s0\s*$/})).toHaveCount(0);

  // Phiếu thu tự động (thanh toán hoá đơn khi giao)
  const autoNo = await receiptNo('auto');
  await openCashFlow(page, autoNo);
  const dialog = page.locator('mat-dialog-container');
  await expect(dialog.locator('.cff-auto')).toContainText('Phiếu thu tự động khi thanh toán hoá đơn');
  await expect(dialog.locator('.cff-auto a')).toHaveText(/HD\d+-\d+/);
  await expect(dialog.getByRole('button', {name: /Lưu phiếu thu/})).toHaveCount(0);
  await shot(page, 'so-quy-phieu-tu-dong');
  await dialog.getByRole('button', {name: 'Đóng'}).click();
  await page.locator('tr.example-element-row', {hasText: autoNo}).first().click(); // thu gọn dòng vừa mở

  // Phiếu thu nợ cuối tháng: có bảng hoá đơn còn nợ
  const debtNo = await receiptNo('debt');
  await openCashFlow(page, debtNo);
  await expect(dialog.getByText('Hoá đơn khách còn nợ')).toBeVisible();
  await expect(dialog.locator('.cff-table')).toContainText(/HD\d+-\d+/);
  await shot(page, 'so-quy-phieu-thu-no');
  await dialog.getByRole('button', {name: 'Bỏ qua'}).click();
  expect(await rows.count()).toBeGreaterThan(0);
  w.assertClean();
});

test('Báo cáo công nợ thu: mở không lỗi, có công nợ phòng khám', async ({page}) => {
  const w = watchErrors(page);
  await open(page, '/report/debt-customers');
  const row = page.locator('tr', {hasText: 'Phòng khám Da liễu Dr Tuấn'}).first();
  await expect(row).toBeVisible();
  await shot(page, 'cong-no-thu');
  w.assertClean();
});
