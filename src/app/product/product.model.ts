import {ApiFilterBase} from "../shared/base";

export class Product {
  id: string;
  product_no: string;
  barcode: string;
  product_name: string;
  original_price: number;
  sell_price: number;
  weight: number;
  quantity_of_stock: number;
  base_unit: string;
  status: string;
}


export class ProductFilter extends ApiFilterBase{
  id = '';
  product_no = '';
  barcode = '';
  product_name = '';
  original_price = '';
  sell_price = '';
  weight = '';
  quantity_of_stock = '';
  base_unit = '';
  status = '';
  page = 1;
  pageSize = 15;
  sort = '';

  getModelSearch() {
    return 'ProductSearch';
  }

}
