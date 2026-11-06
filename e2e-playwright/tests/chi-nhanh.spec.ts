import {test, expect, Page, request as pwRequest} from '@playwright/test';
import {open, watchErrors} from './helpers';

/**
 * Nền nhiều chi nhánh (.claude/du-an/12-sua-nen-chi-nhanh.md): phiếu nhập lập ở chi nhánh đang làm việc (ô chi nhánh khoá),
 * hộp sửa chi nhánh không lộ mật khẩu CSDL Dược, chuyển kho thuốc quản lý theo lô bị chặn (chờ Kho tổng).
 * Kịch bản số liệu 2 chi nhánh ở API: python3 pharma_chain/tools/chi-nhanh/kiem-tra-nen-chi-nhanh.py
 */
const shot = (page: Page, name: string) => page.screenshot({path: `test-results/screens/${name}.png`});
const API = process.env.E2E_API_URL || 'http://127.0.0.1:33081/v1';
const LOT_PRODUCT = 'ZRPT'; // thuốc mẫu quản lý theo lô (product 535320)

async function api() {
  const login = await (await pwRequest.newContext()).post(API + '/auth/login', {data: {username: 'demo', password: 'Demo@123'}});
  const body = await login.json();
  return pwRequest.newContext({extraHTTPHeaders: {Authorization: 'Bearer ' + (body.access_token || body.token)}});
}

/** Chi nhánh đang làm việc của demo và một chi nhánh khác đang hoạt động */
async function branches() {
  const ctx = await api();
  const list = await (await ctx.get(API + '/branch?fields=id,name,status,has_national_v2_password')).json();
  const loginId = await (await ctx.get(API + '/user/branch-login')).json();
  await ctx.dispose();
  const current = list.find(b => b.id === +loginId);
  const other = list.find(b => b.id !== +loginId && b.status === 10);
  expect(current, 'Không thấy chi nhánh đang làm việc của demo').toBeTruthy();
  expect(other, 'Cần ít nhất 2 chi nhánh đang hoạt động').toBeTruthy();
  return {list, current, other};
}

test('Nhập hàng: ô chi nhánh khoá ở chi nhánh đang làm việc', async ({page}) => {
  const {current} = await branches();
  const w = watchErrors(page);
  await open(page, '/transaction/warehouse/create');
  const select = page.locator('mat-select[formcontrolname="branch_id"]');
  await expect(select).toHaveAttribute('aria-disabled', 'true');
  await expect(select).toContainText(current.name);
  await shot(page, 'chi-nhanh-nhap-hang-khoa');
  w.assertClean();
});

test('Chi nhánh: hộp cập nhật không hiện mật khẩu CSDL Dược', async ({page}) => {
  const {current} = await branches();
  const w = watchErrors(page);
  await open(page, '/setting/branch');
  await page.locator('tr.example-element-row', {hasText: current.name}).first().click();
  await page.locator('tr.example-expanded-row + tr').getByRole('button', {name: /Cập nhật/}).click();
  const dialog = page.locator('mat-dialog-container');
  await expect(dialog).toBeVisible();
  const pass = dialog.locator('mat-form-field', {hasText: 'Mật khẩu'}).first().locator('input');
  // Ô hiện trên màn là liên thông mới (hệ thống cũ đang ẩn). API chỉ trả cờ đã lưu: có thì ********, không thì trống
  await expect(pass).toHaveValue(current.has_national_v2_password ? '********' : '');
  await page.waitForTimeout(500); // hộp mở có hiệu ứng mờ dần, chờ xong mới chụp
  await shot(page, 'chi-nhanh-hop-cap-nhat');
  await dialog.getByRole('button', {name: /Bỏ qua/}).click();
  w.assertClean();
});

test('Chuyển kho: thuốc quản lý theo lô chưa chuyển được, báo chờ Kho tổng', async ({page}) => {
  const {current, other} = await branches();
  const w = watchErrors(page);
  await open(page, '/transaction/move/create');
  await expect(page.locator('mat-select[formcontrolname="branch_from"]')).toContainText(current.name);

  await page.getByPlaceholder('Tìm hàng hóa theo mã hoặc tên').fill(LOT_PRODUCT);
  await page.locator('mat-option').first().click();
  await page.locator('mat-select[formcontrolname="branch_to"]').click();
  // Chi nhánh nhận không có chính chi nhánh đang chuyển
  await expect(page.locator('mat-option', {hasText: other.name})).toBeVisible();
  await expect(page.locator('mat-option', {hasText: current.name})).toHaveCount(0);
  await shot(page, 'chi-nhanh-chuyen-kho-chi-nhanh-nhan');
  await page.locator('mat-option', {hasText: other.name}).click();
  await page.locator('mat-select[placeholder="Chọn trạng thái"]').click();
  await page.locator('mat-option', {hasText: 'Hoàn thành'}).click();
  await page.getByRole('button', {name: /Lưu phiếu/}).click();

  await expect(page.locator('.notifier__notification', {hasText: 'Kho tổng'})).toBeVisible();
  await page.waitForTimeout(600); // thông báo trượt vào từ mép phải
  await shot(page, 'chi-nhanh-chuyen-kho-theo-lo');
  // Bị chặn ở bước kiểm: vẫn ở màn lập phiếu, không sinh phiếu
  await expect(page).toHaveURL(/move\/create/);
  w.assertClean();
});
