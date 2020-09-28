import { ApiFilterBase } from '../shared/base';

export class User {
  id: string;
  username: string;
  phone_number: string;
  email: string;
  status: string;
  employee: any;
}


export class UserFilter extends ApiFilterBase {
  id = '';
  username = '';
  email = '';
  phone_number = '';
  status = '';
  employee_id = '';
  page = 1;
  pageSize = 15;
  sort = '';

  getModelSearch() {
    return 'UserSearch';
  }

}
