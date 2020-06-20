import { ApiFilterBase } from "../shared/base";

export class PriceList {
  id: string;
  name: string;
  is_default: number;
  date_from: string;
  date_to: string;
  status: string;
}


export class PriceListFilter extends ApiFilterBase {
  id = '';
  name = '';
  date_from = '';
  date_to = '';
  page = 1;
  pageSize = 15;
  sort = '';

  getModelSearch() {
    return 'PriceListSearch';
  }

}
