import { ApiFilterBase } from '../shared/base';
import {Timesheet} from '../timesheet/timesheet.model';

export class Clocking {
  id: string;
  timesheet_id: string;
  start_time: string;
  end_time: string;
  check_in_time: number;
  check_out_time: string;
  timekeeping_type: string;
  is_take_leave: string;
  over_time_after_shift_work: string;
  over_time_before_shift_work: string;
  time_is_late: string;
  time_is_leave_work_early:  string;
  status: string;
  note: string;
  timesheet: Timesheet;
}


export class ClockingFilter extends ApiFilterBase {
  id = '';
  timesheet_id = '';
  start_time = '';
  end_time = '';
  start_date = '';
  end_date = '';
  check_in_time = '';
  check_out_time = '';
  timekeeping_type = '';
  is_take_leave = '';
  time_is_late = '';
  time_is_leave_work_early = '';
  note = '';
  status: any = '';
  sort = '';
  employee_ids = '';
  shifts_ids = '';

  getModelSearch() {
    return 'ClockingSearch';
  }
}
