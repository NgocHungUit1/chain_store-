import {test, expect, Page, APIRequestContext, request as pwRequest} from '@playwright/test';
import {execSync} from 'child_process';
import {randomUUID} from 'crypto';
import {resolve} from 'path';
import {open, watchErrors} from './helpers';

/**
 * Chuỗi › Phòng khám đối tác Phần 2 (pharma_chain/tools/de-xuat/phong-kham-doi-tac-phan-2.html, chốt 04/11/2026):
 * chính sách (chiết khấu tự trừ, khoá; hạn mức chỉ cảnh báo), hợp đồng có file + nhắc hết hạn, bốc thuốc, tab Đơn & doanh số, Bác sĩ.
 * Dùng PK0001 Minh Tâm (DocSoft pkminhtam). Khoá phòng khám lấy bằng lệnh console cấp lại khoá; cuối test cấp lại qua API để
 * khoá mới tự gắn sang DocSoft, trả chính sách về không chiết khấu / không hạn mức và xoá hợp đồng thử.
 */
const API = process.env.E2E_API_URL || 'http://127.0.0.1:33081/v1';
const PHARMA_CHAIN = resolve(__dirname, '../../../pharma_chain');
const ITEM = {product_id: 535320, unit_id: 622386, quantity: 2}; // có lô hợp lệ đủ tồn ở Chi nhánh trung tâm
const DOCTOR = 'minhtam.admin'; // tài khoản có trên DocSoft pkminhtam → tab Bác sĩ ghép đúng dòng

const shot = async (page: Page, name: string) => {
  await page.waitForTimeout(400);
  await page.screenshot({path: `test-results/screens/${name}.png`, fullPage: true});
};
const dialog = (page: Page) => page.locator('mat-dialog-container');
const ymd = (offsetDays: number) => {
  const d = new Date(Date.now() + offsetDays * 86400000);
  return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2);
};

async function staffApi(): Promise<APIRequestContext> {
  const login = await (await pwRequest.newContext()).post(API + '/auth/login', {data: {username: 'demo', password: 'Demo@123'}});
  const body = await login.json();
  const token = body.access_token || body.token || (body.data && body.data.access_token);
  return pwRequest.newContext({extraHTTPHeaders: {Authorization: 'Bearer ' + token}});
}

async function partnerPK0001(api: APIRequestContext) {
  const res = await api.get(API + '/clinic-partner?keyword=PK0001');
  const row = (await res.json()).items.find(r => r.code === 'PK0001');
  expect(row, 'Cần PK0001 Minh Tâm đã duyệt').toBeTruthy();
  return (await (await api.get(API + '/clinic-partner/' + row.id)).json());
}

/** Đưa PK0001 về không chiết khấu, không hạn mức, không hợp đồng */
async function resetPolicy(api: APIRequestContext, p: any) {
  if (p.discount_percent || p.debt_limit !== null) {
    await api.post(API + `/clinic-partner/${p.id}/policy`, {data: {discount_percent: '', debt_limit: '', note: 'E2E dọn dữ liệu'}});
  }
  for (const c of p.contracts || []) {
    await api.post(API + `/clinic-partner/${p.id}/contract-delete`, {data: {contract_id: c.id}});
  }
}

