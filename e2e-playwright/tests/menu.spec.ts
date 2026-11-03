import {test, expect, Page} from '@playwright/test';
import {open, watchErrors} from './helpers';

/**
 * Menu nhà thuốc sắp xếp lại 03/11/2026 (pharma_chain/tools/de-xuat/sap-xep-menu.html): 8 menu + 2 nút Nhập hàng / Quầy bán,
 * mục con nằm ở module cũ vẫn mở đúng đường dẫn cũ; Sổ sách, Sổ kế toán HKD ẩn tạm.
 */
const bar = (page: Page) => page.locator('#snav .main-menu > mat-list-item > .mat-list-item-content > a');
const topLink = (page: Page, name: string) => bar(page).filter({hasText: new RegExp('^\\s*\\S+\\s*' + name + '\\s*\\S*\\s*$')}).first();

test('Menu: đúng nhóm theo việc, hai nút bên phải, sổ sách ẩn, mục con mở đúng màn cũ', async ({page}) => {
  const w = watchErrors(page);
  await open(page, '/dashboard');
  const names = (await bar(page).allInnerTexts()).map(t => t.replace(/keyboard_arrow_down|\n/g, ' ').replace(/^\s*\S+\s+/, '').trim());
  expect(names).toEqual(['Tổng quan', 'Bán hàng', 'Hàng hóa & kho', 'Mua hàng', 'Tài chính', 'Chuỗi', 'Báo cáo', 'Thiết lập', 'Nhập hàng', 'Quầy bán']);
  await expect(page.locator('#snav').getByText('Sổ sách', {exact: true})).toHaveCount(0);
  await expect(page.locator('#snav').getByText('Đối tác', {exact: true})).toHaveCount(0);

  // Nút hành động nằm sát phải thanh menu
  const sale = await topLink(page, 'Quầy bán').boundingBox();
  expect(sale.x + sale.width).toBeGreaterThan(1440 - 60);

  // Mục con ở module khác giữ URL cũ, menu cha được tô
  const cases: [string, string, RegExp][] = [
    ['Bán hàng', 'Khách hàng', /\/partner\/customer/],
    ['Hàng hóa & kho', 'Thu hồi thuốc', /\/follow-book\/medicine-recall/],
    ['Mua hàng', 'Hóa đơn nhập', /\/transaction\/warehouse(\?|$)/],
    ['Tài chính', 'Công nợ nhà cung cấp', /\/report\/debt-suppliers/],
  ];
  for (const [parent, child, url] of cases) {
    await topLink(page, parent).hover();
    await page.locator('#snav .sub-item a', {hasText: child}).first().click();
    await expect(page).toHaveURL(url);
    await page.waitForLoadState('networkidle');
    await expect(page.locator('#snav .main-menu > mat-list-item.selected')).toContainText(parent);
  }
  await page.screenshot({path: 'test-results/screens/menu-cong-no-ncc.png'});
  w.assertClean();
});
