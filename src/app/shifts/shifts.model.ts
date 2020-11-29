import { ApiFilterBase } from '../shared/base';

export class Shifts {
  id: string;
  name: string;
  branch_id: string;
  from_time: string;
  to_time: string;
  status: string;
}


export class ShiftsFilter extends ApiFilterBase {
  id = '';
  name = '';
  branch_id = '';
  from_time = '';
  to_time = '';
  status = '';
  page = 1;
  pageSize = 15;
  sort = '';

  getModelSearch() {
    return 'ShiftsSearch';
  }

}
