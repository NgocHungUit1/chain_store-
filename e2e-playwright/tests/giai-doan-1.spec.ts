import {test, expect, request} from '@playwright/test';
import {open, watchErrors} from './helpers';

/**
 * Kiểm thử giao diện các việc giai đoạn 1 (4 đợt) trên dữ liệu cửa hàng demo (store 510).
 * Chủ yếu đọc/mở màn hình; không tạo dữ liệu mới trừ khi ghi rõ.
 * Ảnh từng màn lưu ở test-results/screens/ để xem lại.
 */
const shot = (name: string) => ({path: `test-results/screens/${name}.png`, fullPage: false});

test('Đợt 1 – /adminer phải đăng nhập', async () => {
  const ctx = await request.newContext();
  const res = await ctx.get('http://localhost:33080/adminer', {maxRedirects: 0});
  expect(res.status()).toBe(302);
  expect(res.headers()['location']).toContain('/site/login');
  await ctx.dispose();
});

test('Đợt 2 + 4 – Dashboard: hàng dưới định mức, doanh thu theo quý, so cùng kỳ', async ({page}) => {
  const w = watchErrors(page);
  await open(page, '/dashboard');
  await expect(page.getByText('dưới định mức tồn')).toBeVisible();
  // Mặc định là HÔM NAY: ngày chưa có giao dịch thì biểu đồ rỗng, không có chú thích -> chọn NĂM NAY
  await page.locator('mat-select.dash-panel-select').first().click();
  await page.getByRole('option', {name: 'NĂM NAY'}).click();
  await page.getByText('Theo quý', {exact: true}).click();
  await page.getByText('So cùng kỳ năm trước').click();
  await expect(page.getByText('Bán hàng cùng kỳ năm trước').first()).toBeVisible();
  await page.screenshot(shot('dashboard'));
  w.assertClean();
});

test('Đợt 2 – Chuông thông báo có cảnh báo tồn thấp/hạn dùng', async ({page}) => {
  const w = watchErrors(page);
  await open(page, '/dashboard');
  await page.locator('button:has(mat-icon:text("notifications")), button:has(mat-icon:text("notifications_none"))').first().click();
  await expect(page.getByText(/lô (sẽ hết hạn|đã hết hạn)|thiếu định mức/).first()).toBeVisible();
  await page.screenshot(shot('chuong'));
  w.assertClean();
});

test('Đợt 2 + 3 + 4 – Cài đặt: mốc hạn dùng, lý do trả hàng, hạng thành viên', async ({page}) => {
  const w = watchErrors(page);
  await open(page, '/setting/common/transaction');
  await expect(page.getByText('Mốc cảnh báo hạn dùng')).toBeVisible();
  await expect(page.getByText('Lý do trả hàng', {exact: true})).toBeVisible();
  await expect(page.getByText('Dị ứng hoặc phản ứng phụ')).toBeVisible();
  await expect(page.getByText('Hạng thành viên', {exact: true})).toBeVisible();
  await expect(page.locator('table.tier-table input').first()).toBeVisible();
  await page.getByText('Hạng thành viên', {exact: true}).scrollIntoViewIfNeeded();
  await page.screenshot(shot('cai-dat'));

  // Thu gọn nhóm: ẩn nội dung, đầu nhóm hiện tóm tắt; mở lại thì nội dung quay về
  const lot = page.locator('.st-card.st-c-lot');
  await lot.locator('.st-card-head').click();
  await expect(lot).toHaveClass(/st-closed/);
  await expect(page.getByText('Mốc cảnh báo hạn dùng')).toHaveCount(0);
  await expect(lot.locator('.st-summary')).toContainText(/FEFO|FIFO/);
  await lot.locator('.st-card-head').click();
  await expect(page.getByText('Mốc cảnh báo hạn dùng')).toBeVisible();
  // Menu trái: mục đang chọn được làm nổi
  await expect(page.locator('.radio-button-report-type.mat-radio-checked')).toContainText('Giao dịch');
  w.assertClean();
});

test('Đợt 3 + 4 – Bán hàng: cảnh báo dị ứng, hạng khách, tìm theo hoạt chất', async ({page}) => {
  const w = watchErrors(page);
  // Màn bán hàng gọi API liên tục nên không chờ networkidle, chờ ô tìm khách hiện ra
  await page.goto('/sale', {timeout: 120_000});
  // Angular Material đưa placeholder thành nhãn nổi -> chọn theo class
  const customer = page.locator('input.input-search-customer');
  await expect(customer).toBeVisible({timeout: 60_000});
  await customer.fill('Khách thử');
  await page.getByRole('option', {name: /Khách thử dị ứng/}).first().click();
  await expect(page.locator('.customer-health-warning')).toContainText('Dị ứng');
  await expect(page.locator('.customer-tier')).toContainText('Hạng');

  const product = page.locator('input.input-search-product');
  await expect(page.getByText(/Tìm tên, mã, hoạt chất/).first()).toBeVisible();
  await product.fill('123123');
  await expect(page.getByRole('option', {name: /ZFIX2B/}).first()).toBeVisible();
  await page.screenshot(shot('ban-hang'));
  await page.keyboard.press('Escape');
  w.assertClean();
});

