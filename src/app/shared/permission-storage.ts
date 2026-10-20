/**
 * Danh sách quyền của user đang đăng nhập.
 *
 * full.component nạp 'allPermission' vào sessionStorage bằng một API bất đồng bộ; khi tải lại
 * trang (F5) hoặc mở tab mới thẳng vào màn con, component con chạy trước lúc API trả về và
 * sessionStorage còn rỗng -> trước đây `.split()` trên null làm vỡ màn hình. Chưa có thì lấy danh
 * sách quyền đã lưu ở localStorage lúc đăng nhập (cùng nội dung, AuthService.setPermissions).
 */
export function getAllPermissions(): string[] {
  const fromSession = sessionStorage.getItem('allPermission');
  if (fromSession) {
    return fromSession.split(',');
  }
  try {
    const fromLogin = JSON.parse(localStorage.getItem('rx20_permission_key') || '[]');
    return Array.isArray(fromLogin) ? fromLogin : [];
  } catch (e) {
    return [];
  }
}
