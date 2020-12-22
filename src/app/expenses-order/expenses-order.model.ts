import { ApiFilterBase } from '../shared/base';
import { User } from '../user/user.model';

export class ExpensesOrder {
  id: string;
  no: string;
  name: string;
  auto: string;
  return_auto: string;
  user: User;
  value: string;
  type: string;
  sort: string;
  status: number;
}


export class ExpensesOrderFilter extends ApiFilterBase {
  id = '';
  no = '';
  name = '';
  address = '';
  page = 1;
  pageSize = 15;
  sort = '';

  getModelSearch() {
    return 'ExpensesOrderSearch';
  }
}
