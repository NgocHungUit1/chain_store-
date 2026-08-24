# Module Structure - Pharma Store (RX20)

## Tổng quan kiến trúc

```
/src/app/
├── app.module.ts              # Root module (global imports, providers)
├── app.component.ts           # Root component
├── app.routing.ts             # Main routing (lazy-loaded modules)
├── demo-material-module.ts    # Centralized Material imports
│
├── layouts/                   # 3 Layout wrappers
│   ├── full/                  # Main layout (sidebar + header + breadcrumb)
│   ├── cart/                  # POS layout (header only)
│   └── blank/                 # Auth layout (no chrome)
│
├── shared/                    # Shared utilities
│   ├── base.ts                # Base classes (ApiFilterBase, BaseComponent, ListComponentBase)
│   ├── shared.module.ts       # SharedModule
│   ├── spinner.component.ts   # Loading spinner
│   ├── menu-items/            # Sidebar menu config
│   ├── accordion/             # Accordion directive
│   ├── popover/               # Popover component
│   ├── shared-editor/         # Rich text editor
│   ├── invoice-handle/        # Invoice print/preview services
│   │   ├── invoice-template.service.ts
│   │   ├── print.service.ts
│   │   └── preview.service.ts
│   ├── services/              # Shared services (date-filter, etc.)
│   ├── filter.pipe.ts         # Filter pipe
│   ├── includes.pipe.ts       # Includes pipe
│   └── slice.pipe.ts          # Slice pipe
│
├── common/                    # Reusable components
│   ├── common.module.ts
│   ├── popup-delete-dialog/
│   ├── popup-confirm-dialog/
│   ├── search-product-dialog/
│   ├── search-supplier-dialog/
│   ├── model-change-log/
│   ├── input-select-all/
│   └── option-store.service.ts  # Shared dropdown data
│
├── authentication/            # Auth module
│   ├── auth.service.ts        # Token + permission management
│   ├── auth-token.interceptor.ts  # Add Bearer token
│   ├── auth.interceptor.ts    # Handle 401
│   ├── login/
│   ├── register/
│   ├── forgot/
│   └── error/
│
└── [feature modules]/         # 50+ feature modules (lazy-loaded)
```

## Feature Modules Chi Tiết

### Sale Module (POS - phức tạp nhất)
```
/src/app/sale/
├── sale.module.ts
├── sale.routing.ts
├── sale-main/                       # Trang bán hàng chính
│   └── sale-main.component.ts       # POS interface
├── order.model.ts                   # Order, OrderItem, Cart models
├── order.service.ts                 # ~19,000 lines - Core sale logic
├── sale-column-visibility.service.ts
├── payment-dialog/                  # Dialog thanh toán
├── sale-discount-dialog/            # Dialog giảm giá
├── sale-note-dialog/                # Dialog ghi chú
├── customer-dialog/                 # Dialog chọn khách hàng
├── prescription-dialog/             # Dialog đơn thuốc
├── medical-facility-dialog/         # Dialog cơ sở y tế
├── sale-notification/               # Thông báo giao dịch
├── sale-history-dialog/             # Lịch sử bán hàng
└── ...
```

### Warehouse Module
```
/src/app/warehouse/
├── warehouse.module.ts
├── warehouse.routing.ts
├── warehouse.service.ts
├── warehouse.model.ts
├── warehouse-list/                  # Danh sách phiếu nhập/xuất
├── warehouse-import-form/           # Form nhập hàng
├── warehouse-parcel-form-dialog/    # Dialog lô hàng
├── warehouse-parcel-form-dialog-new/
├── warehouse-confirm-load-data-form/
├── warehouse-return-form/           # Form trả hàng
├── warehouse-einvoice-tab/          # Tab hóa đơn điện tử
└── ...
```

### Invoice Module
```
/src/app/invoice/
├── invoice.module.ts
├── invoice.routing.ts
├── invoice.service.ts
├── invoice.model.ts
├── invoice-list/                    # Danh sách hóa đơn
├── invoice-detail/                  # Chi tiết hóa đơn
├── invoice-payment/                 # Thanh toán hóa đơn
├── invoice-return/                  # Trả hóa đơn
└── ...
```

