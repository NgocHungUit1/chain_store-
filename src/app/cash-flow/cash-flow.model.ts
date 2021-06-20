import { ApiFilterBase } from '../shared/base';

export class CashFlow {
  id: string;
  username: string;
  phone_number: string;
  email: string;
  status: string;
  employee: any;
  storeRole: any;
}


export class CashFlowFilter extends ApiFilterBase {
  id = '';
  username = '';
  email = '';
  phone_number = '';
  status = '';
  employee_id = '';
  store_role_id = '';
  not_employee = 0;
  page = 1;
  pageSize = 15;
  sort = '';

  getModelSearch() {
    return 'CashFlowSearch';
  }

}
