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

export class Invoice {
  id: string;
  invoice_no: string;
  customer: Customer;
  discount: string;
  discount_type: string;
  note: string;
  priceBook: PriceList;
  store: Store;
  payment: object[];
  detail: object[]; // @NGHIA
  user: User;
  created_by: string;
  created_at: string;
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
