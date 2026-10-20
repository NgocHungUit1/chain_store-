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
  id_card: string;
  facebook: string;
  note: string;
  drug_allergy: string; // Dị ứng thuốc, phân cách ;
  medical_history: string; // Bệnh nền, phân cách ;
  status: string;
  address: string;
  province: Location;
  ward: Location;
  stt: number; // for view
  total_point: number;
  total_invoice: number;
  total_debt: number;
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
  id_card = '';
  facebook = '';
  note = '';
  address = '';
  status = '';
  page = 1;
  pageSize = 15;
  sort = '';
  keyword = '';
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
