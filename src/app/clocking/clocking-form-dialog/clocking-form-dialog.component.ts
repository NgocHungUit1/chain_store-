import {Component, Inject, OnInit, Optional} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material/dialog';
import {NotifierService} from 'angular-notifier';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import * as moment from 'moment';
import {ClockingService} from '../clocking.service';
import {Employee} from '../../employee/employee.model';
import {Timesheet} from '../../timesheet/timesheet.model';
import {Clocking} from '../clocking.model';

@Component({
  selector: 'app-clocking-form-dialog',
  templateUrl: './clocking-form-dialog.component.html',
  styleUrls: ['./clocking-form-dialog.component.css']
})
export class ClockingFormDialogComponent implements OnInit {
  form: FormGroup;
  loading = false;
  local_data: any;
  clocking_id: string;
  employee: Employee;
  timesheet: Timesheet;
  clocking: Clocking;
  clockingDate;
  shiftsList: any = [];

  isDisabledCheckIn = true;
  isDisabledCheckOut = true;

  showStartDate = false;
  showEndDate = false;

  statusClocking = [
    {
      'name': 'Nghỉ',
    },
    {
      'name': 'Chưa vào - Chưa ra',

    },
    {
      'name': 'Chưa vào - Đã ra',
    },
    {
      'name': 'Đã vào - Chưa ra',
    },
    {
      'name': 'Đã vào - Đã ra',
    },
  ];

  timekeepingTypes = [
    {
      'value': '1',
      'name': 'Đi làm',
    },
    {
      'value': '2',
      'name': 'Nghỉ làm',
    },
  ];

  // phần này lưu ở bảng setting (hiện chưa có nên default = 0, nếu có sẽ viết api load lai data

  lateCheckInTime = 0; // làm trễ bắt đầu tính nếu về trước m(phút) trước khi kết thúc ca làm việc
  earlyCheckOutTime = 0; // vể sớm khi về trước m(phút) khi kết thúc ca làm việc

  lateCheckOutTimeOT = 0; // làm thêm bắt đầu tính sau m(phút) khi kết thúc ca làm việc
  earlyCheckInTimeOT = 0; // làm sớm trước bắt đầu tính nếu đi làm sớm trước m(phút)

  totalTimeCheckIn = 0; // thời gian làm trễ/ sớm trước ca làm việc (phút) (-: làm trễ, +: làm sớm)
  hoursCheckIn = 0;
  minuteCheckIn = 0;
  disableTotalTimeCheckIn = false;

  totalTimeCheckOut = 0; // thời gian về trễ/ sớm trước ca làm việc (phút) (-: về sớm, +: làm muộn)
  hoursCheckOut = 0;
  minuteCheckOut = 0;
  disableTotalTimeCheckOut = false;

  listStartDate = [];
  listEndDate = [];


