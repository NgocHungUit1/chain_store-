import { ApiFilterBase } from '../shared/base';

export class User {
  username: string;
}

export class Store {
  name: string;
}

export class SamplePrescription {
  id: string;
  no: string;
  total_price: number;
  actual_number: number;
  actual_price: number;
  balance_at: number;
  balance_by: number;
  note: string;
  store: Store;
  balance_status: string;
  user: User;
  created_at: any;
  status: string;
  balanceBy: object;
}

export class SamplePrescriptionFilter extends ApiFilterBase {
  id = '';
  no = '';
  total_price = '';
  actual_number = '';
  actual_price = '';
  balance_at = '';
  balance_by = '';
  status = '';
  page = 1;
  pageSize = 15;
  sort = '';
  date_from = '';
  date_to = '';
  keyword = '';
  balance_status = '';

  getModelSearch() {
    return 'SamplePrescriptionSearch';
  }
}


