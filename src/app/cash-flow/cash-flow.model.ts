import { ApiFilterBase } from '../shared/base';

export class CashFlow {
  id: string;
  no: string;
  code: string;
  type: string;
  created_at: string;
  value: string;
  ten_nguoi_nop: string;
  doi_tuong_nop: string;
  type_money: any;
  note: string;
  parent_table: string;
  parent_id: string;
}


export class CashFlowFilter extends ApiFilterBase {
  id = '';
  no = '';
  type = '';
  created_at = '';
  value = '';
  ten_nguoi_nop = '';
  employee_id = '';
  page = 1;
  pageSize = 15;
  sort = '';
  date_from = '';
  date_to = '';

  getModelSearch() {
    return 'CashFlowSearch';
  }

}
