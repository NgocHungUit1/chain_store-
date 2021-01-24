import { ApiFilterBase } from '../shared/base';

export class PaySlip {
  id: number;
  pay_sheet_id: number;
  employee_id: number;
  salary_type: number;
  salary_detail: any;
  total_net_salary: number;
  total_shifts: number;
  total_shifts_working_system: number;
  total_shifts_working_custom: number;
  total_day_working_system: number;
  total_day_working_custom: number;
  status: string;
}


export class PaySlipFilter extends ApiFilterBase {
  id = '';
  salary_type = '';
  pay_sheet_id = '';
  employee_id = '';
  status = '';
  page = 1;
  pageSize = 10;
  sort = '';

  getModelSearch() {
    return 'PaySlipSearch';
  }

}
