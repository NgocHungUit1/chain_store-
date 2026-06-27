import { ApiFilterBase } from '../shared/base';

export class User {
  username: string;
}

export class Store {
  name: string;
}

export class StockTakeItem {
  id: string;
  stock_take_id: string;
  product_id: string;
  product: object;
  product_unit_id: string;
  parcel_no: string;
  expiration_date: string;
  lots: any[];
  lot_base_qty: number;
  quantity_of_stock: number;
  actual_number: number;
  deviation_number: number;
  deviation_price: number;
  price: number;
  productUnits: object[];
  view_quantity_of_stock: number;
  product_name: string;
  product_no: string;
}

export class StockTakeItemFilter extends ApiFilterBase {
  id = '';
  stock_take_id = '';
  product_id = '';
  product_unit_id = '';
  quantity_of_stock = '';
  actual_number = '';
  deviation_number = '';
  deviation_price = '';
  page = 1;
  pageSize = 15;
  sort = '';
  date_from = '';
  date_to = '';

  getModelSearch() {
    return 'StockTakeItemSearch';
  }
}

export class StockTake {
  id: string;
  no: string;
  total_price: number;
  actual_number: number;
  actual_price: number;
  balance_at: number;
  balance_by: number;
  note: string;
  store: Store;
  stockTakeItem: StockTakeItem[];
  balance_status: string;
  user: User;
  created_at: any;
  status: string;
  balanceBy: object;
  deviationPriceSum: number; // tong gia tri lech
  totalPrice: number; // tong thuc te
}

export class StockTakeFilter extends ApiFilterBase {
  id = '';
  no = '';
  total_price = '';
  actual_number = '';
  actual_price = '';
  balance_at = '';
  balance_by = '';
  status = '';
  page = 1;
  pageSize = 15;
  sort = '';
  date_from = '';
  date_to = '';
  keyword = '';
  balance_status = '';

  getModelSearch() {
    return 'StockTakeSearch';
  }
}

export class DateFilter {
  date_from: string;
  date_to: string;
}


export class resStockTakePrint {
  id: string;
  no: string;
  total_price: number;
  actual_number: number;
  actual_price: number;
  balance_at: string;
  note: string;
  store: Store;
  stockTakeItem: StockTakeItem[];
  balance_status: string;
  balance_by: User;
  branch: string;
  user: User;
  created_at: string;
  created_by: User;
  status: string;
  balanceBy: User;
  deviationPriceSum: number; // tong gia tri lech
  totalPrice: number; // tong thuc te
  date: string;
  detail: StockTakeItem[];
}
