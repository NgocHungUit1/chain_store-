import {ApiFilterBase} from '../shared/base';
import {Location} from '../location/location.model';

export class Supplier {
  id: string;
  name: string;
  company_name: string;
  phone_number: string;
  email: string;
  tax_code: string;
  branch_id: number;
  note: string;
  status: string;
  address: string;
  province: Location;
  district: Location;
  ward: Location;
  stt: number; // for view
}


export class SupplierFilter extends ApiFilterBase {
  id = '';
  name = '';
  company_name = '';
  phone_number = '';
  email = '';
  tax_code = '';
  branch_id = '';
  note = '';
  address = '';
  status = '';
  page = 1;
  pageSize = 15;
  sort = '';
  date_from = '';
  date_to = '';

  getModelSearch() {
    return 'SupplierSearch';
  }

}

export class DateFilter {
  date_from: string;
  date_to: string;
}
