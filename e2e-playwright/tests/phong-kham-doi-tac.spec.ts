import {test, expect, Page} from '@playwright/test';
import {open, watchErrors} from './helpers';

/**
 * Chuỗi › Phòng khám đối tác (pharma_chain/tools/de-xuat/phong-kham-doi-tac.html, Phần 1).
 * Cần sẵn: PK0001 "Phòng khám Đa khoa Minh Tâm" đã duyệt (DocSoft pkminhtam). Test không tạo phòng khám DocSoft mới:
 * hồ sơ E2E chỉ đi tới mở hộp Duyệt rồi bỏ qua, từ chối, xoá.
 */
const shot = async (page: Page, name: string) => {
  await page.waitForTimeout(400); // đợi hiệu ứng mở dialog / thông báo xong mới chụp
  await page.screenshot({path: `test-results/screens/${name}.png`, fullPage: true});
};
const dialog = (page: Page) => page.locator('mat-dialog-container');
const chip = (page: Page) => page.locator('.dt-top .po-chip');
/** Đăng nhập DocSoft pkminhtam qua 127.0.0.1 + Host (Node không phân giải *.localhost) */
const docsoftLogin = (page: Page) => page.request.post('http://127.0.0.1:8091/api/v1/auth/login',
  {data: {username: 'x', password: 'x'}, headers: {Accept: 'application/json', Host: 'pkminhtam.localhost:8091'}});

test('Phòng khám đối tác: menu Chuỗi, đăng ký thiếu thì báo, gửi duyệt, hộp Duyệt gợi ý mã DocSoft, từ chối, xoá', async ({page}) => {
  const w = watchErrors(page, [422]);
  await open(page, '/dashboard');
  const menu = page.locator('mat-sidenav').getByText('Chuỗi', {exact: true});
  await menu.click();
  await expect(page.locator('mat-sidenav').getByText('Phòng khám đối tác')).toBeVisible();
  await expect(page.locator('mat-sidenav').getByText('Đối soát phòng khám').first()).toBeVisible();
  await page.locator('mat-sidenav').getByText('Phòng khám đối tác').click();
  await expect(page.getByRole('heading', {name: 'Phòng khám đối tác'})).toBeVisible();
  await page.getByRole('tab', {name: /Tất cả/}).click();
  await expect(page.locator('.po-table tbody tr', {hasText: 'Phòng khám Đa khoa Minh Tâm'})).toBeVisible();
  await shot(page, 'pkdt-danh-sach');

  // Đăng ký: gửi duyệt khi thiếu trường bắt buộc → báo lỗi, không lưu
  const name = 'E2E Phòng khám Nhi Thử ' + Date.now().toString().slice(-5);
  await page.getByRole('button', {name: /Đăng ký phòng khám/}).click();
  await dialog(page).locator('#cp-name').fill(name);
  await dialog(page).locator('#cp-phone').fill('0281112233');
  await dialog(page).locator('#cp-submit').click();
  await expect(dialog(page).locator('.cp-error')).toContainText('Gửi duyệt cần đủ');
  await shot(page, 'pkdt-dang-ky-thieu');
  await dialog(page).locator('#cp-license').fill('99/HCM-GPHĐ');
  await dialog(page).locator('#cp-address').fill('1 Nguyễn Trãi, Q.5');
  await dialog(page).locator('#cp-rep-name').fill('BS. Thử Nghiệm');
  await dialog(page).locator('#cp-rep-phone').fill('0909000111');
  await dialog(page).locator('#cp-specialty').fill('Nhi');
  await dialog(page).locator('#cp-submit').click();
  await expect(chip(page)).toHaveText('Chờ duyệt');
  await expect(page.locator('.dt-code h3')).toContainText(name);

  // Hộp Duyệt: chi nhánh chọn sẵn, mã DocSoft gợi ý từ tên, tên quản trị theo mã; bỏ qua (không tạo DocSoft trong test)
  await page.locator('#cp-approve').click();
  await expect(dialog(page).locator('#ap-tenant')).toHaveValue(/^pkthu\d+$/);
  await expect(dialog(page).locator('#ap-admin')).toHaveValue(/^pkthu\d+\.admin$/);
  await expect(dialog(page)).toContainText('Tạo khách công ty');
  await dialog(page).locator('#ap-mode-connect').click();
  await expect(dialog(page).locator('#ap-admin')).toHaveCount(0);
  await dialog(page).locator('#ap-mode-create').click();
  await shot(page, 'pkdt-hop-duyet');
  await dialog(page).getByRole('button', {name: 'Huỷ'}).click();

  // Từ chối bắt buộc lý do
  await page.getByRole('button', {name: /Từ chối/}).click();
  await dialog(page).locator('#cpa-confirm').click();
  await expect(dialog(page).locator('.cp-error')).toContainText('lý do');
  await dialog(page).getByRole('button', {name: 'Thiếu giấy phép hoạt động'}).click();
  await dialog(page).locator('#cpa-confirm').click();
  await expect(chip(page)).toHaveText('Bị từ chối');
  await expect(page.locator('.dt-alert.danger')).toContainText('Thiếu giấy phép hoạt động');
  await shot(page, 'pkdt-bi-tu-choi');
  await page.locator('#cp-tab-history').click();
  await expect(page.locator('.po-table tbody tr').first()).toContainText('Từ chối');

  // Xoá hồ sơ bị từ chối → về danh sách, không còn
  await page.locator('.dt-actions button', {hasText: 'Xoá'}).click();
  await dialog(page).locator('#cpa-confirm').click();
  await expect(page.getByRole('heading', {name: 'Phòng khám đối tác'})).toBeVisible();
  await page.getByRole('tab', {name: /Tất cả/}).click();
  await expect(page.locator('.po-table tbody tr', {hasText: name})).toHaveCount(0);
  w.assertClean();
});

