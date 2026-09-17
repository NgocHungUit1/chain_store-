import { ApiFilterBase } from '../shared/base';

/**
 * Phiếu tồn đầu — khai báo hàng có sẵn trong kho khi bắt đầu dùng phần mềm.
 *
 * Dùng chung bảng `warehouse` với phiếu nhập ở backend (type = 'import',
 * is_opening_balance = 1) nên search model vẫn là WarehouseSearch.
 */
export class OpeningBalance {
  id: string;
  no: string;
  date: string;
  branch_id: number;
  note: string;
  status: number;
  total_price: number;
  total_amount: number;
  is_opening_balance: number;
  created_by: number;
  created_at: number;
  warehouseProducts: any[];

  // Tính ở client cho màn danh sách
  stt: number;
  product_count: number;
  total_quantity: number;
}

export class OpeningBalanceFilter extends ApiFilterBase {
  id = '';
  no = '';
  note = '';
  status = '';
  branch_id = '';
  keyword = '';
  date_from = '';
  date_to = '';
  page = 1;
  pageSize = 15;
  sort = '';

  getModelSearch() {
    return 'WarehouseSearch';
  }
}

/** Một dòng trong lưới chi tiết phiếu. */
export class OpeningBalanceItem {
  id: string = null;
  product_id: number;
  product_no: string;
  product_name: string;
  product_unit_id: number;
  unit_name: string;
  unit_value = 1;
  /** Sản phẩm bắt buộc khai lô (thuốc hoặc đã bật quản lý theo lô). */
  require_parcel = false;
  productUnits: any[] = [];

  parcel_no: string = null;
  expiration_date: string = null;
  quantity = 0;
  price = 0;
  amount = 0;
  sell_price: number = null;
  placement: string = null;
  note: string = null;

  /** Mã cảnh báo hiển thị ngay trên dòng (V08, V09...). */
  warnings: string[] = [];

  /**
   * Khai được lên Dược Quốc gia hay chưa (backend: product ?expand=nationalPharmacyCheck).
   * null khi chưa tải xong.
   */
  dqg: { status: 'ready' | 'blocked' | 'not_required', reasons: string[] } = null;
}

/** Trạng thái phiếu — dùng đúng hai trạng thái sẵn có của phiếu nhập. */
export const OPENING_BALANCE_STATUS = {
  DRAFT: 9,
  DONE: 10,
};

export const OPENING_BALANCE_STATUS_LABEL = {
  9: 'Lưu tạm',
  10: 'Hoàn thành',
};

export const OPENING_BALANCE_STATUS_CLASS = {
  9: 'label label-warning',
  10: 'label label-success',
};
