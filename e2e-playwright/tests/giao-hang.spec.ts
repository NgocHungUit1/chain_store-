import {test, expect, Page, APIRequestContext, request as pwRequest, Browser} from '@playwright/test';
import {randomUUID} from 'crypto';
import {readFileSync} from 'fs';
import {resolve} from 'path';
import {open, watchErrors} from './helpers';

/**
 * Giao hàng qua shipper (chốt S1–S10, 05/11/2026): dược sĩ giao đơn cho shipper / đổi / huỷ giao; shipper trên điện thoại
 * nhận đơn → lấy hàng → đã giao thu tiền mặt, hoặc giao không được; phòng khám tự lấy; thu ngân nhận tiền shipper.
 * Đơn tạo qua API phòng khám (khoá như dat-thuoc.spec.ts) rồi bốc thuốc + lập hoá đơn qua API như màn bán hàng.
 */
const API = process.env.E2E_API_URL || 'http://127.0.0.1:33081/v1';
const KEY_FILE = process.env.CLINIC_KEY_FILE || resolve(__dirname, '../../../pharma_chain/tools/dat-thuoc/.clinic-key');
const LOT_ITEM = {product_id: 535320, unit_id: 622386}; // ZRPT report test, có lô ở Chi nhánh trung tâm
const SHIPPER = {username: 'e2eshipper', password: 'Demo@123'};
const CLINIC_CUSTOMER_ID = 36003; // khách công ty của liên kết Dr Tuấn (khoá test)
const PHONE = {width: 390, height: 844};

const shot = (page: Page, name: string) => page.screenshot({path: `test-results/screens/${name}.png`, fullPage: true});

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

async function staffApi(): Promise<APIRequestContext> {
  const login = await (await pwRequest.newContext()).post(API + '/auth/login', {data: {username: 'demo', password: 'Demo@123'}});
  const body = await login.json();
  return pwRequest.newContext({extraHTTPHeaders: {Authorization: 'Bearer ' + (body.access_token || body.token)}});
}

/** Đơn phòng khám tới bước Đang soạn + đã lập hoá đơn (chờ giao). Trả {id, code, total} */
async function readyOrder(staff: APIRequestContext, patient: string) {
  const clinic = await pwRequest.newContext({extraHTTPHeaders: {'X-Clinic-Key': clinicKey()}});
  const created = await clinic.post(API + '/clinic-api/orders', {data: {
    client_order_id: randomUUID(), doctor: {code: 'BS001', name: 'BS. Kiểm Thử'},
    patient: {name: patient, phone: '0912345678'}, items: [{...LOT_ITEM, quantity: 2, usage: 'Uống sáng 1 viên'}],
  }});
  expect(created.status(), await created.text()).toBe(201);
  const code = (await created.json()).code as string;
  const id = +code.split('-').pop();
  expect((await staff.post(`${API}/prescription-order/${id}/confirm`)).status()).toBe(200);
  const cart = (await (await staff.post(`${API}/prescription-order/${id}/pick`)).json()).cart;
  const lines = cart.products.map(p => ({product_id: p.id, amount: p.amount, price: p.end_price, discount: 0, discount_type: 'price',
    product_unit_id: p.product_unit_id, product_unit_value: p.product_unit_value, base_unit: p.base_unit, note: p.note_detail_sale}));
  const total = lines.reduce((s, l) => s + l.amount * l.price, 0);
  // Như màn bán hàng; không gửi lô → máy chủ chọn lô theo FEFO
  const inv = await staff.post(API + '/invoice/sale-order', {data: {
    is_web_app: false, prescription_order_id: id,
    Invoice: {invoice_id: -1, customer_id: cart.customer.id, total_price: total, total_vat: 0, discount: 0, discount_type: 'price',
      note: cart.note, price_book_id: cart.price_list_id, branch_id: cart.branch_id, expenses_order_price: 0, use_einvoice: 0},
    InvoiceDetail: lines, PaymentMethod: 'cash', PaymentPrice: total, KhachNo: total, usedPoint: 0, ExpenseOrders: [],
  }});
  expect(inv.status(), await inv.text()).toBe(200);
  await clinic.dispose();
  return {id, code, total};
}

