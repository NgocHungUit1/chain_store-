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
  stt: number; // for view
}


export class CustomerFilter extends ApiFilterBase {
  id = '';
  ids = '';
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
  date_from = '';
  date_to = '';

  getModelSearch() {
    return 'CustomerSearch';
  }

}

export class DateFilter {
  date_from: string;
  date_to: string;
}
