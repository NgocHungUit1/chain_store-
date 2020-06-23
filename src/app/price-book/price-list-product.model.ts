import { ApiFilterBase } from "../shared/base";
import { Product } from '../product/product.model';

export class PriceListProductCommon {
  id: string;
  price_list_id: string;
  product_id: string;
  price: string;
}

export class PriceListProduct {
  id: string;
  price_list_id: string;
  product_id: string;
  product: Product;
  price: string;
  common: any;
}


export class PriceListProductFilter extends ApiFilterBase {
  id = '';
  price_list_id = '';
  product_id = '';
  price = '';
  page = 1;
  pageSize = 15;
  sort = '';

  getModelSearch() {
    return 'PriceListProductSearch';
  }

}
