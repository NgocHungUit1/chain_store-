import {defineConfig} from '@playwright/test';

/**
 * Kiểm thử giao diện màn nhà thuốc chạy local (container chain-store, cổng 4203; API 33081).
 * Đăng nhập 1 lần ở global-setup, các test dùng lại phiên (storageState).
 *   cd e2e-playwright && npx playwright test                 # chạy hết
 *   npx playwright test tests/giai-doan-1.spec.ts -g "Xuất huỷ"
 *   npm run test:all                                          # gồm cả ca @slow
 */
export default defineConfig({
  testDir: './tests',
  // Ca có tag @slow (chờ polling 2 phút...) chỉ chạy khi gọi `npm run test:all` hoặc -g @slow
  grepInvert: process.env.E2E_ALL ? undefined : /@slow/,
  timeout: 90_000,
  expect: {timeout: 15_000},
  workers: 1, // máy ít RAM: chạy tuần tự, 1 trình duyệt
  retries: 0,
  reporter: [['list'], ['html', {open: 'never'}]],
  globalSetup: './global-setup.ts',
  use: {
    baseURL: process.env.E2E_BASE_URL || 'http://localhost:4203',
    storageState: '.auth/demo.json',
    headless: true,
    viewport: {width: 1440, height: 900},
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
    locale: 'vi-VN',
  },
  outputDir: 'test-results',
});
