import { ApiFilterBase } from "../shared/base";

export class PriceBookProduct {
  id: string;
  product_no: string;
  barcode: string;
  product_name: string;
  original_price: number;
  sell_price: number;
  common_price: number;
  status: string;
  product_type: string;
}


export class PriceBookProductFilter extends ApiFilterBase {
  id = '';
  product_no = '';
  barcode = '';
  product_name = '';
  original_price = '';
  sell_price = '';
  common_price = '';
  status = '';
  page = 1;
  pageSize = 15;
  sort = '';

  getModelSearch() {
    return 'ProductSearch';
  }

}
