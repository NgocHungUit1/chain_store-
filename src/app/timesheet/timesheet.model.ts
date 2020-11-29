import { ApiFilterBase } from '../shared/base';
import {Employee} from '../employee/employee.model';
import {Shifts} from '../shifts/shifts.model';

export class Timesheet {
  id: string;
  employee_id: string;
  shifts_id: string;
  from_date: string;
  to_date: number;
  is_repeat: string;
  repeat_type: string;
  repeat_each: string;
  repeat_days_of_week: string;
  note: string;
  status: string;
  employee: Employee;
  shifts: Shifts;
}


export class TimesheetFilter extends ApiFilterBase {
  id = '';
  employee_id = '';
  shifts_id = '';
  from_date = '';
  to_date = '';
  is_repeat = '';
  repeat_type = '';
  repeat_each = '';
  repeat_days_of_week = '';
  note = '';
  status = '';
  page = 1;
  pageSize = 10;
  sort = '';

  getModelSearch() {
    return 'TimesheetSearch';
  }

}
