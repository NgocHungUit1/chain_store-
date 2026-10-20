# Pharma Store (RX20) - Claude Code Instructions

> ⚠️ **SOURCE NÀY LÀ DỰ ÁN CHUỖI NHÀ THUỐC** (`chain_store`), tách từ `pharma_store`
> của RX20 ngày 20/10/2026 tại commit `6f47446e`. KHÔNG deploy lên production RX20
> (store.rx20.vn, api.rx20.vn), `/deploy-fe` là của RX20.
> Backend đi kèm: `../pharma_chain` (API local `http://localhost:33081/v1`).
> Tài liệu dự án: `../pharma_chain/.claude/du-an/`.
>
> - `upstream` = Bitbucket `pharma_store` RX20, chỉ để lấy bản vá (đã chặn push)
> - `origin` = GitHub `NgocHungUit1/chain_store-` (private)
> - Chạy local: `docker compose up -d` → http://localhost:4203 (container `chain-store`)

> File này được Claude tự động đọc khi bắt đầu làm việc với dự án

## Project Overview

**Pharma Store (RX20)** - Hệ thống quản lý nhà thuốc toàn diện (rx20.vn)

- **Framework**: Angular 11 + TypeScript 4 + Angular Material 11
- **Architecture**: Modular lazy-loaded SPA
- **API Backend**: RESTful API tại `https://api.rx20.vn/v1`
- **Auth**: Token-based (localStorage), HTTP Interceptors
- **UI**: Angular Material + Flex Layout + ngx-datatable

## Quick Rules

### TRƯỚC khi code
- Đọc file liên quan trước khi sửa
- Xác định module: `sale`, `warehouse`, `invoice`, `product`, `customer`, `supplier`, `report`, ...
- Xác định layer: Component, Service, Model, Dialog

### KHI viết code

**Component:**
- Kế thừa `BaseComponent` (cần permission) hoặc `ListComponentBase` (list/table)
- Dùng `ApiFilterBase` cho filter params
- Pagination qua HTTP headers (`X-Pagination-Total-Count`, `X-Pagination-Per-Page`, `X-Pagination-Current-Page`)

**Service:**
- Inject `HttpClient`, dùng `environment.apiUrl` làm base URL
- Return `Observable`, handle errors trong component
- Dùng `AuthService` để quản lý token/permissions

**Model:**
- TypeScript interfaces/classes trong `*.model.ts`
- Filter classes extend `ApiFilterBase`

### SAU khi code
```bash
npx tsc --noEmit                    # Check TypeScript errors
npm run build -- --configuration=dev  # Build check
```

## Slash Commands (gõ / để dùng)

| Command | Mô tả |
|---------|-------|
| `/work` | **Task lớn**: phân tích → plan → implement → review (feature mới, refactor lớn) |
| `/fix-bug` | Quy trình phân tích và sửa bug |
| `/code-review` | Deep review: performance, quality, patterns |
| `/lint` | Check TypeScript errors cho files đã thay đổi |
| `/add-module` | Tạo Angular module mới (component + service + model + routing) |

## Documentation

```
.claude/
├── agents/                    # Project documentation (tài liệu tham khảo)
│   ├── 01-project-overview.md
│   ├── 02-module-structure.md
│   ├── 03-sale-workflow.md
│   ├── 04-warehouse-workflow.md
│   ├── 05-invoice-workflow.md
│   └── 06-reporting-workflow.md
│
├── rules/                     # Coding rules (LUÔN tuân thủ)
│   ├── 00-global-rules.md
│   ├── 01-angular-rules.md
│   ├── 02-typescript-rules.md
│   ├── 03-api-service-rules.md
│   └── 04-testing-rules.md
│
└── commands/                  # Slash commands (gõ / để dùng)
    ├── work.md
    ├── fix-bug.md
    ├── code-review.md
    ├── lint.md
    └── add-module.md
```

## Common Commands

```bash
# Development
npm start                              # ng serve (port 4200)
npm run build -- --configuration=dev   # Build dev
npm run build                          # Build production

# Docker
docker compose up -d                   # Start container (port 4201)

# Type check
npx tsc --noEmit                       # Check TypeScript errors
```

## Key Directories

```
/src/app/
├── sale/                    # POS - Bán hàng (module phức tạp nhất)
├── warehouse/               # Quản lý kho, nhập hàng
├── invoice/                 # Hóa đơn
├── product/                 # Quản lý sản phẩm/thuốc
├── customer/                # Quản lý khách hàng
├── supplier/                # Quản lý nhà cung cấp
├── report/                  # Báo cáo (sale, product, employee, debt)
├── cash-flow/               # Quản lý thu chi
├── accounting-book/         # Sổ kế toán
├── follow-book/             # Sổ theo dõi (tuân thủ dược)
├── settings/                # Cấu hình hệ thống
├── authentication/          # Đăng nhập, phân quyền
├── shared/                  # Base classes, pipes, shared components
├── common/                  # Reusable dialogs, directives
├── layouts/                 # Full layout, Cart layout, Blank layout
└── dashboards/              # Dashboard chính
```

## API Response Format

API trả pagination qua HTTP Headers:
```
X-Pagination-Total-Count: 250
X-Pagination-Per-Page: 15
X-Pagination-Current-Page: 1
```

Service pattern:
```typescript
// GET list with filter
this.httpClient.get(environment.apiUrl + '/endpoint?' + filter.toFilterString(),
  { observe: 'response' })
  .subscribe(res => {
    this.dataSource = res.body;
    this.reloadFilter(res);  // Update pagination from headers
  });
```

---

**Khi nhận task lớn → dùng `/work`. Task nhỏ → code trực tiếp theo rules.**
