import {Component, Inject, OnInit, Optional} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material/dialog';
import {NotifierService} from 'angular-notifier';
import {PaySheetService} from '../pay-sheet.service';
import * as moment from 'moment';
import {PaySlipService} from '../../pay-slip/pay-slip.service';

@Component({
  selector: 'app-pay-slip-salary',
  templateUrl: './pay-slip-salary.component.html',
  styleUrls: ['./pay-slip-salary.component.css']
})
export class PaySlipSalaryComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<PaySlipSalaryComponent>,
    public notifySer: NotifierService,
    private paySheetService: PaySheetService,
    private paySlipService: PaySlipService,
    private dialog: MatDialog,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: Object
  ) {
    this.local_data = {...data};
    this.dataSource = this.local_data.paySlipList;
  }
  loading = false;
  local_data: any;
  isLoadingResults = false;
  isRateLimitReached = false;

  dataSource = [];
  columnsHeader = {
    'employee': 'Tên nhân viên',
    'total_salary': 'Tổng lương',
    'total_payment_salary': 'Đã trả',
    'total_need_pay_salary': 'Cần trả',
    'payment': 'Tiền trả NV',
  };

  displayedColumns: string[] = [
    'employee',
    'total_salary',
    'total_payment_salary',
    'total_need_pay_salary',
    'payment',
  ];

  ngOnInit(): void {
    for (let i = 0; i < this.dataSource.length; i++) {
     this.dataSource[i]['payment'] =  this.dataSource[i]['total_net_salary'] - this.dataSource[i]['total_payment'];
    }
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  submit() {
    for (let i = 0; i < this.dataSource.length; i++) {
      this.dataSource[i]['total_payment'] = this.dataSource[i]['payment'] +  this.dataSource[i]['total_payment'];
      if (this.dataSource[i]['total_payment'] > this.dataSource[i]['total_net_salary']) {
        this.dataSource[i]['total_payment'] = this.dataSource[i]['total_net_salary'];
      }
    }

    const data = {
      'list_pay_slip': this.dataSource
    };

    this.paySlipService.updateMultiplePaySlip(data).subscribe(res => {
      this.notifySer.notify('success', 'Cập nhật thanh toán lương thành công!');
      this.dialogRef.close(res);
    }, (error) => {
      this.notifySer.notify('error', 'Lỗi bất thường xảy ra.');
    });
  }

  getTotal(name) {
    return this.dataSource.map(a => a[name]).reduce(function(a, b) {
      return a + b;
    });
  }

}