test('Đợt 3 – Danh sách trả hàng có cột và bộ lọc lý do', async ({page}) => {
  const w = watchErrors(page);
  await open(page, '/transaction/returns');
  await expect(page.getByRole('columnheader', {name: 'Lý do trả'})).toBeVisible();
  await page.screenshot(shot('tra-hang'));
  w.assertClean();
});

test('Đợt 3 – Chi tiết hoá đơn có nút In phiếu tư vấn', async ({page}) => {
  const w = watchErrors(page);
  await open(page, '/transaction/invoice');
  await page.locator('tr.mat-row, tr.mat-mdc-row, tr[mat-row]').first().click();
  await expect(page.getByRole('button', {name: /In phiếu tư vấn/}).first()).toBeVisible();
  await page.screenshot(shot('hoa-don'));

  // Nút In ở danh sách in theo mẫu (iframe, cùng khung với màn bán hàng), không mở cửa sổ kiểu in cũ
  const detail = page.locator('tr.example-expanded-row + tr');
  let popup = false;
  page.context().once('page', () => popup = true);
  await detail.locator('button').filter({has: page.locator('mat-icon', {hasText: /^print$/})}).click();
  const frame = page.locator('iframe[srcdoc]').last();
  await frame.waitFor({state: 'attached'});
  const html = await frame.getAttribute('srcdoc');
  expect(html).toContain('Tổng thanh toán');
  expect(html).toContain('Bằng chữ');
  expect(popup).toBe(false);

  // Phiếu tư vấn theo khuôn DocSoft
  const frames = page.locator('iframe[srcdoc]');
  const before = await frames.count();
  await detail.getByRole('button', {name: /In phiếu tư vấn/}).click();
  await expect(frames).toHaveCount(before + 1);
  const consult = await frames.last().getAttribute('srcdoc');
  expect(consult).toContain('Phiếu tư vấn dùng thuốc');
  expect(consult).toContain('Cách dùng:');
  w.assertClean();
});

test('Đợt 4 – Tra cứu thu hồi theo lô', async ({page}) => {
  const w = watchErrors(page);
  await open(page, '/follow-book/medicine-recall');
  await page.getByRole('button', {name: /Tra cứu lô/}).click();
  const dialog = page.locator('mat-dialog-container');
  await dialog.getByLabel('Thuốc').fill('Cefixim');
  await page.getByRole('option', {name: /Cefixim/}).first().click();
  // Danh sách lô tải sau khi chọn thuốc; mở ô quá sớm thì ra rỗng -> đóng và mở lại tới khi có lô
  const lot = page.getByRole('option', {name: /^ ?20002/}).first();
  await expect(async () => {
    if (await page.locator('.mat-select-panel').count()) {
      await page.keyboard.press('Escape');
    }
    await dialog.locator('mat-select').click();
    await expect(lot).toBeVisible({timeout: 2_000});
  }).toPass({timeout: 30_000});
  await lot.click();
  await dialog.getByRole('button', {name: /Tra cứu/}).click();
  await expect(dialog.locator('.summary')).toContainText('đã bán');
  await expect(dialog.locator('.summary')).toContainText('11');
  await page.screenshot(shot('tra-cuu-lo'));
  w.assertClean();
});

test('Đợt 4 – Xuất huỷ: danh sách và form không có nhà cung cấp', async ({page}) => {
  const w = watchErrors(page);
  await open(page, '/transaction/warehouse-destroy');
  await expect(page.getByText('Danh sách phiếu xuất huỷ')).toBeVisible();
  await page.getByRole('button', {name: /Lập phiếu huỷ/}).click();
  await page.waitForURL(/warehouse-destroy\/create/);
  await page.waitForLoadState('networkidle');
  await expect(page.getByText('Phiếu xuất huỷ').first()).toBeVisible();
  await expect(page.getByText('Lý do huỷ')).toBeVisible();
  await expect(page.getByText('Ngày huỷ')).toBeVisible();
  await expect(page.getByPlaceholder('Nhà cung cấp')).toHaveCount(0);
  await expect(page.locator('input[formcontrolname="no"]')).toHaveValue(/^XH0/);
  await page.screenshot(shot('xuat-huy'));
  w.assertClean();
});