/** Tài khoản shipper thử (e2eshipper): tạo bằng vai trò mẫu "Nhân viên giao hàng" nếu chưa có. Trả user id */
async function ensureShipper(staff: APIRequestContext): Promise<number> {
  const roles = await (await staff.get(API + '/user/store-role-list')).json();
  const role = roles.find(r => r.role === 'Store.Shipper');
  expect(role, 'Chưa có vai trò mẫu Nhân viên giao hàng (migration m261105_000002)').toBeTruthy();
  await staff.post(API + '/user', {data: {...SHIPPER, email: SHIPPER.username + '@demo.local', phone_number: '0909555666',
    store_role_id: role.id, status: 10}}); // đã có thì 422, bỏ qua
  const shippers = await (await staff.get(API + '/prescription-order/shippers')).json();
  const me = shippers.find(s => s.name === SHIPPER.username);
  expect(me, 'e2eshipper không có trong danh sách shipper chi nhánh').toBeTruthy();
  return me.id;
}

/** Trình duyệt điện thoại, đăng nhập bằng form như shipper thật */
async function shipperPhone(browser: Browser): Promise<Page> {
  const ctx = await browser.newContext({viewport: PHONE, storageState: {cookies: [], origins: []}, locale: 'vi-VN', hasTouch: true});
  const page = await ctx.newPage();
  await page.goto('/authentication/login', {waitUntil: 'networkidle', timeout: 120_000});
  await page.locator('input[type="text"], input:not([type])').first().fill(SHIPPER.username, {timeout: 60_000});
  await page.locator('input[type="password"]').fill(SHIPPER.password);
  await page.getByRole('button', {name: 'Đăng nhập'}).click();
  return page;
}

async function openOrder(page: Page, code: string, tab: string) {
  await open(page, '/transaction/prescription-order');
  await page.locator('.po-tab', {hasText: tab}).click();
  await page.getByPlaceholder('Mã đơn, bệnh nhân, SĐT, bác sĩ, phòng khám').fill(code);
  await page.locator('.po-row', {hasText: code}).click();
  await expect(page.locator('.dt-code h3')).toHaveText(`Đơn ${code}`);
}

