import { ApiFilterBase } from '../shared/base';

export class User {
  username: string;
}

export class Store {
  name: string;
}

export class Move {
  id: string;
  no: string;
  date: string;
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


export class MoveFilter extends ApiFilterBase {
  id = '';
  no = '';
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
    return 'MoveSearch';
  }
}

export class MoveDetail {
  id: string;
  sample_prescription_id: string;
  product_id: string;
  product_no: string;
  amount: number;
  note: number;
  product: object;
  product_unit_id: string;
  productUnits: object[];
}

export class MoveDetailFilter extends ApiFilterBase {
  id = '';
  no = '';
  sample_prescription_id = '';
  product_id = '';
  product_no = '';
  product_unit_id = '';
  amount = '';
  note = '';
  page = 1;
  pageSize = 15;
  sort = '';

  getModelSearch() {
    return 'MoveDetailSearch';
  }
}


