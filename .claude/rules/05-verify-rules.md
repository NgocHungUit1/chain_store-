# Verify Rules — Xong task phải tự kiểm tra (BẮT BUỘC)

> Chốt với anh Hùng 20/10/2026. Áp dụng cho MỌI task có sửa code ở `pharma_chain` (BE) và
> `chain_store` (FE). Chưa qua các bước dưới thì **không được báo "xong"**.

## 1. Task có backend
1. `docker exec chain-api php -l /app/<file>` cho mọi file PHP đã sửa.
2. Có migration: chạy `php yii migrate` + `php yii rbac/migrate`; thêm cột thì
   `php yii cache/flush-schema db` (chỉ xoá schema cache, không đụng token).
3. Gọi API bằng curl với tài khoản `demo` / `Demo@123` (token lấy từ `POST /v1/auth/login`):
   - happy path: đúng dữ liệu trả về **và** đúng dữ liệu trong DB (query `chain-mysql`);
   - ca lỗi: thiếu/sai tham số → 400/422 có thông báo tiếng Việt; dữ liệu cửa hàng khác → 404/403;
   - quyền: endpoint mới có quyền RBAC, gọi khi thiếu quyền → 403.
4. Nghiệp vụ có số liệu (tồn kho, tiền, điểm…): kiểm tra cả chiều ngược (xoá/huỷ/trả) đưa số
   về đúng như trước.
5. Xem `backend/runtime/logs/app.log` không có lỗi mới.
6. Lệnh console/cron: chạy tay 2 lần, lần 2 không sinh dữ liệu trùng.

## 2. Task có giao diện (chain_store)
1. `docker logs --since 2m chain-store` phải "Compiled successfully" (AOT, Angular 11: template
   KHÔNG dùng `??`, date-fns là v1 → token `YYYY-MM-DD`).
2. Viết/cập nhật kịch bản Playwright trong `chain_store/e2e-playwright/tests/` cho màn vừa sửa:
   mở màn, thao tác đúng luồng, `expect` thấy kết quả; dùng `watchErrors()` để fail khi có lỗi
   console hoặc API >= 400.
3. Chạy `cd e2e-playwright && npx playwright test` (thư mục trong repo chain_store) (cả bộ, không chỉ test mới) —
   phải xanh hết. Lỗi có sẵn từ RX20 mà chưa sửa thì đưa vào `KNOWN_ERRORS` kèm ghi chú.
4. Mở ảnh `test-results/screens/*.png` của màn vừa sửa để tự xem: chữ đúng tiếng Việt, không vỡ
   bố cục, nhãn đúng ngữ cảnh.
5. `free -m` trước khi chạy; dưới 4GB thì tạm dừng `chain-admin` khi chạy test rồi bật lại.

## 3. Báo cáo khi xong
- Ghi rõ đã kiểm tra gì: lệnh curl/kết quả chính, số test Playwright đạt/tổng.
- Cái gì **chưa** kiểm tra được thì nói thẳng, không viết "đã xong" cho phần đó.
- Lỗi có sẵn phát hiện trong lúc test: sửa nếu nhỏ và an toàn, không thì ghi vào
  `../pharma_chain/.claude/du-an/09-ban-va-rx20.md` và báo.
