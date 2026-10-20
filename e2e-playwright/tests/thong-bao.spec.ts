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
  const count = page.locator('.noti-summary .message-count');
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
  await page.locator('.noti-item', {hasText: 'thiếu định mức'}).first().click();
  // Trang danh sách hàng tự viết lại URL thành ProductSearch[quota_stock]=lower
  await expect(page).toHaveURL(/quota_stock\]?=lower/);

  await open(page, '/dashboard');
  await page.locator('button.notification-button').click();
  await page.locator('.noti-item', {hasText: /hết hạn/}).first().click();
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

test('Thông báo: khung rộng, đếm chưa đọc/đã đọc, bấm là đã đọc, đánh dấu tất cả', async ({page}) => {
  const w = watchErrors(page);
  runConsole('notification/product/stock-quota --store=510 --force=1');
  await open(page, '/dashboard');

  // Huy hiệu số chưa đọc trên chuông
  const badge = page.locator('button.notification-button .mat-badge-content');
  await expect(badge).toBeVisible();

  await page.locator('button.notification-button').click();
  const panel = page.locator('.noti-panel');
  await expect(panel).toBeVisible();
  // Khung rộng như gohost, mô tả hiện đủ (không cắt …)
  const box = await page.locator('.noti-menu').boundingBox();
  expect(box?.width).toBeGreaterThanOrEqual(420);
  const desc = page.locator('.noti-item.unread .noti-item-desc').first();
  await expect(desc).toContainText('vui lòng nhập thêm hàng');
  await expect(page.locator('.noti-summary')).toContainText('đã đọc');
  await page.screenshot({path: 'test-results/screens/thong-bao-khung.png'});

  const unreadBefore = Number(await page.locator('.noti-summary .message-count').innerText());
  // Bấm vào 1 thông báo chưa đọc -> đã đọc (mở trang), quay lại thấy giảm 1
  await page.locator('.noti-item.unread').first().click();
  await page.waitForURL(url => !url.pathname.startsWith('/dashboard'));
  // Không chờ networkidle (một số màn gọi API liên tục) — chờ chuông hiện lại
  await page.goto('/dashboard');
  await page.locator('button.notification-button').waitFor();
  await page.locator('button.notification-button').click();
  await expect(page.locator('.noti-summary .message-count')).toHaveText(String(unreadBefore - 1));

  // Đánh dấu tất cả đã đọc: menu vẫn mở, về 0, huy hiệu ẩn
  await page.locator('.noti-mark-all').click();
  await expect(page.locator('.noti-summary .message-count')).toHaveText('0');
  await expect(page.locator('.noti-item.unread')).toHaveCount(0);
  await expect(badge).toBeHidden();

  // Trả lại vài thông báo chưa đọc cho lần test/xem sau
  runConsole('notification/product/stock-quota --store=510 --force=1');
  runConsole('notification/product/expiry --store=510 --force=1');
  w.assertClean();
});
