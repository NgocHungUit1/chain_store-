import {test, expect, Page, request as pwRequest} from '@playwright/test';
import {randomUUID} from 'crypto';
import {readFileSync} from 'fs';
import {resolve} from 'path';
import {open, watchErrors} from './helpers';

/**
 * Đơn đặt thuốc từ phòng khám: tạo đơn qua API phòng khám (X-Clinic-Key) rồi xử lý trên màn nhà thuốc.
 * Khoá lấy từ env CLINIC_KEY hoặc dòng "ck_..." trong file CLINIC_KEY_FILE (khoá chỉ hiện 1 lần lúc tạo liên kết).
 */
const API = process.env.E2E_API_URL || 'http://127.0.0.1:33081/v1';
// Mặc định: file khoá của script giả lập trong repo pharma_chain (đã gitignore), xem pharma_chain/.claude/du-an/00-dang-lam.md
const KEY_FILE = process.env.CLINIC_KEY_FILE
  || resolve(__dirname, '../../../pharma_chain/tools/dat-thuoc/.clinic-key');
const IN_STOCK = {product_id: 535312, unit_id: 622378};
const OUT_OF_STOCK = {product_id: 535239, unit_id: 622305};

function clinicKey(): string {
  if (process.env.CLINIC_KEY) {
    return process.env.CLINIC_KEY;
  }
  const line = readFileSync(KEY_FILE, 'utf8').split('\n').map(s => s.trim()).find(s => /^ck_[A-Za-z0-9_-]+$/.test(s));
  if (!line) {
    throw new Error('Không có khoá phòng khám: đặt CLINIC_KEY hoặc CLINIC_KEY_FILE');
  }
  return line;
}

/** Phòng khám đặt 1 đơn, trả mã đơn (DT...) */
async function createOrder(patient: string, items: any[]): Promise<string> {
  const ctx = await pwRequest.newContext({extraHTTPHeaders: {'X-Clinic-Key': clinicKey()}});
  const res = await ctx.post(API + '/clinic-api/orders', {
    data: {
      client_order_id: randomUUID(),
      doctor: {code: 'BS001', name: 'BS. Kiểm Thử'},
      patient: {name: patient, phone: '0912345678', dob: '1989-08-15', gender: 'female', code: 'E2E'},
      diagnosis: 'Viêm họng cấp',
      note: 'Khám lại sau 7 ngày',
      items,
    },
  });
  expect(res.status(), await res.text()).toBe(201);
  const body = await res.json();
  await ctx.dispose();
  return body.code;
}

const shot = (page: Page, name: string) => page.screenshot({path: `test-results/screens/${name}.png`, fullPage: true});

async function openFromList(page: Page, code: string, tab = 'Mới nhận') {
  await open(page, '/transaction/prescription-order');
  await page.locator('.po-tab', {hasText: tab}).click();
  await page.getByPlaceholder('Mã đơn, bệnh nhân, SĐT, bác sĩ, phòng khám').fill(code);
  const row = page.locator('.po-row', {hasText: code});
  await expect(row).toHaveCount(1);
  return row;
}

