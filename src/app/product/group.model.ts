import { ApiFilterBase } from "../shared/base";

export class Group {
  id: number;
  store_id: number;
  name: string;
  parent_id: number;
  description: string;
  status: string;
}


export class GroupFilter extends ApiFilterBase {
  id = '';
  name = '';
  parent_id = 0;
  store_id = 0;
  description = '';
  status = '';
  page = 1;
  pageSize = 15;
  sort = '';
  keyword = '';
  date_from = '';
  date_to = '';
  product_type = '';

  getModelSearch() {
    return 'GroupSearch';
  }

}
