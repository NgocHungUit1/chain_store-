import { Customer } from '../customer/customer.model';
import { ApiFilterBase } from '../shared/base';
import { PriceList } from '../price-book/price-list.model';
import { Branch } from '../branch/branch.model';
import { ExpensesOrder } from '../expenses-order/expenses-order.model';
import { Product, Quantity } from '../product/product.model';

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
  product: Product;
  quantity: Quantity;
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
  order_status: string;
  user: User;
  created_by: string;
  created_at: any;
  stt: number; // for view
  status: number; // for view
  national_pharmacy_no: string; // for view
  branch: Branch;
  expensesOrders: ExpensesOrder[];
  expenses_order_price: number;
  prescription_id: string;
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
  date_from = '';
  date_to = '';
  national_pharmacy_no = '';
  order_status = '';
  order_national = '';
  product_id = '';
  users = '';
  created_by = '';

  getModelSearch() {
    return 'InvoiceSearch';
  }

}

export class DateFilter {
  date_from: string;
  date_to: string;
}


export class InvoiceDetailFilter extends ApiFilterBase {
  id = '';
  invoice_id = '';
  product_id = '';
  amount = '';
  note = '';
  price = '';
  discount = '';
  discount_type = '';
  page = 1;
  pageSize = 15;

  getModelSearch() {
    return 'InvoiceDetailSearch';
  }
}
