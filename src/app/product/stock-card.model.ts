import { ApiFilterBase } from '../shared/base';

export class StockCard {
  id: string;
  no: string;
  product_id: string;
  date: string;
  method: string;
  quantity: number;
  quantity_of_stock: number;
}


export class StockCardFilter extends ApiFilterBase {
  id = '';
  no = '';
  product_id = '';
  date = '';
  method = '';
  quantity = '';
  quantity_of_stock = '';
  page = 1;
  pageSize = 5;
  sort = '';

  getModelSearch() {
    return 'StockCardSearch';
  }

}
