# Global Rules - Pharma Store (RX20)

> Rules chung áp dụng cho MỌI task trong dự án RX20

## 1. TRƯỚC KHI CODE

### Bắt buộc đọc hiểu
- [ ] Đọc file liên quan TRƯỚC khi sửa (không đoán code)
- [ ] Xác định module nào liên quan (sale, warehouse, invoice, product, customer, supplier, report, ...)
- [ ] Xác định layer: Component, Service, Model, Dialog, Shared
- [ ] List ra các files sẽ bị ảnh hưởng

### Kiểm tra dependencies
- [ ] Check relationships với services/models khác
- [ ] Check xem có ảnh hưởng đến routes khác không
- [ ] Check components nào đang import/sử dụng

---

## 2. KHI VIẾT CODE

### Nguyên tắc chung
```
DO:
- Đọc code hiện có trước khi sửa
- Follow conventions đã có trong project
- Viết code đơn giản, dễ hiểu
- Xử lý errors gracefully

DON'T:
- Không hardcode values → dùng environment/constants
- Không duplicate code → extract thành service/shared
- Không over-engineer → chỉ làm những gì được yêu cầu
- Không thêm features không được yêu cầu
```

### Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Component | kebab-case file, PascalCase class | `product-list.component.ts` / `ProductListComponent` |
| Service | kebab-case file | `product.service.ts` / `ProductService` |
| Model | kebab-case file | `product.model.ts` / `Product` interface |
| Module | kebab-case file | `product.module.ts` / `ProductModule` |
| Dialog | suffix `-dialog` | `payment-dialog.component.ts` |
| Pipe | kebab-case file | `filter.pipe.ts` / `FilterPipe` |
| Directive | kebab-case file | `input-select-all.directive.ts` |
| TS Variable | camelCase | `const productName` |
| TS Interface | PascalCase | `interface Product {}` |
| Constants | UPPER_SNAKE | `API_BASE_URL` |
| CSS Class | kebab-case | `.product-list-container` |

### File Locations

```
Source Code - Feature modules tại /src/app/:
├── Component    → /src/app/{module}/{feature}/{feature}.component.ts
├── Service      → /src/app/{module}/{module}.service.ts
├── Model        → /src/app/{module}/{module}.model.ts
├── Dialog       → /src/app/{module}/{dialog-name}/{dialog-name}.component.ts
├── Module       → /src/app/{module}/{module}.module.ts
├── Routing      → /src/app/{module}/{module}.routing.ts

Shared:
├── Base classes → /src/app/shared/base.ts
├── Shared comps → /src/app/shared/
├── Common comps → /src/app/common/
├── Pipes        → /src/app/shared/*.pipe.ts
├── Menu config  → /src/app/shared/menu-items/

Layouts:
├── Full layout  → /src/app/layouts/full/     (sidebar + header)
├── Cart layout  → /src/app/layouts/cart/     (POS sale)
├── Blank layout → /src/app/layouts/blank/    (login/auth)

Config:
├── Environments → /src/environments/
├── Styles       → /src/assets/styles/
├── Main module  → /src/app/app.module.ts
├── Routing      → /src/app/app.routing.ts
```

---

## 3. CHECKLIST PERFORMANCE (Bắt buộc)

### Service/API calls:
- [ ] **Pagination**: Sử dụng `ApiFilterBase` với `page` và `pageSize`
- [ ] **Filter**: Dùng `toFilterString()` để build query params
- [ ] **Observe response**: Dùng `{ observe: 'response' }` khi cần pagination headers
- [ ] **Unsubscribe**: Cleanup subscriptions trong `ngOnDestroy`

### Component:
- [ ] **Loading state**: Có loading indicator khi fetch data
- [ ] **Error handling**: Có error handling cho API calls
- [ ] **OnPush**: Cân nhắc `ChangeDetectionStrategy.OnPush` cho components nặng
- [ ] **Lazy loading**: Module mới phải lazy-loaded trong `app.routing.ts`

---

## 4. SAU KHI CODE

### QUAN TRỌNG - LINTING VÀ BUILD CHECK

```
TUYỆT ĐỐI KHÔNG LÀM:
- KHÔNG tự ý cài package mới mà chưa hỏi user
- KHÔNG sửa code không liên quan đến task

CHỈ ĐƯỢC LÀM:
- Check TypeScript errors cho files đã thay đổi
- Build check nếu cần
```

**Cách đúng:**
```bash
# TypeScript check
npx tsc --noEmit

# Build dev
npm run build -- --configuration=dev
```

### Test thủ công
- [ ] Test happy path (case thành công)
- [ ] Test edge cases (empty, null, invalid input)
- [ ] Test với data lớn (nếu có pagination)
- [ ] Check console errors (browser)
- [ ] Check network tab (API responses)

---

## 5. GIT COMMIT

### Commit Message Format
```
<type>: <short description>

Types:
- feat: Feature mới
- fix: Sửa bug
- refactor: Refactor code
- perf: Optimization
- docs: Documentation
- style: Code style (formatting, etc.)
```

### Examples
```
feat: Add barcode for product unit
fix: Fix warehouse import validation
refactor: Extract payment logic to service
perf: Optimize product list loading
```

---

## 6. QUAN TRỌNG - MODULE STRUCTURE

```bash
# Mỗi feature module cần có:
/src/app/{module}/
├── {module}.module.ts           # NgModule declaration
├── {module}.routing.ts          # Routes
├── {module}.service.ts          # API service
├── {module}.model.ts            # Models/interfaces
├── {module}-list/               # List component (table)
│   ├── {module}-list.component.ts
│   ├── {module}-list.component.html
│   └── {module}-list.component.scss
├── {module}-form/               # Form component (create/edit)
│   └── ...
└── {module}-*-dialog/           # Dialog components
    └── ...
```

---

## 7. QUICK REFERENCE

### Base Classes (kế thừa từ /src/app/shared/base.ts)

```typescript
// Filter params cho API
class ApiFilterBase {
  search_string; page = 1; pageSize = 15; sort = ''; expand = '';
  toFilterString(): string  // Build query string
  getModelSearch(): string  // Override để set model prefix
}

// Component cần check permission
class BaseComponent {
  canDo(permissionName: string): boolean
}

// Component hiển thị danh sách (table)
class ListComponentBase {
  dataSource = []; loading = true;
  pageSize; pageTotalCount; page = 1;
  loadData(); reloadFilter(res); onPageChange(page);
  onMatPageChange(event); onMatSortChange(event);
}
```

### Common Dialogs (import từ /src/app/common/)
```typescript
PopupDeleteDialogComponent    // Xác nhận xóa
PopupConfirmDialogComponent   // Xác nhận chung
SearchProductDialogComponent  // Tìm sản phẩm
SearchSupplierDialogComponent // Tìm nhà cung cấp
```

### Environment URLs
```typescript
// Production: https://api.rx20.vn/v1
// Dev:        http://localhost:31080/v1
// UAT:        http://113.161.35.44:31080/v1
```

---

**Version**: 1.0
**Last Updated**: 2026-03-26
