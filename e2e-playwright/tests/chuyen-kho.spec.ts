import {test, expect, Page, Browser, request as pwRequest, APIRequestContext} from '@playwright/test';
import {open, watchErrors} from './helpers';

/**
 * Chuyển kho theo lô, gửi / nhận hai bước (chốt 06/11/2026). Chạy bằng tài khoản thử e2ekho (Store.Admin, tạo bởi
 * pharma_chain/tools/chi-nhanh/kiem-tra-chuyen-kho.py) để đổi chi nhánh làm việc mà không đụng phiên demo của người test tay.
 * Thuốc ZMULTI (2 lô L1 150, L2 200 ở Chi nhánh trung tâm). Cuối test chuyển trả hàng về để số liệu không đổi qua các lần chạy.
 * Kịch bản số liệu chi tiết (trừ đúng dòng lô, huỷ trả lại, nhận thiếu, bán lô nhận về): kiem-tra-chuyen-kho.py.
 */
const shot = (page: Page, name: string) => page.screenshot({path: `test-results/screens/${name}.png`});
const API = process.env.E2E_API_URL || 'http://127.0.0.1:33081/v1';
const USER = 'e2ekho';
const PRODUCT = {id: 535321, no: 'ZMULTI'};

async function apiAs(user: string): Promise<APIRequestContext> {
  const login = await (await pwRequest.newContext()).post(API + '/auth/login', {data: {username: user, password: 'Demo@123'}});
  const body = await login.json();
  return pwRequest.newContext({extraHTTPHeaders: {Authorization: 'Bearer ' + (body.access_token || body.token)}});
}

async function switchBranch(api: APIRequestContext, branchId: number) {
  const res = await api.post(API + '/user/update-branch-login', {data: {branch_store_id: branchId}});
  expect(await res.json(), 'Đổi chi nhánh e2ekho').toBe(true);
}

/** Trang đăng nhập bằng e2ekho (không dùng phiên demo chung) */
async function loginPage(browser: Browser): Promise<Page> {
  const context = await browser.newContext({storageState: undefined});
  const page = await context.newPage();
  await page.goto('/authentication/login', {waitUntil: 'networkidle', timeout: 120_000});
  await page.locator('input[type="text"], input:not([type])').first().fill(USER);
  await page.locator('input[type="password"]').fill('Demo@123');
  await page.getByRole('button', {name: 'Đăng nhập'}).click();
  await page.waitForURL(url => !url.pathname.includes('/authentication'), {timeout: 60_000});
  return page;
}

async function branches(api: APIRequestContext) {
  const list = await (await api.get(API + '/branch?fields=id,name,status')).json();
  const central = list.find(b => b.name === 'Chi nhánh trung tâm');
  const other = list.find(b => b.id !== central.id && b.status === 10);
  expect(central && other, 'Cần Chi nhánh trung tâm và một chi nhánh khác đang hoạt động').toBeTruthy();
  return {central, other};
}

async function lots(api: APIRequestContext) {
  return (await (await api.get(API + '/move/lots?product_id=' + PRODUCT.id)).json()) as any[];
}

