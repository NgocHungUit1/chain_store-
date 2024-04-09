import { ApiFilterBase } from '../shared/base';
import { Product } from '../product/product.model';
import {Warehouse, WarehouseProduct} from '../warehouse/warehouse.model';

export class WarehouseProductParcel {
  id: number;
  warehouse_product_id: number;
  product_id: number;
  parcel_no: string;
  quantity: number;
  quantity_of_stock: number;
  manufacture_date: string;
  expiration_date: string;
  warehouseProduct: WarehouseProduct;
  warehouse: Warehouse;
  product: Product;
}

export class WarehouseProductParcelFilter extends ApiFilterBase {
  id = 0;
  parcel_no = '';
  product_id = '';
  hasStock = 0;
  warehouse_product_id = 0;
  quantity = 0;
  quantity_of_stock = 0;
  manufacture_date = '';
  expiration_date = '';
  timeSelect = '';
  page = 1;
  pageSize = 15;
  sort = '';
  keyword = '';
  date_from = '';
  date_to = '';

  getModelSearch() {
    return 'WarehouseProductParcelSearch';
  }
}

