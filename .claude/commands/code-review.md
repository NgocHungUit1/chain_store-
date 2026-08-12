# Code Review

Deep review code theo chuẩn dự án Pharma Store (RX20). Đọc THỰC SỰ từng file và phân tích cụ thể.

**File/Feature cần review:** $ARGUMENTS

## QUY TRÌNH REVIEW

### Bước 1: Xác định files cần review

Nếu user chỉ định file → review file đó.
Nếu user chỉ định feature/module → tìm tất cả files liên quan:
- Component (.component.ts, .component.html)
- Service (.service.ts)
- Model (.model.ts)
- Module (.module.ts) + Routing (.routing.ts)

### Bước 2: ĐỌC TỪNG FILE và phân tích

Với MỖI file, đọc code thực tế rồi check:

#### Component Review

**Architecture:**
- Kế thừa đúng base class? (ListComponentBase cho list, BaseComponent cho permission)
- Module lazy-loaded?
- Subscriptions cleanup trong ngOnDestroy?

**Performance:**
- Loading state khi fetch data?
- Pagination hoạt động đúng?
- Không double fetch API?
- Search có debounce?

**Type Safety:**
- Có dùng `any` type? → Thay bằng interface cụ thể
- API responses có typed?
- Form values có typed?

**UX:**
- Loading indicator khi fetch?
- Error message khi API fail?
- Form validation rules?
- Delete có confirmation dialog?
- Empty state khi không có data?

#### Service Review

**API Patterns:**
- Dùng `environment.apiUrl`?
- HTTP methods đúng (GET/POST/PUT/DELETE)?
- Observe 'response' cho list APIs?
- Return Observable (không subscribe trong service)?
- Error handling?

#### Model Review

**Type Definitions:**
- Interfaces đầy đủ cho mọi entity?
- Filter class extend ApiFilterBase?
- getModelSearch() return đúng?
- Optional fields đánh dấu `?`?

### Bước 3: Báo cáo kết quả

```
## Code Review Report

### NGHIÊM TRỌNG (phải fix ngay)
Security issues, data loss, TypeScript errors

1. **[File:line]** - [Vấn đề]
   - Hiện tại: [code hiện tại]
   - Fix: [code fix]

### QUAN TRỌNG (nên fix)
Performance issues, missing error handling, type safety

1. **[File:line]** - [Vấn đề]

### GỢI Ý (improve)
Code style, readability, minor improvements

1. **[File:line]** - [Gợi ý]

### TỐT
Liệt kê những điểm code đã làm tốt.

### Tổng kết
- Nghiêm trọng: X issues
- Quan trọng: Y issues
- Gợi ý: Z issues
```

### Bước 4: Hỏi user có muốn auto-fix không

Nếu có issues nghiêm trọng/quan trọng:
"Bạn muốn tôi auto-fix [X] issues không?"
