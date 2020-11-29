import { ApiFilterBase } from '../shared/base';
import { Location } from '../location/location.model';
import {User} from '../user/user.model';

export class Employee {
  id: string;
  name: string;
  user_name: string;
  id_card: string;
  sex: number;
  phone_number: string;
  birth_date: string;
  email: string;
  facebook: string;
  note: string;
  address: string;
  province: Location;
  district: Location;
  ward: Location;
  user: User;
  branchList: any;
}


export class EmployeeFilter extends ApiFilterBase {
  id = '';
  name = '';
  user_name = '';
  id_card = '';
  sex = '';
  birth_date = '';
  phone_number = '';
  email = '';
  facebook = '';
  note = '';
  address = '';
  page = 1;
  pageSize = 15;
  sort = '';
  isNotPageSize = false;

  getModelSearch() {
    return 'EmployeeSearch';
  }
}
