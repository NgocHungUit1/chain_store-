import { ApiFilterBase } from "../shared/base";

export class User {
  id: string;
  username: string;
  email: string;
  status: string;
}


export class UserFilter extends ApiFilterBase {
  id = '';
  username = '';
  email = '';
  status = '';
  page = 1;
  pageSize = 15;
  sort = '';

  getModelSearch() {
    return 'UserSearch';
  }

}