test.describe.serial('Giao hàng qua shipper', () => {
  let staff: APIRequestContext;
  let shipperId: number;
  let delivered: { id: number, code: string, total: number };
  let failed: { id: number, code: string, total: number };

  test.beforeAll(async () => {
    staff = await staffApi();
    shipperId = await ensureShipper(staff);
    // Phòng khám có địa chỉ, điện thoại để thử nút Gọi / Chỉ đường
    expect((await staff.put(`${API}/customer/${CLINIC_CUSTOMER_ID}`, {data: {address: '120 Hai Bà Trưng, Q.1, TP.HCM', phone: '0283822000'}})).status()).toBe(200);
    delivered = await readyOrder(staff, 'Nguyễn Văn Giao');
    failed = await readyOrder(staff, 'Trần Thị Hẹn');
  });

  test('Nhà thuốc: tab Chờ giao, giao cho shipper, đổi sang tự nhận, huỷ giao, giao lại', async ({page}) => {
    const w = watchErrors(page);
    await openOrder(page, delivered.code, 'Chờ giao');
    await expect(page.locator('#po-assign')).toBeVisible();
    await expect(page.locator('#po-self-pickup')).toBeVisible();
    await expect(page.getByRole('button', {name: 'Đang giao'})).toHaveCount(0);

    await page.locator('#po-assign').click();
    const dialog = page.locator('mat-dialog-container');
    await expect(dialog.locator('h2')).toHaveText(`Giao đơn ${delivered.code} cho shipper`);
    await expect(dialog).toContainText('120 Hai Bà Trưng');
    await dialog.locator(`[data-shipper="${shipperId}"]`).click();
    await page.waitForTimeout(300);
    await shot(page, 'giao-hang-hop-chon-shipper');
    await dialog.locator('#po-assign-ok').click();
    await expect(page.locator('#po-delivery')).toContainText('Đã tạo đơn giao');
    await expect(page.locator('#po-delivery')).toContainText(SHIPPER.username);
    await expect(page.locator('#po-assign')).toHaveCount(0);
    await expect(page.locator('#po-self-pickup')).toHaveCount(0);

    // Đổi sang để shipper tự nhận
    await page.locator('#po-change-shipper').click();
    await dialog.locator('#po-assign-pool').click();
    await dialog.locator('#po-assign-ok').click();
    await expect(page.locator('#po-delivery')).toContainText('chờ shipper tự nhận');

    // Huỷ giao → về chờ giao, giao lại cho shipper
    await page.locator('#po-cancel-delivery').click();
    await expect(page.locator('#po-delivery')).toHaveCount(0);
    await expect(page.locator('#po-assign')).toBeVisible();
    await page.locator('#po-assign').click();
    await dialog.locator(`[data-shipper="${shipperId}"]`).click();
    await dialog.locator('#po-assign-ok').click();
    await expect(page.locator('#po-delivery')).toContainText(SHIPPER.username);
    await shot(page, 'giao-hang-don-da-giao-shipper');

    // Đơn thứ hai để shipper tự nhận
    await openOrder(page, failed.code, 'Chờ giao');
    await page.locator('#po-assign').click();
    await dialog.locator('#po-assign-pool').click();
    await dialog.locator('#po-assign-ok').click();
    await expect(page.locator('#po-delivery')).toContainText('chờ shipper tự nhận');
    w.assertClean();
  });

  test('Shipper trên điện thoại: vào thẳng trang giao hàng, nhận đơn, lấy hàng, đã giao thu tiền mặt, giao không được', async ({browser}) => {
    const page = await shipperPhone(browser);
    const w = watchErrors(page);
    await page.waitForURL(/\/shipper/, {timeout: 60_000});
    await page.waitForLoadState('networkidle');
    await expect(page.locator('.sp-bar')).toContainText('Giao hàng');
    await expect(page.locator('.sp-bar')).toContainText('Chi nhánh trung tâm');

    // Chờ nhận: đơn giao cho mình + đơn tự nhận
    await page.locator('#sp-tab-waiting').click();
    const mine = page.locator(`.sp-card[data-code="${delivered.code}"]`);
    const pool = page.locator(`.sp-card[data-code="${failed.code}"]`);
    await expect(mine).toContainText('Nhà thuốc giao cho bạn');
    await expect(pool).toContainText('120 Hai Bà Trưng');
    await expect(mine).toContainText(`Phải thu: ${delivered.total.toLocaleString('en-US')} đ`);
    await shot(page, 'giao-hang-shipper-cho-nhan');
    await mine.getByRole('button', {name: 'Nhận đơn'}).click();
    await expect(page.locator('#sp-tab-mine')).toHaveClass(/on/);
    await page.locator('#sp-tab-waiting').click();
    await pool.getByRole('button', {name: 'Nhận đơn'}).click();

    // Của tôi: 2 đơn đang lấy hàng, chọn sẵn → lấy hàng một lần
    await expect(page.locator('#sp-pickup')).toContainText('(2)');
    await shot(page, 'giao-hang-shipper-cua-toi');
    await page.locator('#sp-pickup').click();
    await expect(page.locator(`.sp-card[data-code="${delivered.code}"] .sp-chip`)).toHaveText('Đang giao');
    await expect(page.locator(`.sp-card[data-code="${failed.code}"] .sp-chip`)).toHaveText('Đang giao');

    // Phòng khám thấy đơn đang giao kèm tên shipper
    const clinic = await pwRequest.newContext({extraHTTPHeaders: {'X-Clinic-Key': clinicKey()}});
    const onRoad = await (await clinic.get(`${API}/clinic-api/orders/${delivered.code}`)).json();
    expect(onRoad.status).toBe('delivering');
    expect(onRoad.delivery.shipper_name).toBe(SHIPPER.username);

    // Chi tiết: gọi, chỉ đường, đã giao thu tiền mặt
    await page.locator(`.sp-card[data-code="${delivered.code}"]`).click();
    await expect(page.locator('.sp-bar')).toContainText(delivered.code);
    await expect(page.locator('#sp-call')).toHaveAttribute('href', 'tel:0283822000');
    await expect(page.locator('#sp-map')).toHaveAttribute('href', /google\.com\/maps\/search\/\?api=1&query=120%20Hai%20B/);
    await expect(page.locator('#sp-amount')).toHaveText(`${delivered.total.toLocaleString('en-US')} đ`);
    await shot(page, 'giao-hang-shipper-chi-tiet');
    await page.locator('#sp-deliver').click();
    await page.locator('#sp-deliver-ok').click();
    await expect(page.locator('.sp-error')).toHaveText('Chọn cách thu tiền.');
    await page.locator('#sp-m-cash').click();
    await page.locator('#sp-receiver').fill('Chị Lan lễ tân');
    await shot(page, 'giao-hang-shipper-xac-nhan-giao');
    await page.locator('#sp-deliver-ok').click();
    await expect(page).toHaveURL(/\/shipper\?tab=done/);
    await expect(page.locator(`.sp-card[data-code="${delivered.code}"]`)).toContainText('chưa nộp thu ngân');
    await expect(page.locator('#sp-holding')).toContainText('chưa nộp thu ngân');

    // Giao không được đơn thứ hai
    await page.locator('#sp-tab-mine').click();
    await page.locator(`.sp-card[data-code="${failed.code}"]`).click();
    await page.locator('#sp-fail').click();
    await page.locator('#sp-fail-ok').click();
    await expect(page.locator('.sp-error')).toHaveText('Chọn hoặc nhập lý do.');
    await page.locator('.sp-chips button', {hasText: 'Phòng khám đóng cửa'}).click();
    await page.locator('#sp-fail-note').fill('Gọi không ai nghe');
    await shot(page, 'giao-hang-shipper-giao-khong-duoc');
    await page.locator('#sp-fail-ok').click();
    await expect(page.locator(`.sp-card[data-code="${failed.code}"]`)).toContainText('Giao không được');

    const done = await (await clinic.get(`${API}/clinic-api/orders/${delivered.code}`)).json();
    expect(done.status).toBe('completed');
    expect(done.delivery.receiver_name).toBe('Chị Lan lễ tân');
    await clinic.dispose();
    w.assertClean();
    await page.context().close();
  });

  test('Nhà thuốc: đơn giao không được về Chờ giao, phòng khám tự lấy chuyển khoản; thu ngân nhận tiền shipper', async ({page}) => {
    const w = watchErrors(page);
    // Đơn đã giao: hiện thu tiền mặt, shipper đang giữ
    await openOrder(page, delivered.code, 'Hoàn thành');
    await expect(page.locator('#po-delivery')).toContainText('Đã giao');
    await expect(page.locator('#po-delivery')).toContainText('người nhận Chị Lan lễ tân');
    await expect(page.locator('#po-delivery')).toContainText('shipper đang giữ tiền');

    // Đơn giao không được: về Chờ giao kèm lý do; phòng khám tự lấy, chuyển khoản
    await openOrder(page, failed.code, 'Chờ giao');
    await expect(page.locator('.dt-alert.warn', {hasText: 'Giao không được'})).toContainText('Phòng khám đóng cửa');
    await shot(page, 'giao-hang-don-giao-khong-duoc');
    await page.locator('#po-self-pickup').click();
    const dialog = page.locator('mat-dialog-container');
    await expect(dialog.locator('h2')).toHaveText(`Phòng khám tự lấy ${failed.code}`);
    await dialog.locator('#po-complete-transfer').click();
    await dialog.locator('#po-complete-ok').click();
    await expect(page.locator('.dt-status')).toHaveText('Hoàn thành');
    const view = await (await staff.get(`${API}/prescription-order/${failed.id}`)).json();
    expect(view.invoice.debt).toBe(0);

    // Thu ngân: Tài chính › Tiền shipper đang giữ
    await open(page, '/transaction/shipper-cash');
    const row = page.locator(`.sc-row[data-shipper="${shipperId}"]`);
    await expect(row).toContainText(SHIPPER.username);
    await row.locator('.sc-open').click();
    await expect(page.locator('.sc-item', {hasText: delivered.code})).toBeVisible();
    await shot(page, 'giao-hang-thu-ngan-nhan-tien');
    await page.locator('#sc-receive').click();
    await expect(row).toHaveCount(0);
    await expect(page.locator('.po-table tr', {hasText: delivered.code}).first()).toContainText('Demo');
    w.assertClean();
  });
});
