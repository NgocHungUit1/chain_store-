import { ApiFilterBase } from '../shared/base';

export class CashFlow {
  id: string;
  no: string;
  code: string;
  created_at: string;
  value: string;
  ten_nguoi_nop: string;
  doi_tuong_nop: string;
  type_money: any;
  type: any;
  note: string;
  parent_table: string;
  parent_id: string;
}


export class CashFlowFilter extends ApiFilterBase {
  id = '';
  no = '';
  created_at = '';
  value = '';
  ten_nguoi_nop = '';
  employee_id = '';
  page = 1;
  pageSize = 15;
  sort = '';

  getModelSearch() {
    return 'CashFlowSearch';
  }

}
