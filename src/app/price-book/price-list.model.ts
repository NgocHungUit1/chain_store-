import { ApiFilterBase } from "../shared/base";

export class PriceList {
  id: string;
  name: string;
}


export class PriceListFilter extends ApiFilterBase {
  id = '';
  name = '';
  page = 1;
  pageSize = 15;
  sort = '';

  getModelSearch() {
    return 'PriceListSearch';
  }

}
