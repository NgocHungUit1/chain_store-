# Sửa Bug

Phân tích và sửa bug trong dự án Pharma Store (RX20) theo quy trình chuẩn.

**Mô tả bug:** $ARGUMENTS

## QUY TRÌNH SỬA BUG

### Bước 1: Thu thập thông tin
1. Xác định module liên quan (sale, warehouse, invoice, product, ...)
2. Xác định layer bị lỗi: Component? Service? Model? API?
3. Kiểm tra thông tin lỗi:
   - Browser console errors
   - Network tab response (status code, error message)
   - TypeScript compile errors

### Bước 2: Tìm root cause
1. Đọc file liên quan (Component, Service, Model)
2. Trace luồng xử lý:
   - Component → Service → API → Response → Component
3. Kiểm tra:
   - API call: URL, params, headers đúng chưa?
   - Response handling: parse data đúng format?
   - Template binding: data binding đúng property?
   - Filter: toFilterString() generate đúng query?
   - Pagination: reloadFilter() nhận đúng headers?
   - Permission: canDo() check đúng permission name?

### Bước 3: Fix bug
1. Sửa code tại root cause (KHÔNG patch tạm)
2. Đảm bảo không ảnh hưởng chức năng khác
3. Check TypeScript compile: `npx tsc --noEmit`

### Bước 4: Verify
1. Mô tả cách test fix
2. List edge cases cần kiểm tra
3. Check regression: chức năng liên quan có bị ảnh hưởng không?

### Bước 5: Tóm tắt
```
Root cause: ...
Solution: ...
Files changed: ...
How to test: ...
```