test('Đặt thuốc: đơn mới hiện ở "Mới nhận", báo thiếu hàng, xác nhận chuyển sang "Đã xác nhận"', async ({page}) => {
  const w = watchErrors(page);
  const code = await createOrder('Nguyễn Thị E2E Một', [
    {...IN_STOCK, quantity: 2, usage: 'Uống sáng 1 viên, tối 1 viên'},
    {...OUT_OF_STOCK, quantity: 5, usage: 'Uống sau ăn'},
  ]);

  await open(page, '/transaction/prescription-order');
  // Mặc định tab "Mới nhận", đơn vừa đặt nằm trên cùng
  await expect(page.locator('.po-tab.active')).toContainText('Mới nhận');
  await expect(page.locator('.po-row').first()).toContainText(code);
  await expect(page.locator('.po-row').first()).toContainText('Nguyễn Thị E2E Một');
  await shot(page, 'dat-thuoc-danh-sach');

  await page.locator('.po-row', {hasText: code}).click();
  await expect(page).toHaveURL(/\/transaction\/prescription-order\/\d+$/);
  await expect(page.locator('.dt-code h3')).toHaveText(`Đơn ${code}`);
  await expect(page.locator('.dt-alert.warn')).toContainText('không đủ hàng');
  await expect(page.locator('tr.dt-short')).toHaveCount(1);
  await expect(page.locator('tr.dt-short')).toContainText('Không đủ hàng');
  await expect(page.getByText('Bốc thuốc')).toHaveCount(0);
  await shot(page, 'dat-thuoc-chi-tiet-thieu-hang');

  await page.getByRole('button', {name: 'Xác nhận'}).click();
  await expect(page.locator('.dt-status')).toHaveText('Đã xác nhận');
  await expect(page.getByRole('button', {name: 'Xác nhận'})).toHaveCount(0);
  await expect(page.getByRole('button', {name: 'Trả đơn'})).toBeVisible();
  await expect(page.locator('.dt-timeline li')).toHaveCount(2);

  // Bốc thuốc khi thiếu hàng: hộp cảnh báo của ứng dụng, Bỏ qua thì vẫn ở đơn
  await page.getByRole('button', {name: 'Bốc thuốc'}).click();
  const warn = page.locator('mat-dialog-container');
  await expect(warn.locator('h2')).toHaveText('Chi nhánh không đủ hàng');
  await expect(warn.locator('#po-warn-message')).toContainText('Không đủ hàng cho');
  await page.waitForTimeout(400); // hộp còn đang hiện dần
  await shot(page, 'dat-thuoc-hop-thieu-hang');
  await warn.getByRole('button', {name: 'Bỏ qua'}).click();
  await expect(warn).toHaveCount(0);
  await expect(page).toHaveURL(/\/transaction\/prescription-order\/\d+$/);
  await expect(page.locator('.dt-status')).toHaveText('Đã xác nhận');

  const row = await openFromList(page, code, 'Đã xác nhận');
  await expect(row.locator('.po-chip')).toHaveText('Đã xác nhận');
  w.assertClean();
});

test('Đặt thuốc: trả đơn phải có lý do, lý do hiện trên chi tiết', async ({page}) => {
  const w = watchErrors(page);
  const code = await createOrder('Trần Văn E2E Hai', [{...IN_STOCK, quantity: 1, usage: 'Uống tối 1 viên'}]);
  const row = await openFromList(page, code);
  await row.click();

  await page.getByRole('button', {name: 'Trả đơn'}).click();
  const dialog = page.locator('mat-dialog-container');
  await expect(dialog).toBeVisible();
  await dialog.locator('#po-return-reason').fill('');
  await dialog.getByRole('button', {name: 'Trả đơn'}).click();
  await expect(dialog).toContainText('Nhập lý do trả đơn');
  await expect(dialog).toBeVisible();

  await dialog.getByText('Cần bác sĩ xác nhận lại liều').click();
  await expect(dialog.locator('#po-return-reason')).toHaveValue('Cần bác sĩ xác nhận lại liều');
  await dialog.locator('#po-return-note').fill('Liều tối đa vượt khuyến cáo');
  await shot(page, 'dat-thuoc-hop-thoai-tra-don');
  await dialog.getByRole('button', {name: 'Trả đơn'}).click();
  await expect(dialog).toBeHidden();

  await expect(page.locator('.dt-status')).toHaveText('Trả đơn');
  await expect(page.locator('.dt-alert.danger')).toContainText('Cần bác sĩ xác nhận lại liều');
  await expect(page.locator('.dt-alert.danger')).toContainText('Liều tối đa vượt khuyến cáo');
  await expect(page.getByRole('button', {name: 'Trả đơn'})).toHaveCount(0);
  await expect(page.getByRole('button', {name: 'Xác nhận'})).toHaveCount(0);
  w.assertClean();
});

test('Đặt thuốc: bấm thông báo đơn mới mở đúng chi tiết', async ({page}) => {
  const w = watchErrors(page);
  const code = await createOrder('Lê Thị E2E Ba', [{...IN_STOCK, quantity: 1}]);
  await open(page, '/dashboard');
  await page.locator('button.notification-button').click();
  await page.locator('.noti-item', {hasText: `Đơn đặt thuốc mới ${code}`}).first().click();
  await expect(page).toHaveURL(/\/transaction\/prescription-order\/\d+$/);
  await expect(page.locator('.dt-code h3')).toHaveText(`Đơn ${code}`);
  await expect(page.locator('.dt-info')).toContainText(['Lê Thị E2E Ba']);
  w.assertClean();
});

