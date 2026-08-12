# Pharma Store (RX20) - Project Overview

## Tổng quan

**Pharma Store (RX20)** là hệ thống quản lý nhà thuốc toàn diện, bao gồm: bán hàng (POS), quản lý kho, hóa đơn, khách hàng, nhà cung cấp, báo cáo, tài chính, và tuân thủ dược.

- **URL Production**: rx20.vn
- **API Backend**: https://api.rx20.vn/v1
- **Repository**: Bitbucket - tin_team/pharma_store

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | Angular | 11.0.5 |
| Language | TypeScript | 4.0.5 |
| UI Library | Angular Material | 11.0.3 |
| Layout | Angular Flex Layout | 9.0.0-beta.31 |
| Data Tables | @swimlane/ngx-datatable | 17.1.0 |
| Charts | ApexCharts, Chart.js, D3, ngx-charts | Mixed |
| Date | Moment.js | 2.29.1 |
| Number | Numeral.js | 2.0.6 |
| Rich Text | Quill, CKEditor 4 | Mixed |
| PDF | jsPDF, ngx-extended-pdf-viewer | Mixed |
| Excel | xlsx | 0.16.9 |
| Barcode | JsBarcode | 3.11.3 |
| Notifications | angular-notifier | 6.0.1 |
| Tree View | Syncfusion EJ2 | 22.1.36 |
| Runtime | Node.js (Docker) | 12.20 Alpine |
| Package Manager | npm | 6.x |

## Architecture

```
Angular SPA (Single Page Application)
├── 3 Layouts: Full (main), Cart (POS), Blank (auth)
├── 50+ Feature Modules (lazy-loaded)
├── HTTP Services → REST API Backend
├── Token Auth (localStorage) + Interceptors
├── Pagination qua HTTP Headers
└── Docker deployment (port 4201)
```

## Environments

| Env | API URL | Build Config |
|-----|---------|-------------|
| Development | http://localhost:31080/v1 | `environment.ts` |
| Dev Server | http://localhost:31080/v1 | `environment.dev.ts` |
| UAT | http://113.161.35.44:31080/v1 | `environment.uat.ts` |
| Production | https://api.rx20.vn/v1 | `environment.prod.ts` |

## Authentication Flow

```
1. User login → POST /auth/login { username, password, subdomain }
2. API trả { token, permissions }
3. AuthService.setToken(token) → localStorage['rs24_token']
4. AuthService.setPermissions(permissions) → localStorage['rx20_permission_key']
5. AuthTokenInterceptor tự thêm "Authorization: Bearer {token}" vào mọi request
6. AuthInterceptor handle 401 → redirect /authentication/login
```

## Main Modules

### Core Business
| Module | Path | Mô tả |
|--------|------|--------|
| **Sale** | `/sale` | POS bán hàng - module phức tạp nhất (~19K lines service) |
| **Warehouse** | `/transaction` | Quản lý kho, nhập hàng, xuất hàng |
| **Invoice** | `/invoice` | Quản lý hóa đơn bán hàng |
| **Product** | Trong settings | Quản lý sản phẩm/thuốc, đơn vị, nhóm |
| **Customer** | Trong settings | Quản lý khách hàng, công nợ, điểm tích lũy |
| **Supplier** | Trong settings | Quản lý nhà cung cấp, công nợ |

### Reporting & Finance
| Module | Path | Mô tả |
|--------|------|--------|
| **Report** | `/report` | Báo cáo bán hàng, tồn kho, nhân viên, công nợ |
| **Cash Flow** | `/cash-flow` | Quản lý thu chi |
| **Accounting Book** | `/accounting-book` | Sổ kế toán (ngân hàng, tiền mặt, tồn kho) |
| **Follow Book** | `/follow-book` | Sổ theo dõi tuân thủ dược (11 loại sổ) |

### Administration
| Module | Path | Mô tả |
|--------|------|--------|
| **Settings** | `/setting` | Cấu hình: thông tin cửa hàng, người dùng, in ấn |
| **Dashboard** | `/dashboard` | Tổng quan kinh doanh |

## Key Patterns

### Base Classes (shared/base.ts)
- `ApiFilterBase`: Filter params → query string cho API
- `BaseComponent`: Permission check (`canDo()`)
- `ListComponentBase`: List page (table, pagination, filter, sort)

### Pagination (HTTP Headers)
```
X-Pagination-Total-Count: 250
X-Pagination-Per-Page: 15
X-Pagination-Current-Page: 1
```

### Common Dialogs
- `PopupDeleteDialogComponent` - Xác nhận xóa
- `PopupConfirmDialogComponent` - Xác nhận chung
- `SearchProductDialogComponent` - Tìm kiếm sản phẩm
- `SearchSupplierDialogComponent` - Tìm kiếm nhà cung cấp

## NPM Scripts

```bash
npm start          # ng serve (port 4200)
npm run build      # Production build
npm run test       # Karma tests
npm run e2e        # Protractor E2E tests
npm run lint       # TSLint
```

## Docker

```bash
docker compose up -d    # Start (port 4201)
docker compose down     # Stop
docker compose logs -f  # Logs
```

## Project Statistics

| Metric | Value |
|--------|-------|
| TypeScript Lines | ~70,000+ |
| Service Files | ~78 |
| Component Files | ~239 |
| Module Files | ~51 |
| npm Dependencies | ~80 packages |
