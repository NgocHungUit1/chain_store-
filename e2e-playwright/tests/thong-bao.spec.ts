import {test, expect, Page} from '@playwright/test';
import {execSync} from 'child_process';
import {open, watchErrors} from './helpers';

/**
 * Chuông thông báo: mở đúng trang và tự cập nhật số chưa đọc (polling 2 phút) mà không tải lại trang.
 * Dùng lệnh console có --force để sinh thông báo mới ngay (bỏ qua chống trùng trong ngày).
 */
const runConsole = (cmd: string) =>
  execSync(`docker exec chain-api php /app/yii ${cmd}`, {encoding: 'utf8'}).trim();

/** Mở menu chuông, đọc số "Có N thông báo mới", đóng menu hẳn rồi mới trả về */
async function unreadCount(page: Page): Promise<number> {
  const count = page.locator('.drop-title .message-count');
  await page.locator('button.notification-button').click();
  await count.waitFor({state: 'visible', timeout: 10_000});
  const text = await count.innerText();
  // Escape không đóng menu này; bấm ra vùng nền (backdrop) để đóng
  await page.locator('.cdk-overlay-backdrop').last().click({force: true});
  await count.waitFor({state: 'detached', timeout: 10_000});
  return Number(text);
}

test('Thông báo: bấm vào mở đúng trang', async ({page}) => {
  const w = watchErrors(page);
  runConsole('notification/product/stock-quota --store=510 --force=1');
  runConsole('notification/product/expiry --store=510 --force=1');
  await open(page, '/dashboard');

  await page.locator('button.notification-button').click();
  await page.locator('.message-center a', {hasText: 'thiếu định mức'}).first().click();
  // Trang danh sách hàng tự viết lại URL thành ProductSearch[quota_stock]=lower
  await expect(page).toHaveURL(/quota_stock\]?=lower/);

  await open(page, '/dashboard');
  await page.locator('button.notification-button').click();
  await page.locator('.message-center a', {hasText: /hết hạn/}).first().click();
  await expect(page).toHaveURL(/expiration-date\?WarehouseProductParcelSearch(%5B|\[)timeSelect(%5D|\])=(expired|next_)/);
  await page.screenshot({path: 'test-results/screens/thong-bao-mo-trang.png'});
  w.assertClean();
});

test('Thông báo: chuông tự cập nhật không cần tải lại trang @slow', async ({page}) => {
  test.slow(); // phải chờ chu kỳ hỏi lại 2 phút
  test.setTimeout(240_000);
  const w = watchErrors(page);
  await open(page, '/dashboard');
  const before = await unreadCount(page);

  const out = runConsole('notification/product/stock-quota --store=510 --force=1');
  expect(out).toContain('1 thông báo');

  await expect.poll(() => unreadCount(page), {timeout: 170_000, intervals: [20_000]}).toBeGreaterThan(before);
  await page.locator('button.notification-button').click();
  await page.screenshot({path: 'test-results/screens/thong-bao-tu-cap-nhat.png'});
  w.assertClean();
});
