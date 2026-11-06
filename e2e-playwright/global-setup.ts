import {chromium, FullConfig, request as pwRequest} from '@playwright/test';
import {E2E_USER, E2E_PASS} from './tests/helpers';

const API = process.env.E2E_API_URL || 'http://127.0.0.1:33081/v1';

/**
 * Đăng nhập tài khoản test (mặc định e2ekho, Store.Admin cửa hàng demo) qua form, lưu phiên vào .auth/demo.json cho các test dùng chung.
 * Không dùng demo: người dùng test tay bằng demo, đổi chi nhánh làm việc của demo là cả bộ test chạy sai chi nhánh (06/11/2026),
 * và ngược lại test đổi chi nhánh thì màn hình người dùng lệch. Trước khi chạy đưa e2ekho về Chi nhánh trung tâm.
 * e2ekho tạo bởi pharma_chain/tools/chi-nhanh/kiem-tra-chuyen-kho.py (máy mới chạy kịch bản đó một lần).
 */
export default async function globalSetup(config: FullConfig) {
  const ctx = await pwRequest.newContext();
  const login = await ctx.post(API + '/auth/login', {data: {username: E2E_USER, password: E2E_PASS}});
  const body = await login.json().catch(() => ({}));
  const token = body.access_token || body.token;
  if (!token) {
    throw new Error(`Không đăng nhập được ${E2E_USER}. Máy mới: chạy MYSQL_PWD=… python3 pharma_chain/tools/chi-nhanh/kiem-tra-chuyen-kho.py một lần để tạo tài khoản.`);
  }
  const auth = {headers: {Authorization: 'Bearer ' + token}};
  const branches = await (await ctx.get(API + '/branch?fields=id,name', auth)).json();
  const central = branches.find(b => b.name === 'Chi nhánh trung tâm');
  if (central) {
    await ctx.post(API + '/user/update-branch-login', {...auth, data: {branch_store_id: central.id}});
  }
  await ctx.dispose();

  const baseURL = config.projects[0].use.baseURL as string;
  const browser = await chromium.launch();
  const page = await browser.newPage();
  // Bản dev (ng serve) tải bundle lớn, lần đầu có thể mất gần 1 phút
  await page.goto(baseURL + '/authentication/login', {waitUntil: 'networkidle', timeout: 120_000});
  // Angular Material đưa placeholder thành nhãn nổi nên chọn theo thứ tự ô
  await page.locator('input[type="text"], input:not([type])').first().fill(E2E_USER, {timeout: 60_000});
  await page.locator('input[type="password"]').fill(E2E_PASS);
  await page.getByRole('button', {name: 'Đăng nhập'}).click();
  await page.waitForURL(url => !url.pathname.includes('/authentication'), {timeout: 60_000});
  await page.context().storageState({path: '.auth/demo.json'});
  await browser.close();
}
