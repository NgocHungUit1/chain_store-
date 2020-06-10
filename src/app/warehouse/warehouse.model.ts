import {ApiFilterBase} from '../shared/base';
import {Location} from '../location/location.model';
import {Product} from '../product/product.model';

export class Warehouse {
  id: string;
  name: string;
  company_name: string;
  phone_number: string;
  email: string;
  tax_code: string;
  branch_id: number;
  note: string;
  status: string;
  address: string;
  province: Location;
  district: Location;
  ward: Location;
}

export class WarehouseFilter extends ApiFilterBase {
  id = '';
  name = '';
  company_name = '';
  phone_number = '';
  email = '';
  tax_code = '';
  branch_id = '';
  note = '';
  address = '';
  status = '';
  page = 1;
  pageSize = 15;
  sort = '';

  getModelSearch() {
    return 'WarehouseSearch';
  }
}

export class WarehouseProduct {
  id: string;
  product_id: number;
  product: Product;
  quantity: number;
  price: number;
  discount: number;
  amount: number;
}

export class WarehouseProductFilter extends ApiFilterBase {
  id = '';
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