### Product Module
```
/src/app/product/
├── product.module.ts
├── product.routing.ts
├── product.service.ts
├── product.model.ts
├── product-list/                    # Danh sách sản phẩm
├── product-detail/                  # Chi tiết sản phẩm
├── product-form/                    # Form thêm/sửa
├── product-new-unit/                # Thêm đơn vị tính
├── product-upload/                  # Upload sản phẩm
├── product-manufacturer/            # Nhà sản xuất
└── ...
```

### Report Module (composite)
```
/src/app/report/
├── report.module.ts
├── report.routing.ts
├── sale-report/                     # Báo cáo bán hàng
├── product-report/                  # Báo cáo tồn kho
├── employee-report/                 # Báo cáo nhân viên
├── debt-suppliers/                  # Công nợ nhà cung cấp
├── debt-customers/                  # Công nợ khách hàng
├── invoice-report/                  # Báo cáo hóa đơn
├── day-report/                      # Báo cáo ngày
└── ...
```

### Financial Modules
```
/src/app/cash-flow/                  # Quản lý thu chi
├── payment/                         # Phiếu chi
├── receipt/                         # Phiếu thu
└── ...

/src/app/accounting-book/            # Sổ kế toán
├── bank-book/                       # Sổ ngân hàng
├── cash-book/                       # Sổ tiền mặt
├── stock-detail/                    # Chi tiết tồn kho
└── ...

/src/app/follow-book/                # Sổ theo dõi dược (11 loại)
├── follow-book-1/ ... follow-book-11/
└── ...
```

### Settings Module
```
/src/app/settings/
├── settings.module.ts
├── store-info/                      # Thông tin cửa hàng
├── user-setting/                    # Cài đặt người dùng
├── notification-setting/            # Cài đặt thông báo
├── print-setting/                   # Cài đặt in ấn
├── edit-invoice-dialog/             # Chỉnh sửa template hóa đơn
└── ...
```

### Other Modules
```
/src/app/customer/                   # Quản lý khách hàng
/src/app/supplier/                   # Quản lý nhà cung cấp
/src/app/user/                       # Quản lý người dùng
/src/app/employee/                   # Quản lý nhân viên
/src/app/branch/                     # Quản lý chi nhánh
/src/app/doctor/                     # Quản lý bác sĩ
/src/app/group/                      # Nhóm khách/NCC
/src/app/stock-take/                 # Kiểm kê
/src/app/move/                       # Chuyển kho
/src/app/returns/                    # Trả hàng
/src/app/price-book/                 # Bảng giá
/src/app/point/                      # Điểm tích lũy
/src/app/bank-account/               # Tài khoản ngân hàng
/src/app/expenses-order/             # Đơn chi phí
/src/app/expenses-transaction/       # Giao dịch chi phí
/src/app/pay-sheet/                  # Bảng lương
/src/app/holiday/                    # Ngày nghỉ
/src/app/shifts/                     # Ca làm việc
/src/app/clocking/                   # Chấm công
/src/app/timesheet/                  # Bảng chấm công
/src/app/national-prescription/      # Đơn thuốc quốc gia
/src/app/sample-prescription/        # Đơn thuốc mẫu
/src/app/location/                   # Địa điểm
/src/app/partner/                    # Đối tác
/src/app/support/                    # Hỗ trợ
```

## Routing Map

```typescript
// app.routing.ts - FullComponent layout
/dashboard          → DashboardsModule
/store              → StoreModule
/partner            → PartnerModule
/transaction        → WarehouseModule
/invoice            → InvoiceModule
/returns            → ReturnsModule
/report             → ReportModule
/cash-flow          → CashFlowModule
/follow-book        → FollowBookModule
/accounting-book    → AccountingBookModule
/setting            → SettingsModule

// CartComponent layout
/sale               → SaleModule

// BlankComponent layout
/authentication     → AuthenticationModule
```

## Shared Services

| Service | Location | Mô tả |
|---------|----------|--------|
| `AuthService` | `authentication/auth.service.ts` | Token, permissions, login/logout |
| `OptionStoreService` | `common/option-store.service.ts` | Dropdown data (categories, units, etc.) |
| `DateFilterService` | `shared/services/` | Date range filter utilities |
| `SharedDataService` | `shared/services/` | Cross-component data sharing |
| `InvoiceTemplateService` | `shared/invoice-handle/` | Invoice template management |
| `PrintService` | `shared/invoice-handle/` | Print operations |
| `PreviewService` | `shared/invoice-handle/` | Preview operations |
