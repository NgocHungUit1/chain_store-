import { ApiFilterBase } from '../shared/base';
import {User} from '../user/user.model';

export class PaySheet {
  id: number;
  name: string;
  total_employee: number;
  branch_id: number;
  salary_period: number;
  start_time: string;
  end_time: string;
  working_day_number: string;
  note: string;
  status: number;
  created_at: string;
  updated_at: string;
  created_by: number;
  updated_by: number;
  branch: any;
  totalSalary: number;
  totalPaymentSalary: number;
  totalEmployee: number;
  totalPaymentEmployee: number;
  listPaySlip: any;
  createUser: User;
  updateUser: User;
}


export class PaySheetFilter extends ApiFilterBase {
  id = '';
  salary_period = '';
  start_time = '';
  end_time = '';
  note = '';
  status = '';
  page = 1;
  pageSize = 10;
  sort = '';

  getModelSearch() {
    return 'PaySheetSearch';
  }

}