test('Phòng khám đối tác Phần 2: chính sách, hợp đồng, bốc thuốc tự trừ chiết khấu + cảnh báo hạn mức, thống kê, bác sĩ', async ({page}) => {
  test.setTimeout(240_000);
  const w = watchErrors(page);
  const api = await staffApi();
  let p = await partnerPK0001(api);
  expect(p.status).toBe('active');
  await resetPolicy(api, p);

  try {
    // 1. Sửa chính sách: chiết khấu 5%, hạn mức nợ rất thấp để chắc chắn vượt
    await open(page, `/chain/clinic-partner/${p.id}?tab=policy`);
    await expect(page.locator('#cp-tab-policy')).toHaveClass(/active/);
    await page.locator('#cp-edit-policy').click();
    await page.locator('#pl-discount').fill('5');
    await page.locator('#pl-limit').fill('1000');
    await page.locator('#pl-note').fill('E2E theo phụ lục 01');
    await shot(page, 'pkdt2-sua-chinh-sach');
    await page.locator('#pl-submit').click();
    await expect(page.locator('.notifier__notification', {hasText: 'Đã lưu chính sách'})).toBeVisible();
    const policyCard = page.locator('.dt-info', {hasText: 'Chính sách'}).first();
    await expect(policyCard).toContainText('5%');
    await expect(policyCard).toContainText(/1[.,]000 đ/);
    await expect(policyCard).toContainText('Chiết khấu không → 5%');

    // 2. Thêm hợp đồng còn 10 ngày, kèm file PDF → nhắc sắp hết hạn
    const contractNo = 'HD-E2E-' + Date.now().toString().slice(-5);
    await page.locator('#cp-add-contract').click();
    await page.locator('#ct-no').fill(contractNo);
    await page.locator('#ct-from').fill(ymd(-355));
    await page.locator('#ct-to').fill(ymd(10));
    await page.locator('#ct-file').setInputFiles({name: 'hop-dong-e2e.pdf', mimeType: 'application/pdf',
      buffer: Buffer.from('%PDF-1.4\n1 0 obj<</Type/Catalog>>endobj\ntrailer<</Root 1 0 R>>\n%%EOF\n')});
    await shot(page, 'pkdt2-them-hop-dong');
    await page.locator('#ct-submit').click();
    const contractRow = page.locator('.cp-ct-table tbody tr', {hasText: contractNo});
    await expect(contractRow).toContainText('Sắp hết hạn');
    await expect(contractRow.locator('.cp-file-link')).toContainText('hop-dong-e2e.pdf');
    await expect(page.locator('.dt-alert.warn', {hasText: 'Hợp đồng hết hạn ngày'})).toBeVisible();
    // Mở file: tải qua API có đăng nhập (Bearer), mở ở tab mới. Chrome headless không có trình xem PDF nên chỉ kiểm file trả về
    const [popup, file] = await Promise.all([page.waitForEvent('popup'),
      page.waitForResponse(r => r.url().includes('/contract-file')), contractRow.locator('.cp-file-link').click()]);
    expect(file.status()).toBe(200);
    expect(file.headers()['content-type']).toContain('application/pdf');
    expect((await file.body()).toString().startsWith('%PDF')).toBeTruthy();
    await popup.close();
    await shot(page, 'pkdt2-chinh-sach-hop-dong');

    // 3. Danh sách: nhãn hết hạn hợp đồng, lọc "Sắp / hết hạn hợp đồng", cột Còn nợ
    await open(page, '/chain/clinic-partner?tab=active');
    const listRow = page.locator('.po-table tbody tr', {hasText: 'Phòng khám Đa khoa Minh Tâm'});
    await expect(listRow.locator('.cp-ct-chip')).toContainText('HĐ hết hạn');
    await page.locator('#cp-filter-contract').click();
    await expect(page.locator('.po-table tbody tr.po-row')).toHaveCount(1);
    await shot(page, 'pkdt2-danh-sach-loc-hop-dong');

    // 4. Phòng khám gửi đơn (khoá mới cấp bằng lệnh console)
    const out = execSync(`php yii clinic-link/rotate-key --id=${p.clinic_link_id}`, {cwd: PHARMA_CHAIN}).toString();
    const key = (out.match(/ck_[A-Za-z0-9_-]+/) || [])[0];
    expect(key, out).toBeTruthy();
    const clinic = await pwRequest.newContext({extraHTTPHeaders: {'X-Clinic-Key': key}});
    const created = await clinic.post(API + '/clinic-api/orders', {data: {
      client_order_id: randomUUID(), doctor: {code: DOCTOR, name: 'BS. Minh Tâm'},
      patient: {name: 'Phan Văn Chiết Khấu', phone: '0912000111'}, items: [ITEM],
    }});
    expect(created.status(), await created.text()).toBe(201);
    const {code, total_quote: quote} = await created.json();

    // 5. Nhà thuốc mở đơn: cảnh báo vượt hạn mức + thông tin chiết khấu; Xác nhận hỏi lại nhưng vẫn cho
    await open(page, '/transaction/prescription-order');
    await page.getByPlaceholder('Mã đơn, bệnh nhân, SĐT, bác sĩ, phòng khám').fill(code);
    await page.locator('.po-row', {hasText: code}).click();
    await expect(page.locator('#po-credit-warn')).toContainText('vượt hạn mức');
    await expect(page.locator('.dt-alert.info', {hasText: 'chiết khấu'})).toContainText('5%');
    await shot(page, 'pkdt2-don-canh-bao-han-muc');
    const detailUrl = page.url();
    await page.getByRole('button', {name: 'Xác nhận'}).click();
    const warn = page.locator('mat-dialog-container');
    await expect(warn.locator('h2')).toHaveText('Vượt hạn mức nợ');
    await expect(warn.locator('#po-warn-message')).toContainText('vượt hạn mức');
    await shot(page, 'pkdt2-hop-canh-bao-han-muc');
    await warn.locator('#po-warn-ok').click();
    await expect(page.locator('.dt-status')).toHaveText('Đã xác nhận');

    // 6. Bốc thuốc: tự áp 5%, ô giảm giá khoá, cảnh báo hạn mức; lưu được
    await page.getByRole('button', {name: 'Bốc thuốc'}).click();
    await expect(page).toHaveURL(/\/sale/, {timeout: 60_000});
    await expect(page.locator('.po-pick-banner').first()).toContainText('Chiết khấu phòng khám 5%', {timeout: 60_000});
    await expect(page.locator('#sale-credit-warn')).toContainText('vượt hạn mức');
    await page.waitForTimeout(2_000); // chờ nạp lô + giá
    // Giảm đúng 5% tiền hàng (thu khác tự động của cửa hàng, nếu có, không bị giảm)
    await expect(page.locator('input.price-discount-value')).toHaveValue(new RegExp('^' + Math.round(quote * 0.05).toLocaleString('en-US')
      .replace(/,/g, '[.,]') + '$'));
    await page.locator('input.price-discount-value').click();
    await expect(page.locator('.notifier__notification', {hasText: 'không sửa được'})).toBeVisible();
    await expect(dialog(page)).toHaveCount(0);
    await shot(page, 'pkdt2-boc-thuoc-chiet-khau');
    await page.getByRole('button', {name: 'Thanh toán (F7)'}).click();
    await expect(page.locator('.notifier__notification', {hasText: /thành công/i}).first()).toBeVisible({timeout: 30_000});

    // 7. Hoá đơn lưu được (server kiểm giảm đúng %); phòng khám thấy cùng số tiền qua API
    await page.goto(detailUrl);
    await expect(page.locator('.dt-status')).toHaveText('Đang soạn thuốc');
    const orderId = detailUrl.split('/').pop();
    const detail = await (await api.get(API + '/prescription-order/' + orderId)).json();
    expect(detail.invoice.total).toBeGreaterThan(0);
    const clinicView = await (await clinic.get(API + '/clinic-api/orders/' + code)).json();
    expect(clinicView.invoice_total).toBe(detail.invoice.total);
    const month = ymd(0).slice(0, 7);
    const statement = await (await clinic.get(API + '/clinic-api/statement?month=' + month)).json();
    expect(statement.invoices.map(i => i.invoice_no)).toContain(detail.invoice.invoice_no);
    expect(statement.doctors.find(d => d.code === DOCTOR).orders).toBeGreaterThanOrEqual(1);

    // 8. Tab Đơn & doanh số, Bác sĩ
    await open(page, `/chain/clinic-partner/${p.id}?tab=orders`);
    const monthRow = page.locator('.po-table tbody tr').first();
    await expect(monthRow).toContainText(month.split('-').reverse().join('/'));
    await shot(page, 'pkdt2-don-doanh-so');
    await page.locator('#cp-tab-doctors').click();
    const doctorRow = page.locator('.po-table tbody tr', {hasText: DOCTOR});
    await expect(doctorRow).toBeVisible();
    await expect(doctorRow.locator('td.num').first()).not.toHaveText('0');
    await shot(page, 'pkdt2-bac-si');
  } finally {
    // Dọn: chính sách về không, xoá hợp đồng thử, cấp khoá mới tự gắn sang DocSoft
    p = await partnerPK0001(api);
    await resetPolicy(api, p);
    const rotated = await api.post(API + `/clinic-partner/${p.id}/rotate-key`);
    expect((await rotated.json()).warning || '').toBe('');
  }
  w.assertClean();
});
