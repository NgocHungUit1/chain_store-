import { Customer } from "../customer/customer.model";
import { ApiFilterBase } from "../shared/base";
import { PriceList } from "../price-book/price-list.model";
import { ObjectLiteralElement } from "typescript";

export class User {
  username: string;
}

export class Store {
  name: string;
}

export class InvoiceDetail {
  id: string;
  invoice_id: string;
  product_id: string;
  amount: number;
  note: string;
  price: number;
  discount: number;
  discount_type: string;
}

export class Invoice {
  id: string;
  invoice_no: string;
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
  detail: InvoiceDetail[]; 
  user: User;
  created_by: string;
  created_at: string;
  stt: number; // for view
}

export class InvoiceFilter extends ApiFilterBase {
  id = '';
  invoice_no = '';
  customer_id = '';
  discount = '';
  discount_type = '';
  note = '';
  priceBook = '';
  status = '';
  page = 1;
  pageSize = 15;
  sort = '';

  getModelSearch() {
    return 'InvoiceSearch';
  }

}
