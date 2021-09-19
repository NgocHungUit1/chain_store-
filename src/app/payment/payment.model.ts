import {ApiFilterBase} from '../shared/base';

export interface Payment {
  id: number;
  invoice_id: number;
  payment_no: string;
  total_price: number;
  debt: number;
  payment_method: string;
  status: number;
  stt: number; // for view
}

export class PaymentFilter extends ApiFilterBase {
  invoice_id = '';
  total_price = '';
  debt = '';
  page = 1;
  pageSize = 15;
  date_from = '';
  date_to = '';

  getModelSearch() {
    return 'PaymentSearch';
  }
}

export class DateFilter {
  date_from: string;
  date_to: string;
}
