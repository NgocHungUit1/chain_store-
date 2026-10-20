import {Page, expect} from '@playwright/test';

/**
 * Ghi lại lỗi console và lỗi API (>= 500, hoặc 4xx ngoài danh sách cho phép) trong lúc test.
 * Cuối test gọi assertClean() để fail nếu màn hình có lỗi ngầm.
 */
/**
 * Lỗi console có sẵn từ code gốc RX20, đã ghi nhận, chưa sửa — không làm fail test.
 * Sửa xong lỗi nào thì xoá dòng tương ứng ở đây.
 */
const KNOWN_ERRORS: RegExp[] = [
  // layouts/cart/cart.component.html khai báo 2 mat-sidenav cùng position="end" (#end, #visibilitySidenav)
  /A drawer was already declared for 'position="end"'/,
];

export function watchErrors(page: Page, allowStatus: number[] = []) {
  const errors: string[] = [];
  page.on('console', msg => {
    if (msg.type() === 'error' && !KNOWN_ERRORS.some(re => re.test(msg.text()))) {
      errors.push('console: ' + msg.text().slice(0, 300));
    }
  });
  page.on('pageerror', err => errors.push('pageerror: ' + err.message.slice(0, 300)));
  page.on('response', res => {
    const url = res.url();
    if (url.includes(':33081/') && res.status() >= 400 && !allowStatus.includes(res.status())) {
      errors.push(`api ${res.status()}: ${res.request().method()} ${url}`);
    }
  });
  return {
    errors,
    assertClean: () => expect(errors, errors.join('\n')).toEqual([]),
  };
}

/** Mở trang trong app và đợi Angular tải xong dữ liệu */
export async function open(page: Page, path: string) {
  await page.goto(path, {timeout: 120_000});
  await page.waitForLoadState('networkidle', {timeout: 120_000});
}