test('Phòng khám đối tác: tạm ngưng / hoạt động lại, ngừng hợp tác khoá DocSoft, mở lại', async ({page}) => {
  const w = watchErrors(page);
  await open(page, '/chain/clinic-partner?tab=');
  await page.locator('.po-table tbody tr', {hasText: 'Phòng khám Đa khoa Minh Tâm'}).click();
  await expect(page.locator('.dt-code h3')).toContainText('PK0001');
  await expect(chip(page)).toHaveText('Đang hoạt động');
  await expect(page.locator('.dt-info', {hasText: 'DocSoft'})).toContainText('pkminhtam');
  await shot(page, 'pkdt-chi-tiet');

  // Tạm ngưng: hộp xác nhận nói rõ ảnh hưởng, có lý do gợi ý
  await page.getByRole('button', {name: /Tạm ngưng/}).click();
  await expect(dialog(page)).toContainText('không gửi được đơn mới');
  await dialog(page).getByRole('button', {name: 'Quá hạn công nợ'}).click();
  await dialog(page).locator('#cpa-confirm').click();
  await expect(chip(page)).toHaveText('Tạm ngưng');
  await expect(page.locator('.dt-alert.warn', {hasText: 'Tạm ngưng từ'})).toContainText('không gửi được đơn mới');
  await expect(page.locator('.cp-link-st')).toHaveText('tạm ngưng');
  await shot(page, 'pkdt-tam-ngung');
  await page.getByRole('button', {name: /Hoạt động lại/}).click();
  await expect(chip(page)).toHaveText('Đang hoạt động');

  // Ngừng hợp tác: cảnh báo khoá toàn bộ DocSoft, bắt buộc lý do
  await page.getByRole('button', {name: /Ngừng hợp tác/}).click();
  await expect(dialog(page)).toContainText('KHOÁ TOÀN BỘ');
  await shot(page, 'pkdt-hop-ngung-hop-tac');
  await dialog(page).getByRole('button', {name: 'Hết hạn hợp đồng'}).click();
  await dialog(page).locator('#cpa-confirm').click();
  await expect(chip(page)).toHaveText('Ngừng hợp tác', {timeout: 30_000});
  await expect(page.locator('.cp-link-st')).toHaveText('đã thu hồi');
  // DocSoft của phòng khám bị khoá: API đăng nhập trả 403 kèm lý do
  const locked = await docsoftLogin(page);
  expect(locked.status()).toBe(403);
  expect((await locked.json()).message).toContain('ngừng hợp tác');
  await shot(page, 'pkdt-ngung-hop-tac');

  // Mở lại: liên kết + khoá mới, mở khoá DocSoft
  await page.getByRole('button', {name: /Mở lại hợp tác/}).click();
  await dialog(page).locator('#cpa-confirm').click();
  await expect(chip(page)).toHaveText('Đang hoạt động', {timeout: 60_000});
  await expect(page.locator('.cp-link-st')).toHaveText('đang dùng');
  const unlocked = await docsoftLogin(page);
  expect(unlocked.status()).not.toBe(403);
  // Lịch sử (tab riêng): dòng mới nhất là Kích hoạt, ngay trước là Mở lại hợp tác
  await page.locator('#cp-tab-history').click();
  await expect(page.locator('.po-table tbody tr').nth(0)).toContainText('Kích hoạt');
  await expect(page.locator('.po-table tbody tr').nth(1)).toContainText('Mở lại hợp tác');
  await shot(page, 'pkdt-mo-lai');
  w.assertClean();
});
