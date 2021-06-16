import { ApiFilterBase } from '../shared/base';
import { Product } from '../product/product.model';
import { Supplier } from '../supplier/supplier.model';
import { User } from '../user/user.model';
import { ExpensesTransaction } from '../expenses-transaction/expenses-transaction.model';

export class Warehouse {
  id: string;
  no: string;
  supplier_id: number;
  discount_amount: number;
  discount_type: string;
  total_price: number;
  total_amount: number;
  paid_amount: number;
  total_quantity: number;
  product_count: number;
  note: string;
  status: number;
  type: string;
  remain_amount: string;
  national_pharmacy_no: string;
  supplier: Supplier;
  created_by: number;
  created_user: User;
  warehouseExpensess: ExpensesTransaction[];
  expenses_price: number;
}

export class WarehouseFilter extends ApiFilterBase {
  id = '';
  no = '';
  supplier_id = '';
  product_id = '';
  discount_amount = 0;
  total_price = 0;
  total_amount = 0;
  paid_amount = 0;
  note = '';
  remain_amount = '';
  type = '';
  status = '';
  page = 1;
  pageSize = 15;
  sort = '';
  keyword = '';
  date_from = '';
  date_to = '';
  order_national = '';

  getModelSearch() {
    return 'WarehouseSearch';
  }
}

export class WarehouseProduct {
  id: string;
  product_id: number;
  warehouse_id: number;
  product_unit_id: number;
  product: object;
  quantity: number;
  price: number;
  discount: number;
  discount_type: string;
  amount: number;
  note: string;
  productUnits: object[];
  productParcels: object[];
  product_parcels: object[];
  productParcelsForView: object[];
  productParcelsForViewHtml: string;
}

export class WarehouseProductFilter extends ApiFilterBase {
  id = '';
  warehouse_id = '';
  product_id = '';
  quantity = '';
  price = '';
  discount = '';
  amount = '';
  status = '';
  page = 1;
  pageSize = 15;
  sort = '';

  getModelSearch() {
    return 'WarehouseProductSearch';
  }

}


export class resWarehousePrint {
  id: string;
  no: string;
  supplier_id: number;
  discount_amount: number;
  discount_type: string;
  total_price: number;
  total_amount: number;
  paid_amount: number;
  total_quantity: number;
  product_count: number;
  note: string;
  status: number;
  type: string;
  remain_amount: string;
  national_pharmacy_no: string;
  supplier: Supplier;
  created_by: number;
  created_user: User;
  store: any;
  date: string;
  warehoureItems: any;
  // warehouseExpensess: ExpensesTransaction[];
  warehouseExpensess: string;
  expenses_price: number;
}

