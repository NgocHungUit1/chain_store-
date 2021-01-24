import {Component, Inject, OnInit, Optional} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material/dialog';
import {NotifierService} from 'angular-notifier';
import {PaySheetService} from '../pay-sheet.service';
import {PaySlipService} from '../../pay-slip/pay-slip.service';
import {TimesheetService} from '../../timesheet/timesheet.service';

@Component({
  selector: 'app-pay-slip-form-main-salary',
  templateUrl: './pay-slip-form-main-salary.component.html',
  styleUrls: ['./pay-slip-form-main-salary.component.css']
})
export class PaySlipFormMainSalaryComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<PaySlipFormMainSalaryComponent>,
    public notifySer: NotifierService,
    private paySheetService: PaySheetService,
    private paySlipService: PaySlipService,
    private timesheetService: TimesheetService,
    private dialog: MatDialog,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: Object
  ) {
    this.local_data = {...data};
    this.working_day_number = this.local_data.working_day_number;
    this.paySlip = this.local_data.paySlip;
    if (this.paySlip.salary_type === 1 || this.paySlip.salary_type === 3) {
      this.dataSource = JSON.parse(this.local_data.paySlip.salary_detail).mainSalary;
    }
  }
  paySlip: any;

  working_day_number;
  shiftsList: any = [];
  loading = false;
  local_data: any;
  isLoadingResults = false;
  isRateLimitReached = false;
  dataSource = [];
  columnsHeaderShifts = {
    'shifts': 'Ca làm việc',
    'salary': 'Lương/Ca',
    'total': 'Số ca làm việc',
    'total_apply': 'Số ca áp dụng',
    'total_need_pay_salary': 'Cần trả'
  };

  columnsHeaderDay = {
    'shifts': '#',
    'salary': 'Lương/Tháng',
    'total': 'Số ngày làm việc',
    'total_apply': 'Số ngày áp dụng',
    'total_need_pay_salary': 'Cần trả'
  };

  displayedColumns: string[] = [
    'shifts',
    'salary',
    'total',
    'total_apply',
    'total_need_pay_salary',
  ];

  ngOnInit(): void {
    this.getShiftsList();
    if (this.paySlip.salary_type === 3) {
      if (this.dataSource[0]['total'] > this.working_day_number) {
        this.dataSource[0]['total'] =  this.working_day_number;
        if (this.dataSource[0]['total_apply'] >  this.dataSource[0]['total']) {
          this.dataSource[0]['total_apply'] = this.dataSource[0]['total'];
        }
      }
    }
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  submit() {
    if (this.dataSource.length === 0) {
      return;
    }
    const data = {
      'total_net_salary': this.paySlip.salary_type === 1 ?  this.getTotal('total_need_pay_salary') : this.getTotalDay(),
      'salary_detail': JSON.stringify({'mainSalary': this.dataSource})
    };

    this.paySlipService.update(this.paySlip.id, data).subscribe(res => {
      this.notifySer.notify('success', 'Cập nhật thanh toán lương thành công!');
      this.dialogRef.close(res);
    }, (error) => {
      this.notifySer.notify('error', 'Lỗi bất thường xảy ra.');
    });
  }

  getTotal(name) {
    if (name === 'total_need_pay_salary') {
      return this.dataSource.map(a => a['total_apply'] * a['salary']).reduce(function(a, b) {
        return a + b;
      });
    }
    return this.dataSource.map(a => a[name]).reduce(function(a, b) {
      return a + b;
    });
  }

  getTotalDay() {
    return this.dataSource.map(a => a['total_apply'] / a['total'] * a ['salary']).reduce(function(a, b) {
      return a + b;
    });
  }

  getShiftsList() {
    this.timesheetService.getShiftsList().subscribe(res => {
      this.shiftsList = res.body;
    });
  }

  getNameShifts(id) {
    if (!id) {
      return 'Mặc định';
    }
    const shifts = this.shiftsList.find(item => item.id === id);
    if (shifts) {
      return shifts.name;
    }
    return '';
  }

}