  constructor(
    public dialogRef: MatDialogRef<ClockingFormDialogComponent>,
    public notifySer: NotifierService,
    private fb: FormBuilder,
    private clockingService: ClockingService,
    private dialog: MatDialog,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: Object
  ) {

    this.local_data = {...data};
    this.clocking_id = this.local_data.clocking_id;

  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  initForm() {
    this.form = this.fb.group({
      is_check_in: [null, null],
      is_check_out: [null, null],
      check_in_time: [null, null],
      check_out_time: [null, null],
      check_in_date: [null, null], // ngày check_in
      check_out_date: [null, null], // ngày check_out
      timekeeping_type: [this.timekeepingTypes[0].value, Validators.required],
      is_take_leave: [1, null],
      over_time_after_shift_work: [0],
      over_time_before_shift_work: [0],
      time_is_late: [0],
      time_is_leave_work_early: [0],
      note: [null],
    });
  }

  ngOnInit(): void {

    this.initForm();
    if (this.clocking_id !== null && this.clocking_id !== undefined) {
      this.loadClocking(this.clocking_id);
    }
  }

  loadClocking(id) {
    this.clockingService.getDetail(id).subscribe(clocking => {
      this.form.patchValue({
        is_check_in: !!clocking['check_in_time'],
        is_check_out: !!clocking['check_out_time'],
        check_in_time: clocking['check_in_time'] ? this.formatDateToTime(clocking['check_in_time']) : '',
        check_out_time: clocking['check_out_time'] ? this.formatDateToTime(clocking['check_out_time']) : '',
        check_in_date: this.formatDateToTime(clocking['check_in_time'] ? clocking['check_in_time'] : clocking['start_time'], true),
        check_out_date: this.formatDateToTime(clocking['check_out_time'] ? clocking['check_out_time'] : clocking['end_time'], true),
        timekeeping_type: clocking['timekeeping_type'] ? clocking['timekeeping_type'].toString() : this.timekeepingTypes[0].value,
        is_take_leave: clocking['is_take_leave'] != null ? clocking['is_take_leave'] : 1,
        over_time_after_shift_work: clocking['over_time_after_shift_work'],
        over_time_before_shift_work: clocking['over_time_before_shift_work'],
        time_is_late: clocking['time_is_late'],
        time_is_leave_work_early: clocking['time_is_leave_work_early'],
        note: clocking['note'],
      });
      this.listStartDate.push(moment(clocking['start_time']).format('YYYY-MM-DD'));
      this.listStartDate.push(moment(clocking['start_time']).subtract(1, 'days').format('YYYY-MM-DD'));

      this.listEndDate.push(moment(clocking['start_time']).format('YYYY-MM-DD'));
      this.listEndDate.push(moment(clocking['start_time']).add(1, 'days').format('YYYY-MM-DD'));

      if (clocking['check_in_time']) {
        this.isDisabledCheckIn = false;
      }
      if (clocking['check_out_time']) {
        this.isDisabledCheckOut = false;
      }

      this.clocking = clocking;
      this.employee = clocking.timesheet.employee;
      this.timesheet = clocking.timesheet;
      this.clockingDate = moment(clocking.start_time).format('YYYY-MM-DD');
      this.shiftsList.push(this.timesheet.shifts);
    });
  }

  submit() {
    if (this.form.valid) {
      const data = this.form.getRawValue();
      if (data['timekeeping_type'] == 2) { // xin nghỉ
        data['check_in_time'] = null;
        data['check_out_time'] = null;
        data['over_time_after_shift_work'] = 0;
        data['over_time_before_shift_work'] = 0;
        data['time_is_late'] = 0;
        data['time_is_leave_work_early'] = 0;
      } else {
        data['is_take_leave'] = null;
        if (data['check_in_time'] != null && data['is_check_in']) {
          data['check_in_time'] = moment(data['check_in_date'] + ' ' + data['check_in_time']).format('YYYY-MM-DD HH:mm');
        } else {
          data['over_time_before_shift_work'] = 0;
          data['time_is_late'] = 0;
        }

        if (data['check_out_time'] != null && data['is_check_out']) {
          data['check_out_time'] = moment(data['check_out_date']  + ' ' +  data['check_out_time']).format('YYYY-MM-DD HH:mm');
        } else {
          data['over_time_after_shift_work'] = 0;
          data['time_is_leave_work_early'] = 0;
        }

        if (this.hoursCheckIn > 0 || this.minuteCheckIn > 0) {
          if (this.totalTimeCheckIn <  0) { // đi trễ
            data['time_is_late'] = -this.totalTimeCheckIn;
          } else {
            data['over_time_before_shift_work'] = this.totalTimeCheckIn;
          }
        }

        if (this.hoursCheckIn > 0 || this.minuteCheckIn > 0) {
          if (this.totalTimeCheckIn <  0) { // đi trễ
            data['time_is_late'] = -this.totalTimeCheckIn;
          } else {
            data['over_time_before_shift_work'] = this.totalTimeCheckIn;
          }
        }

        if (this.hoursCheckOut > 0 || this.minuteCheckOut > 0) {
          if (this.totalTimeCheckIn <  0) { // về sớm
            data['time_is_leave_work_early'] = -this.totalTimeCheckOut;
          } else {
            data['over_time_after_shift_work'] = this.totalTimeCheckOut;
          }
        }
      }
      delete data['is_check_out'];
      delete data['check_in_date'];

      delete data['is_check_in'];
      delete data['check_out_date'];

      if (this.clocking_id !== null && this.clocking_id !== undefined) {
        this.clockingService.update(this.clocking_id, data).subscribe(res => {
          this.notifySer.notify('success', 'Cập nhật chi tiết ca làm việc thành công!');
          this.dialogRef.close(res);
        }, (error) => {
          if (error.status === 422) {
            this.ajaxValidate(error);
          }
        });
      }
    }
  }

  delete() {
    this.clockingService.delete(this.clocking_id).subscribe(user => {
      this.notifySer.notify('success', 'Hủy chấm công thành công!');
      this.dialogRef.close(true);
    });
  }

  public ajaxValidate(error) {
    if (error.error) {
      if (this.form instanceof FormGroup) {
        const _fields = this.form.controls;
        Object.keys(_fields).forEach(key => {
          const errorField = error.error.find(x => x.field === key);
          if (errorField) {
            this.form.controls[key].setErrors({
              ajaxValidator: {
                value: errorField.message,
              }
            });
          }
        });
      }
    }
  }

  changeCheckIn() {
    if (this.form.getRawValue()['is_check_in']) {
      this.isDisabledCheckIn = false;
      this.form.controls['check_in_time'].setValue(
        this.formatDateToTime(this.clocking['check_in_time'] ? this.clocking['check_in_time'] : this.clocking['start_time']), true);
    } else {
      this.isDisabledCheckIn = true;
      this.form.controls['check_in_time'].setValue(null);
    }
    console.log(this.form.getRawValue());
  }

  changeCheckOut() {
    if (this.form.getRawValue()['is_check_out']) {
      this.isDisabledCheckOut = false;
      this.form.controls['check_out_time'].setValue(
      this.formatDateToTime(this.clocking['check_out_time'] ? this.clocking['check_out_time'] : this.clocking['end_time']), true);
    } else {
      this.isDisabledCheckOut = true;
      this.form.controls['check_out_time'].setValue(null);
    }
    console.log(this.form.getRawValue());
  }

  formatDateToTime(date, isDate = false) {
    if (isDate) {
      return moment(date).format('YYYY-MM-DD');
    } else {
      return moment(date).format('HH:mm');
    }
  }

  showDateTime(isStart = false) {
    if (isStart) {
      this.showStartDate = !this.showStartDate;
    } else {
      this.showEndDate = !this.showEndDate;
    }
  }

  updateChangeDateTime(date = null, isCheckOut = false) {
    if (isCheckOut) {
      const formData = this.form.getRawValue();
      let dateCheckOut;
      if (date) {
        dateCheckOut = date;
      } else {
        dateCheckOut = formData['check_out_date'];
      }
      const timeCheckOut = formData['check_out_time'];

      const dateTimeDefault = moment(this.clocking['end_time']);
      const dateTimeCheckOut = moment(dateCheckOut + ' ' + timeCheckOut);
      this.totalTimeCheckOut = moment.duration(dateTimeCheckOut.diff(dateTimeDefault)).asMinutes();
      if (this.totalTimeCheckOut < 0) {
        this.totalTimeCheckOut =  this.totalTimeCheckOut + this.earlyCheckOutTime;
        if (this.totalTimeCheckOut >= 0) {
          this.totalTimeCheckOut = 0;
        }
      } else {
        this.totalTimeCheckOut =  this.totalTimeCheckOut - this.lateCheckOutTimeOT;
        if (this.totalTimeCheckOut <= 0) {
          this.totalTimeCheckOut = 0;
        }
      }

      this.hoursCheckOut = this.totalTimeCheckOut / 60;
      if (this.hoursCheckOut < 0) {
        this.hoursCheckOut = -this.hoursCheckOut;
      }
      this.minuteCheckOut =  this.minuteCheckOut % 60;
      if (this.minuteCheckOut < 0) {
        this.minuteCheckOut = -this.minuteCheckOut;
      }
    } else {
      const formData = this.form.getRawValue();
      let dateCheckIn;
      if (date) {
        dateCheckIn = date;
      } else {
        dateCheckIn = formData['check_in_date'];
      }
      const timeCheckIn = formData['check_in_time'];

      const dateTimeDefault = moment(this.clocking['start_time']);
      const dateTimeCheckIn = moment(dateCheckIn + ' ' + timeCheckIn);
      this.totalTimeCheckIn = moment.duration(dateTimeDefault.diff(dateTimeCheckIn)).asMinutes();

      if (this.totalTimeCheckIn < 0) {
        this.totalTimeCheckIn =  this.totalTimeCheckIn + this.lateCheckInTime;
        if (this.totalTimeCheckIn >= 0) {
          this.totalTimeCheckIn = 0;
        }
      } else {
        this.totalTimeCheckIn =  this.totalTimeCheckIn - this.earlyCheckInTimeOT;
        if (this.totalTimeCheckIn <= 0) {
          this.totalTimeCheckIn = 0;
        }
      }
      this.hoursCheckIn = this.totalTimeCheckIn / 60;
      if (this.hoursCheckIn < 0) {
        this.hoursCheckIn = -this.hoursCheckIn;
      }
      this.minuteCheckIn =  this.totalTimeCheckIn % 60;
      if (this.minuteCheckIn < 0) {
        this.minuteCheckIn = -this.minuteCheckIn;
      }
    }
  }

  updateTotalTime(event,  isCheckOut = false) {
    if (event.checked) {
      if (isCheckOut) {
        this.updateChangeDateTime(null, true);
      } else {
        this.updateChangeDateTime();
      }
    } else {
      if (isCheckOut) {
        this.hoursCheckOut = 0;
        this.minuteCheckOut = 0;
        this.disableTotalTimeCheckOut = true;
      } else {
        this.hoursCheckIn = 0;
        this.minuteCheckIn = 0;
        this.disableTotalTimeCheckIn = true;
      }
    }
  }

}
