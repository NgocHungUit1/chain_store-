import { ApiFilterBase } from '../shared/base';
import { User } from '../user/user.model';

export class ExpensesTransaction {
  id: string;
  no: string;
  name: string;
  auto: number;
  return_auto: string;
  user: User;
  value: number;
  type: string;
  sort: string;
  status: number;
  price: number;
  method: string;
}


export class ExpensesTransactionFilter extends ApiFilterBase {
  id = '';
  no = '';
  name = '';
  address = '';
  page = 1;
  pageSize = 15;
  sort = '';
  status = '';
  auto = '';

  getModelSearch() {
    return 'ExpensesTransactionSearch';
  }
}
