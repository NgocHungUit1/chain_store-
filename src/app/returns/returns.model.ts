import { Customer } from '../customer/customer.model';
import { ApiFilterBase } from '../shared/base';
import { PriceList } from '../price-book/price-list.model';
import { NationalPharmacyV2Transaction } from '../common/national-pharmacy-v2/national-pharmacy-v2.model';

export class User {
  username: string;
}

export class Store {
  name: string;
}

export class ReturnsDetail {
  id: string;
  invoice_id: string;
  product_id: string;
  amount: number;
  note: string;
  price: number;
  discount: number;
  discount_type: string;
  base_unit: string;
  product: {
    id?: string;
    product_no?: string;
    product_name?: string;
  };
  productUnit: {
    name?: string;
  };
}

export class Returns {
  id: string;
  invoice_id: number;
  /** API trả về field `return_no`; `returns_no` chỉ dùng cho filter */
  return_no: string;
  returns_no: string;
  customer_id: string;
  customer: Customer;
  total_price: number;
  total_payment: number;
  discount_price: number;
  discount: number;
  discount_type: string;
  note: string;
  priceBook: PriceList;
  store: Store;
  payment: object[];
  detail: ReturnsDetail[];
  detailInfo: ReturnsDetail[];
  order_status: string;
  user: User;
  created_by: string;
  created_at: string;
  /** Lần liên thông CSDL Dược quốc gia v1.1 gần nhất (?expand=nationalPharmacyV2) */
  nationalPharmacyV2: NationalPharmacyV2Transaction;
  return_reason_id: number;
  /** ?expand=returnReason */
  returnReason: {id: number, name: string};
}

export class ReturnsFilter extends ApiFilterBase {
  id = '';
  returns_no = '';
  customer_id = '';
  invoice_id = '';
  discount = '';
  discount_type = '';
  note = '';
  priceBook = '';
  status = '';
  page = 1;
  pageSize = 15;
  sort = '';
  date_from = '';
  date_to = '';
  medicine_code = '';
  national_pharmacy_no = '';
  keyword = '';
  return_reason_id = '';

  getModelSearch() {
    return 'ReturnsSearch';
  }

}


/** Một dòng thống kê: mỗi loại thuốc một dòng, số liệu của trọn kỳ đang lọc. */
export interface ReturnedItemStatistics {
  product_id: number;
  product_no: string;
  product_name: string;
  don_vi: string;
  so_luong_tra: number;
  so_phieu: number;
  thanh_tien: number;
}
