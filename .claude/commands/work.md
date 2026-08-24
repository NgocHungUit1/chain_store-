# Work - Orchestration cho Task Lớn

Bạn là AI assistant cho dự án Pharma Store (RX20). Nhận task lớn và thực hiện theo quy trình chuẩn: phân tích → plan → implement → review.

**Task:** $ARGUMENTS

## WORKFLOW BẮT BUỘC

### PHASE 1: PHÂN TÍCH (Đọc hiểu trước khi làm)

1. **Xác định scope:**
   - Module nào liên quan? (sale, warehouse, invoice, product, customer, supplier, report, cash-flow, follow-book, accounting-book, settings)
   - Component hay Service hay cả hai?
   - Cần tạo module mới hay sửa module hiện có?

2. **Đọc tài liệu cần thiết** (CHỈ đọc cái liên quan):
   - Project overview: `.claude/agents/01-project-overview.md`
   - Module structure: `.claude/agents/02-module-structure.md`
   - Sale workflow: `.claude/agents/03-sale-workflow.md` (nếu liên quan bán hàng)
   - Warehouse workflow: `.claude/agents/04-warehouse-workflow.md` (nếu liên quan kho)
   - Invoice workflow: `.claude/agents/05-invoice-workflow.md` (nếu liên quan hóa đơn)

3. **Đọc code hiện có:**
   - Component liên quan: `/src/app/{module}/`
   - Service liên quan: `/src/app/{module}/{module}.service.ts`
   - Model liên quan: `/src/app/{module}/{module}.model.ts`
   - Routing: `/src/app/{module}/{module}.routing.ts`
   - Shared/Base: `/src/app/shared/base.ts`

4. **List files bị ảnh hưởng** và dependencies

### PHASE 2: LẬP KẾ HOẠCH (Chuyển Plan Mode)

Chuyển sang Plan mode và trình bày:

```
## Kế hoạch: [Tên task]

### Scope
- Module: ...
- Layer: Component / Service / Full-stack

### Files cần tạo/sửa
1. [file path] - [mô tả thay đổi]
2. ...

### Các bước thực hiện
1. ...
2. ...

### Rủi ro / Ảnh hưởng
- ...

### Câu hỏi cho user (nếu có)
- ...
```

**CHỜ USER DUYỆT trước khi tiếp tục.**

### PHASE 3: IMPLEMENT (Sau khi user duyệt)

Thực hiện code theo đúng rules:

**Component:**
- Kế thừa `ListComponentBase` cho list page, `BaseComponent` cho permission check
- Dùng `ApiFilterBase` extend cho filter
- Reactive Forms với Validators
- MatDialog cho dialogs
- Loading state + error handling

**Service:**
- Inject `HttpClient`, dùng `environment.apiUrl`
- Observe 'response' cho list APIs (pagination headers)
- Return Observable (không subscribe trong service)

**Module:**
- Lazy-loaded trong `app.routing.ts`
- Import `DemoMaterialModule`, `SharedModule`, `FormsModule`, `ReactiveFormsModule`

### PHASE 4: REVIEW (Tự review trước khi báo xong)

**Performance Check:**
- [ ] Không gọi API thừa (double fetch)
- [ ] Có pagination cho list
- [ ] Có loading state
- [ ] Unsubscribe Observable trong ngOnDestroy

**Code Quality:**
- [ ] TypeScript types đầy đủ (không `any`)
- [ ] Error handling đầy đủ
- [ ] Naming conventions đúng
- [ ] Module lazy-loaded

**Build Check:**
```bash
npx tsc --noEmit
```

Báo cáo cho user:
```
## Tổng kết

### Files đã tạo/sửa:
1. [path] - [mô tả]

### Review kết quả:
- Performance: OK / Cần chú ý
- Code Quality: OK / Cần chú ý

### Cách test:
1. ...
2. ...
```