test('Chuyển kho theo lô: tự chia lô, xuất chuyển, chi nhánh nhận kiểm đếm và nhận hàng', async ({browser}) => {
  test.setTimeout(180_000);
  const api = await apiAs(USER);
  const {central, other} = await branches(api);
  await switchBranch(api, central.id);
  const before = await lots(api);
  const l1 = before.find(l => l.parcel_no === 'L1');
  expect(l1 && l1.stock >= 150, 'ZMULTI lô L1 ở trung tâm còn ≥ 150').toBeTruthy();

  const page = await loginPage(browser);
  const w = watchErrors(page);
  let moveId: number = null;
  try {
    // 1. Lập phiếu: 160 viên → tự chia L1 150 (hết hạn trước) + L2 10
    await open(page, '/transaction/move/create');
    await page.getByPlaceholder('Tìm hàng hóa theo mã hoặc tên').fill(PRODUCT.no);
    await page.locator('mat-option', {hasText: PRODUCT.no}).first().click();
    const lotRows = page.locator('.mc-lot');
    await expect(lotRows).toHaveCount(1);
    await page.locator('input.amount').fill('160');
    await expect(lotRows).toHaveCount(2);
    await expect(lotRows.nth(0)).toContainText('L1');
    await expect(lotRows.nth(0).locator('input.mc-lot-qty')).toHaveValue('150');
    await expect(lotRows.nth(1)).toContainText('L2');
    await expect(lotRows.nth(1).locator('input.mc-lot-qty')).toHaveValue('10');
    await expect(page.locator('.mc-lot-error')).toHaveCount(0);

    // Sửa tay sai tổng → báo đỏ, khoá Xuất chuyển; Tự chọn lô chia lại
    await lotRows.nth(1).locator('input.mc-lot-qty').fill('5');
    await expect(page.locator('.mc-lot-error')).toContainText('Đã chọn 155 / cần 160');
    await expect(page.getByRole('button', {name: /Xuất chuyển/})).toBeDisabled();
    await page.getByRole('button', {name: /Tự chọn lô/}).click();
    await expect(page.locator('.mc-lot-error')).toHaveCount(0);

    await page.locator('mat-select[formcontrolname="branch_to"]').click();
    await page.locator('mat-option', {hasText: other.name}).click();
    await shot(page, 'chuyen-kho-lap-phieu');
    await page.getByRole('button', {name: /Xuất chuyển/}).click();
    const confirm = page.locator('mat-dialog-container');
    await expect(confirm).toContainText('trừ tồn và lô ở chi nhánh này');
    await page.waitForTimeout(400); // hộp còn đang hiện dần
    await shot(page, 'chuyen-kho-xac-nhan-xuat');
    await confirm.getByRole('button', {name: /Xuất chuyển/}).click();
    await expect(page.locator('.notifier__notification', {hasText: 'Đã xuất chuyển'})).toBeVisible();
    await expect(page).toHaveURL(/\/transaction\/move$/);

    const sent = await (await api.get(API + '/move?MoveSearch[status]=5&sort=-id&per-page=1')).json();
    moveId = Number(sent[0].id);
    const moveNo = sent[0].no;
    const afterSend = await lots(api);
    expect(afterSend.find(l => l.parcel_no === 'L1'), 'L1 đã xuất hết khỏi trung tâm').toBeUndefined();

    // Ở chi nhánh gửi: phiếu Đang chuyển, có Huỷ chuyển, không có Nhận hàng
    await open(page, '/transaction/move');
    await page.locator('tr.example-element-row', {hasText: moveNo}).first().click();
    const detail = page.locator('tr.example-expanded-row + tr');
    await expect(detail).toContainText('Đang chuyển');
    await expect(detail.getByRole('button', {name: /Huỷ chuyển/})).toBeVisible();
    await expect(detail.getByRole('button', {name: /Nhận hàng/})).toHaveCount(0);

    // 2. Chi nhánh nhận: kiểm đếm, thử nhập thiếu, rồi nhận đủ
    await switchBranch(api, other.id);
    await page.reload({waitUntil: 'networkidle'});
    await page.locator('tr.example-element-row', {hasText: moveNo}).first().click();
    await expect(detail).toContainText('kiểm đếm rồi bấm "Nhận hàng"');
    await expect(detail).toContainText('L1');
    await page.waitForTimeout(400); // dòng chi tiết mở có hiệu ứng, chờ xong mới chụp
    await shot(page, 'chuyen-kho-cho-nhan');
    await detail.getByRole('button', {name: /Nhận hàng/}).click();
    const dialog = page.locator('mat-dialog-container');
    await expect(dialog).toContainText('Nhận hàng ' + moveNo);
    const qtyL2 = dialog.locator('tr', {hasText: 'L2'}).locator('input.mr-qty');
    await qtyL2.fill('8');
    await expect(dialog.locator('.mr-warn')).toContainText('Nhận thiếu 2');
    await page.waitForTimeout(400);
    await shot(page, 'chuyen-kho-nhan-thieu');
    await qtyL2.fill('11');
    await expect(dialog.locator('.mr-error')).toBeVisible();
    await expect(dialog.getByRole('button', {name: /Xác nhận nhận hàng/})).toBeDisabled();
    await qtyL2.fill('10');
    await dialog.getByRole('button', {name: /Xác nhận nhận hàng/}).click();
    await expect(page.locator('.notifier__notification', {hasText: 'Đã nhận hàng'})).toBeVisible();
    await page.locator('tr.example-element-row', {hasText: moveNo}).first().click();
    await expect(detail).toContainText('Đã nhận');
    await expect(detail).toContainText('/ nhận 150');
    await page.waitForTimeout(400); // dòng chi tiết mở có hiệu ứng, chờ xong mới chụp
    await shot(page, 'chuyen-kho-da-nhan');

    const atOther = await lots(api);
    expect(atOther.find(l => l.parcel_no === 'L1').stock, 'B có lô L1').toBeGreaterThanOrEqual(150);
    w.assertClean();
  } finally {
    // Trả hàng về trung tâm (API) để lần chạy sau dữ liệu như cũ
    if (moveId !== null) {
      await switchBranch(api, other.id);
      const unit = 622387;
      const back = await api.post(API + '/move', {data: {branch_from: other.id, branch_to: central.id, status: 5, note: 'e2e trả về',
          items: [{product_id: PRODUCT.id, product_unit_id: unit, amount: 160,
            parcels: [{parcel_no: 'L1', expiration_date: '2028-01-01', quantity: 150}, {parcel_no: 'L2', expiration_date: '2029-01-01', quantity: 10}]}]}});
      const backMove = await back.json();
      await switchBranch(api, central.id);
      if (backMove && backMove.id) {
        await api.post(API + '/move/receive', {data: {id: backMove.id}});
      }
    }
    await switchBranch(api, central.id);
    await page.context().close();
  }
});

