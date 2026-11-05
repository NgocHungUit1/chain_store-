/**
 * Tài khoản chỉ làm giao hàng (vai trò mẫu "Nhân viên giao hàng", chốt S8 05/11/2026): có trang giao hàng nhưng không có
 * màn nào của nhà thuốc. Đăng nhập là vào thẳng /shipper, không thấy menu nhà thuốc.
 */
export function isShipperOnly(permissions: string[]): boolean {
  const has = (p: string) => (permissions || []).indexOf(p) >= 0;
  return has('Shipper.List') && !has('Invoice.List') && !has('Prescription-Order.List') && !has('Product.List');
}
