# Sale Workflow - Pharma Store (RX20)

## Tổng quan

Module Sale (POS) là module phức tạp nhất trong hệ thống, xử lý toàn bộ quy trình bán hàng tại nhà thuốc.

## Quy trình bán hàng

```
1. Tạo đơn hàng (Order)
   ├── Chọn khách hàng (hoặc khách lẻ)
   ├── Thêm sản phẩm vào giỏ
   │   ├── Tìm kiếm theo tên/mã/barcode
   │   ├── Chọn đơn vị tính
   │   ├── Nhập số lượng
   │   └── Áp dụng giảm giá (nếu có)
   ├── Nhập đơn thuốc (nếu có)
   │   ├── Thông tin bác sĩ
   │   ├── Cơ sở y tế
   │   └── Nội dung đơn thuốc
   └── Ghi chú đơn hàng

2. Thanh toán
   ├── Tính tổng tiền (subtotal, discount, total)
   ├── Chọn phương thức thanh toán
   │   ├── Tiền mặt (Cash)
   │   ├── Chuyển khoản (Bank)
   │   └── Thẻ (Card)
   ├── Nhập số tiền khách đưa
   ├── Tính tiền thừa
   └── Xác nhận thanh toán

3. Hoàn tất
   ├── In hóa đơn (template configurable)
   ├── Cập nhật tồn kho (tự động)
   ├── Ghi nhận công nợ (nếu có)
   └── Tích điểm khách hàng (nếu có)
```

## Key Files

| File | Vai trò |
|------|---------|
| `sale/sale-main/sale-main.component.ts` | Component POS chính |
| `sale/order.model.ts` | Models: Order, OrderItem, Cart |
| `sale/order.service.ts` | Service xử lý đơn hàng (~19K lines) |
| `sale/payment-dialog/` | Dialog thanh toán |
| `sale/sale-discount-dialog/` | Dialog giảm giá |
| `sale/customer-dialog/` | Dialog chọn khách hàng |
| `sale/prescription-dialog/` | Dialog đơn thuốc |
| `sale/medical-facility-dialog/` | Dialog cơ sở y tế |
| `sale/sale-column-visibility.service.ts` | Dynamic table columns |

## Layout

Module Sale dùng **CartComponent** layout (không có sidebar), khác với các module khác dùng FullComponent:

```typescript
// app.routing.ts
{ path: '', component: CartComponent, children: [
  { path: 'sale', loadChildren: () => import('./sale/sale.module') }
]}
```

## Order Model Structure

```typescript
interface Order {
  id: number;
  code: string;
  customer_id: number;
  customer: Customer;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  total: number;
  payment_method: string;
  paid_amount: number;
  change_amount: number;
  note: string;
  prescription: Prescription;
  status: string;
  created_at: string;
}

interface OrderItem {
  product_id: number;
  product: Product;
  unit_id: number;
  unit_name: string;
  quantity: number;
  price: number;
  discount: number;
  total: number;
}
```

## Lưu ý quan trọng

1. **OrderService rất lớn** (~19,000 lines) - đọc kỹ trước khi sửa
2. **localStorage**: Order data được cache trong localStorage cho offline capability
3. **Multiple payment methods**: Hỗ trợ nhiều phương thức thanh toán cùng lúc
4. **Prescription**: Liên kết đơn thuốc là optional nhưng quan trọng cho nhà thuốc
5. **Column visibility**: Cột hiển thị trong bảng có thể customize bởi user
