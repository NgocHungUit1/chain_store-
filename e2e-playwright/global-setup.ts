import {chromium, FullConfig} from '@playwright/test';

/** Đăng nhập tài khoản demo qua form, lưu phiên vào .auth/demo.json cho các test dùng chung. */
export default async function globalSetup(config: FullConfig) {
  const baseURL = config.projects[0].use.baseURL as string;
  const browser = await chromium.launch();
  const page = await browser.newPage();
  // Bản dev (ng serve) tải bundle lớn, lần đầu có thể mất gần 1 phút
  await page.goto(baseURL + '/authentication/login', {waitUntil: 'networkidle', timeout: 120_000});
  // Angular Material đưa placeholder thành nhãn nổi nên chọn theo thứ tự ô
  await page.locator('input[type="text"], input:not([type])').first().fill(process.env.E2E_USER || 'demo', {timeout: 60_000});
  await page.locator('input[type="password"]').fill(process.env.E2E_PASS || 'Demo@123');
  await page.getByRole('button', {name: 'Đăng nhập'}).click();
  await page.waitForURL(url => !url.pathname.includes('/authentication'), {timeout: 60_000});
  await page.context().storageState({path: '.auth/demo.json'});
  await browser.close();
}