test('Chuyển kho: chi nhánh gửi huỷ phiếu đang chuyển, lô trả lại', async ({browser}) => {
  const api = await apiAs(USER);
  const {central, other} = await branches(api);
  await switchBranch(api, central.id);
  const before = (await lots(api)).find(l => l.parcel_no === 'L1').stock;
  const created = await (await api.post(API + '/move', {data: {branch_from: central.id, branch_to: other.id, status: 5,
      items: [{product_id: PRODUCT.id, product_unit_id: 622387, amount: 2, parcels: [{parcel_no: 'L1', expiration_date: '2028-01-01', quantity: 2}]}]}})).json();
  expect(created.status, 'Tạo phiếu xuất chuyển').toBe(5);

  const page = await loginPage(browser);
  const w = watchErrors(page);
  try {
    await open(page, '/transaction/move');
    await page.locator('tr.example-element-row', {hasText: created.no}).first().click();
    const detail = page.locator('tr.example-expanded-row + tr');
    await detail.getByRole('button', {name: /Huỷ chuyển/}).click();
    const confirm = page.locator('mat-dialog-container');
    await expect(confirm).toContainText('trả lại chi nhánh này');
    await confirm.getByRole('button', {name: /Huỷ chuyển/}).click();
    await expect(page.locator('.notifier__notification', {hasText: 'Đã huỷ phiếu chuyển'})).toBeVisible();
    await page.locator('tr.example-element-row', {hasText: created.no}).first().click();
    await expect(detail).toContainText('Đã huỷ');
    await page.waitForTimeout(400); // dòng chi tiết mở có hiệu ứng, chờ xong mới chụp
    await shot(page, 'chuyen-kho-da-huy');
    expect((await lots(api)).find(l => l.parcel_no === 'L1').stock, 'L1 trả lại đủ').toBe(before);
    w.assertClean();
  } finally {
    await page.context().close();
  }
});
