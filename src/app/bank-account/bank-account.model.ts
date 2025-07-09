import { ApiFilterBase } from '../shared/base';
import { Location } from '../location/location.model';

export interface VietQRBank {
  id: number;
  name: string;
  code: string;
  bin: string;
  shortName: string;
  logo: string;
  transferSupported: number;
  lookupSupported: number;
  short_name: string;
  support: number;
  isTransfer: number;
  swift_code: string;
}

export interface VietQRBankResponse {
  code: string;
  desc: string;
  data: VietQRBank[];
}

export class BankAccount {
  id: string;
  bank_code: string;
  account_name: string;
  branch_id: number;
  account_number: number;
  note: string;
  status: string;
  bank_name?: string;
  bank_logo?: string;

  static getBankCodes() {
    return {
      'vietcombank': 'Vietcom Bank',
      'techcombank': 'Techcombank',
      'bidv': 'BIDV',
      'vpbank': 'VPBank',
      'mbbank': 'MB Bank',
    };
  }
}


export class BankAccountFilter extends ApiFilterBase {
  id = '';
  bank_code = '';
  account_name = '';
  branch_id = 0;
  account_number: number;
  note = '';
  status = '';
  keyword = '';
  page = 1;
  pageSize = 15;
  sort = '';

  getModelSearch() {
    return 'BankAccountSearch';
  }

}
