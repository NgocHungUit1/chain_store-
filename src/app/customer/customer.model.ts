import { ApiFilterBase } from '../shared/base';
import { Location } from '../location/location.model';

export class Customer {
  id: string;
  name: string;
  company_name: string;
  phone: string;
  sex: number;
  dob: string;
  email: string;
  tax_code: string;
  facebook: string;
  note: string;
  status: string;
  address: string;
  province: Location;
  district: Location;
  ward: Location;
}


export class CustomerFilter extends ApiFilterBase {
  id = '';
  name = '';
  company_name = '';
  phone = '';
  sex = '';
  dob = '';
  email = '';
  tax_code = '';
  facebook = '';
  note = '';
  address = '';
  status = '';
  page = 1;
  pageSize = 15;
  sort = '';

  getModelSearch() {
    return 'CustomerSearch';
  }

}
