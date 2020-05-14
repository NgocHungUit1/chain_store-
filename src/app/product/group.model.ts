import {ApiFilterBase} from "../shared/base";

export class Group {
  id: string;
  name: string;
  description: string;
  status: string;
}


export class GroupFilter extends ApiFilterBase{
  id = '';
  name = '';
  description = '';
  status = '';
  page = 1;
  pageSize = 15;
  sort = '';

  getModelSearch() {
    return 'GroupSearch';
  }

}
