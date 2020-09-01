import { Customer } from "../customer/customer.model";
import { ApiFilterBase } from "../shared/base";
import { PriceList } from "../price-book/price-list.model";

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
}

export class Returns {
  id: string;
  returns_no: string;
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
  order_status: string;
  user: User;
  created_by: string;
  created_at: string;
}

export class ReturnsFilter extends ApiFilterBase {
  id = '';
  returns_no = '';
  customer_id = '';
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
  national_pharmacy_no = '';

  getModelSearch() {
    return 'ReturnsSearch';
  }

}

