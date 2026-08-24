# Warehouse Workflow - Pharma Store (RX20)

## Tổng quan

Module Warehouse quản lý toàn bộ nhập/xuất kho, bao gồm nhập hàng từ nhà cung cấp, trả hàng, và quản lý lô hàng.

## Quy trình nhập hàng

```
1. Tạo phiếu nhập (Warehouse Import)
   ├── Chọn nhà cung cấp
   ├── Thêm sản phẩm
   │   ├── Tìm kiếm sản phẩm
   │   ├── Nhập thông tin lô hàng (Parcel)
   │   │   ├── Số lô
   │   │   ├── Hạn sử dụng
   │   │   ├── Giá nhập
   │   │   ├── Số lượng
   │   │   └── Đơn vị tính
   │   └── Có thể nhập nhiều lô cho 1 sản phẩm
   ├── Tính tổng tiền nhập
   ├── Áp dụng chiết khấu (nếu có)
   └── Xác nhận nhập kho

2. Xử lý sau nhập
   ├── Cập nhật tồn kho
   ├── Ghi nhận công nợ nhà cung cấp
   ├── Liên kết hóa đơn điện tử (e-invoice)
   └── In phiếu nhập
```

## Quy trình trả hàng

```
1. Tạo phiếu trả hàng
   ├── Chọn phiếu nhập gốc
   ├── Chọn sản phẩm/lô cần trả
   ├── Nhập số lượng trả
   ├── Lý do trả
   └── Xác nhận trả

2. Xử lý sau trả
   ├── Cập nhật tồn kho (giảm)
   ├── Cập nhật công nợ
   └── In phiếu trả
```

## Key Files

| File | Vai trò |
|------|---------|
| `warehouse/warehouse-list/` | Danh sách phiếu nhập/xuất |
| `warehouse/warehouse-import-form/` | Form nhập hàng |
| `warehouse/warehouse.service.ts` | Service quản lý kho |
| `warehouse/warehouse.model.ts` | Models |
| `warehouse/warehouse-parcel-form-dialog/` | Dialog lô hàng |
| `warehouse/warehouse-parcel-form-dialog-new/` | Dialog lô hàng (version mới) |
| `warehouse/warehouse-return-form/` | Form trả hàng |
| `warehouse/warehouse-einvoice-tab/` | Tab hóa đơn điện tử |
| `warehouse/warehouse-confirm-load-data-form/` | Confirm load data |

## Routing

```
/transaction        → Warehouse List (danh sách phiếu)
/transaction/import → Import Form (nhập hàng)
/transaction/return → Return Form (trả hàng)
```

## Lô hàng (Parcel)

Mỗi sản phẩm nhập kho được quản lý theo lô:
- **Số lô (batch_number)**: Mã lô do nhà sản xuất
- **Hạn sử dụng (expiry_date)**: Quan trọng cho dược phẩm
- **Giá nhập (import_price)**: Giá nhập theo lô
- **Số lượng (quantity)**: Số lượng nhập
- **Đơn vị tính (unit)**: Đơn vị tính cho lô

## E-Invoice Integration

Module warehouse tích hợp hóa đơn điện tử (e-invoice) qua Syncfusion components:
- Upload/view e-invoice
- Mapping sản phẩm từ e-invoice sang hệ thống
- Xác nhận và liên kết