test('Đợt 4 – Báo cáo vòng quay tồn kho', async ({page}) => {
  const w = watchErrors(page);
  await open(page, '/report/inventory-turnover');
  await expect(page.getByText('Vòng quay hàng tồn kho')).toBeVisible();
  await expect(page.locator('.turnover-table tbody tr').first()).toBeVisible();
  await page.getByText('Theo nhóm hàng').click();
  await expect(page.locator('.turnover-table th', {hasText: 'Số mặt hàng'})).toBeVisible();
  await expect(page.locator('.turnover-table td', {hasText: 'Chưa phân nhóm'})).toHaveCount(1);
  await page.screenshot(shot('vong-quay'));
  w.assertClean();
});

test('Đợt 4 – Danh sách khách có cột Hạng', async ({page}) => {
  const w = watchErrors(page);
  await open(page, '/partner/customer');
  await expect(page.getByRole('columnheader', {name: 'Hạng'})).toBeVisible();
  await page.screenshot(shot('khach-hang'));
  w.assertClean();
});

test('Đợt 3 – Khách: tìm theo bệnh nền, form chia nhóm, dị ứng/bệnh nền dạng thẻ', async ({page}) => {
  const w = watchErrors(page);
  await open(page, '/partner/customer');
  const search = page.getByPlaceholder(/Tìm tên, SĐT, bệnh nền/);
  await search.fill('Tăng huyết áp');
  const row = page.locator('tr.example-element-row', {hasText: 'Khách thử dị ứng'});
  await expect(row).toBeVisible();

  // Form thêm mới: có đủ nhóm, thêm thẻ bằng Enter và bằng gợi ý, bỏ qua không lưu
  await page.getByRole('button', {name: /Thêm mới/}).click();
  const dlg = page.locator('mat-dialog-container');
  await expect(dlg.getByRole('heading', {name: 'Thêm khách hàng'})).toBeVisible();
  for (const t of ['Thông tin cá nhân', 'Sức khoẻ', 'Liên hệ & địa chỉ', 'Doanh nghiệp & ghi chú']) {
    await expect(dlg.locator('.cf-title', {hasText: t})).toBeVisible();
  }
  await dlg.getByPlaceholder('VD: Penicillin').fill('Amoxicillin');
  await dlg.getByPlaceholder('VD: Penicillin').press('Enter');
  await dlg.locator('.cf-suggest-btn', {hasText: 'Tăng huyết áp'}).click();
  await expect(dlg.locator('.cf-chip-danger', {hasText: 'Amoxicillin'})).toBeVisible();
  await expect(dlg.locator('.cf-chip-warn', {hasText: 'Tăng huyết áp'})).toBeVisible();
  await page.screenshot(shot('khach-form-them'));
  await dlg.getByRole('button', {name: 'Bỏ qua'}).click();
  await expect(dlg).toHaveCount(0);

  // Sửa khách mẫu: thẻ hiện đúng dữ liệu cũ; thêm 1 dị ứng, lưu, rồi bỏ đi để trả dữ liệu về như cũ
  await row.click();
  await page.getByRole('button', {name: /Cập nhật/}).first().click();
  await expect(dlg.getByRole('heading', {name: 'Cập nhật khách hàng'})).toBeVisible();
  await expect(dlg.locator('.cf-chip-danger', {hasText: 'Penicillin'})).toBeVisible();
  await expect(dlg.locator('.cf-chip-danger', {hasText: 'Aspirin'})).toBeVisible();
  await expect(dlg.locator('.cf-chip-warn', {hasText: 'Tăng huyết áp'})).toBeVisible();
  await dlg.locator('.cf-suggest-btn', {hasText: 'Sulfamid'}).first().click();
  await page.screenshot(shot('khach-form-sua'));
  const saved = page.waitForResponse(r => r.url().includes('/v1/customer/') && r.request().method() === 'PUT');
  await dlg.getByRole('button', {name: 'Lưu thay đổi'}).click();
  expect((await (await saved).json())['drug_allergy']).toBe('Penicillin; Aspirin; Sulfamid');

  await page.getByRole('button', {name: /Cập nhật/}).first().click();
  await dlg.locator('.cf-chip-danger', {hasText: 'Sulfamid'}).locator('mat-icon').click();
  const restored = page.waitForResponse(r => r.url().includes('/v1/customer/') && r.request().method() === 'PUT');
  await dlg.getByRole('button', {name: 'Lưu thay đổi'}).click();
  expect((await (await restored).json())['drug_allergy']).toBe('Penicillin; Aspirin');
  w.assertClean();
});
