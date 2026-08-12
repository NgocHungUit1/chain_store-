# Invoice & Finance Workflow - Pharma Store (RX20)

## Tổng quan

Hệ thống quản lý hóa đơn, thu chi, kế toán, và theo dõi tuân thủ dược.

## Invoice (Hóa đơn bán hàng)

### Quy trình
```
1. Hóa đơn được tạo TỰ ĐỘNG khi hoàn tất đơn hàng (Sale)
2. Quản lý hóa đơn:
   ├── Xem danh sách (filter theo ngày, trạng thái, khách hàng)
   ├── Xem chi tiết
   ├── In hóa đơn (template configurable)
   ├── Xử lý thanh toán bổ sung
   └── Trả hàng / hoàn tiền
```

### Key Files
| File | Vai trò |
|------|---------|
| `invoice/invoice-list/` | Danh sách hóa đơn |
| `invoice/invoice-detail/` | Chi tiết hóa đơn |
| `invoice/invoice.service.ts` | CRUD hóa đơn |
| `invoice/invoice.model.ts` | Models |

### Invoice Template System
```
shared/invoice-handle/
├── invoice-template.service.ts  # Quản lý template
├── print.service.ts             # In hóa đơn
└── preview.service.ts           # Xem trước
```

## Cash Flow (Thu chi)

### Module: `/cash-flow`
- **Receipt (Phiếu thu)**: Ghi nhận khoản thu
- **Payment (Phiếu chi)**: Ghi nhận khoản chi
- Filter theo: loại, ngày, số tiền, người tạo

## Expenses (Chi phí)

### Expenses Order (`/expenses-order`)
- Tạo đơn chi phí (lương, thuê mặt bằng, điện nước, ...)

### Expenses Transaction (`/expenses-transaction`)
- Ghi nhận giao dịch chi phí thực tế

## Accounting Book (Sổ kế toán)

### Module: `/accounting-book`
- **Bank Book (Sổ ngân hàng)**: Giao dịch qua ngân hàng
- **Cash Book (Sổ tiền mặt)**: Giao dịch tiền mặt
- **Stock Detail (Chi tiết tồn kho)**: Giá trị hàng tồn kho

## Follow Book (Sổ theo dõi dược)

### Module: `/follow-book`
11 loại sổ theo dõi tuân thủ quy định dược:
- Sổ theo dõi bán thuốc theo đơn
- Sổ theo dõi thuốc kiểm soát đặc biệt
- Sổ theo dõi thuốc gây nghiện
- Sổ theo dõi thuốc hướng tâm thần
- Và các sổ theo dõi khác theo quy định

## Pay Sheet (Bảng lương)

### Module: `/pay-sheet`
- Tính lương nhân viên
- Dựa trên chấm công (timesheet)
- Phụ cấp, thưởng, khấu trừ

## Reporting (Báo cáo)

### Module: `/report`
| Sub-module | Mô tả |
|-----------|--------|
| `sale-report/` | Báo cáo doanh thu bán hàng |
| `product-report/` | Báo cáo tồn kho, xuất nhập |
| `employee-report/` | Báo cáo hiệu suất nhân viên |
| `debt-suppliers/` | Công nợ nhà cung cấp |
| `debt-customers/` | Công nợ khách hàng |
| `invoice-report/` | Thống kê hóa đơn |
| `day-report/` | Báo cáo cuối ngày |

### Export
- Excel export: sử dụng thư viện `xlsx`
- PDF export: sử dụng `jsPDF` + `dom-to-image`
