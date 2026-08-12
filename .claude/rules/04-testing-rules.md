# Testing Rules - Pharma Store (RX20)

> Hướng dẫn testing thủ công và kiểm tra chất lượng code

## 1. MANUAL TESTING CHECKLIST

### API/Service Testing
- [ ] Happy path: request thành công, data trả đúng
- [ ] Validation: gửi data thiếu/sai → có error message
- [ ] Not found: request resource không tồn tại → handle đúng
- [ ] Unauthorized: không có token → redirect login
- [ ] Pagination: test page 1, page cuối, pageSize
- [ ] Filters: test từng filter, combine filters
- [ ] Sort: test sort ASC/DESC
- [ ] Edge cases: empty string, null, special characters

### Frontend Testing
- [ ] Form submission: submit valid data → success
- [ ] Form validation: submit invalid → hiện errors
- [ ] Loading states: spinner hiện khi fetch data
- [ ] Error states: hiện error message khi API fail
- [ ] Table: pagination, sort, filter hoạt động
- [ ] Dialog: mở, đóng, submit, cancel hoạt động
- [ ] Responsive: layout không bị vỡ ở các breakpoints
- [ ] Permission: elements ẩn/hiện đúng permission
- [ ] Browser console: không có errors/warnings mới

### Data Integrity
- [ ] Dữ liệu lưu đúng vào DB
- [ ] Relationships đúng (foreign keys)
- [ ] Calculated fields đúng (total, subtotal, discount)
- [ ] Date/time đúng timezone

---

## 2. QUICK TESTING METHODS

### Check TypeScript Errors
```bash
# Kiểm tra lỗi TypeScript (không build)
npx tsc --noEmit

# Build dev để kiểm tra
npm run build -- --configuration=dev
```

### Check Browser
```
1. Mở Chrome DevTools (F12)
2. Tab Console → check errors
3. Tab Network → check API calls + responses
4. Tab Application → check localStorage (token, permissions)
```

### Check API Response
```
1. Network tab → click request
2. Kiểm tra:
   - Status code (200, 400, 401, 404, 500)
   - Response body (data format)
   - Response headers (pagination headers)
   - Request headers (Authorization Bearer token)
```

---

## 3. TESTING BY TASK TYPE

### Thêm Field Mới
- [ ] Model interface đã update
- [ ] Form có field mới với validation
- [ ] List table hiển thị column mới (nếu cần)
- [ ] Filter hoạt động (nếu cần)
- [ ] API gửi/nhận field đúng

### Tạo Module/Feature Mới
- [ ] Module lazy-loaded đúng
- [ ] Route accessible
- [ ] Service CRUD hoạt động
- [ ] List: load, paginate, filter, sort
- [ ] Form: create, edit, validate
- [ ] Delete: confirm dialog, xóa thành công
- [ ] Permissions: ẩn/hiện đúng

### Sửa Bug
- [ ] Bug đã được fix
- [ ] Root cause đã xử lý (không patch tạm)
- [ ] Regression: chức năng liên quan vẫn hoạt động
- [ ] Edge cases: bug có xảy ra ở case tương tự không

---

## 4. PERFORMANCE CHECKS

### Frontend Performance
- [ ] Không có memory leak (unsubscribe Observable)
- [ ] Không có unnecessary re-renders
- [ ] Lazy-loaded modules (không eager load)
- [ ] Images optimized (nếu có)
- [ ] No console.log trong production code

### API Performance
- [ ] Pagination hoạt động (không load tất cả records)
- [ ] Filter gửi đúng params
- [ ] Không call API trùng lặp (double fetch)
- [ ] Loading state hiện khi API slow

---

## 5. PRE-COMMIT CHECKLIST

```
Trước khi commit, đảm bảo:

[ ] TypeScript compile không lỗi (npx tsc --noEmit)
[ ] Không có console.log debug
[ ] Không có commented-out code mới
[ ] Không có hardcoded values
[ ] Không có TODO/FIXME mới (hoặc đã track)
[ ] Test thủ công happy path
[ ] Test thủ công edge cases
[ ] Browser console sạch
```

---

**Version**: 1.0
**Last Updated**: 2026-03-26