test('Đặt thuốc: đơn mới tự báo trên chuông trong 30 giây, hiện thông báo góc màn hình', async ({page}) => {
  test.setTimeout(90_000);
  const w = watchErrors(page);
  await open(page, '/dashboard');
  await page.waitForTimeout(3_000); // lần tải đầu chỉ ghi nhận mốc, không báo đơn cũ
  const code = await createOrder('Phan Văn Chuông', [{...IN_STOCK, quantity: 1}]);
  // Không tải lại trang: chuông hỏi lại mỗi 30 giây
  const toast = page.locator('.notifier__notification', {hasText: `Đơn đặt thuốc mới ${code}`});
  await expect(toast).toBeVisible({timeout: 45_000});
  await shot(page, 'dat-thuoc-chuong-30s');
  await page.locator('button.notification-button').click();
  await expect(page.locator('.noti-item', {hasText: `Đơn đặt thuốc mới ${code}`}).first()).toBeVisible();
  w.assertClean();
});

test('Đặt thuốc: bốc thuốc → hoá đơn ghi nợ phòng khám → phòng khám tự lấy → hoàn thành', async ({page}) => {
  test.setTimeout(180_000);
  const w = watchErrors(page);
  // Thuốc có lô hợp lệ đủ tồn ở Chi nhánh trung tâm (bán theo lô)
  const code = await createOrder('Đỗ Văn Bốc Thuốc', [{product_id: 535320, unit_id: 622386, quantity: 2}]);
  const row = await openFromList(page, code);
  await row.click();
  await expect(page).toHaveURL(/\/transaction\/prescription-order\/\d+$/);
  const detailUrl = page.url();
  await page.getByRole('button', {name: 'Xác nhận'}).click();
  await expect(page.locator('.dt-status')).toHaveText('Đã xác nhận');

  // Bốc thuốc: mở màn bán hàng, tab riêng của đơn, khách = phòng khám
  await page.getByRole('button', {name: 'Bốc thuốc'}).click();
  await expect(page).toHaveURL(/\/sale/, {timeout: 60_000});
  await expect(page.locator('.po-pick-banner')).toContainText(code, {timeout: 60_000});
  await expect(page.locator('input.input-search-customer')).toHaveValue(/Dr Tuấn/);
  await expect(page.getByText('ZRPT report test').first()).toBeVisible();
  await page.waitForTimeout(2_000); // chờ nạp lô + giá
  await shot(page, 'dat-thuoc-boc-thuoc-ban-hang');
  await page.getByRole('button', {name: 'Thanh toán (F7)'}).click();
  await expect(page.locator('.notifier__notification', {hasText: /thành công/i}).first()).toBeVisible({timeout: 30_000});

  // Quay lại đơn: đang soạn, đã có hoá đơn, phòng khám nợ cả hoá đơn
  await page.goto(detailUrl);
  await expect(page.locator('.dt-status')).toHaveText('Đang soạn thuốc');
  const invoiceAlert = page.locator('.dt-alert.info', {hasText: 'Hoá đơn'});
  await expect(invoiceAlert).toContainText('phòng khám còn nợ');
  // Giao qua shipper ở giao-hang.spec.ts; ở đây phòng khám tự đến lấy (chốt S9), ghi nợ
  await expect(page.locator('#po-assign')).toBeVisible();
  await page.locator('#po-self-pickup').click();
  await page.locator('#po-complete-debt').click();
  await shot(page, 'dat-thuoc-hoan-thanh-dialog');
  await page.locator('mat-dialog-container').getByRole('button', {name: 'Hoàn thành'}).click();
  await expect(page.locator('.dt-status')).toHaveText('Hoàn thành');
  await expect(invoiceAlert).toContainText('phòng khám còn nợ');
  await shot(page, 'dat-thuoc-hoan-thanh');
  w.assertClean();
});

test('Đặt thuốc: màn hẹp không vỡ bố cục, có menu', async ({page}) => {
  const w = watchErrors(page);
  await open(page, '/dashboard');
  await expect(page.locator('a', {hasText: 'Đơn đặt thuốc'}).first()).toBeAttached();

  await page.setViewportSize({width: 400, height: 860});
  await open(page, '/transaction/prescription-order?status=');
  await expect(page.locator('.po-tab.active')).toContainText('Tất cả');
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(overflow).toBeLessThanOrEqual(1);
  await shot(page, 'dat-thuoc-man-hep');
  await page.locator('.po-row').first().click();
  await expect(page.locator('.dt-info').first()).toBeVisible();
  await shot(page, 'dat-thuoc-chi-tiet-man-hep');
  w.assertClean();
});
