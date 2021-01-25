import {Component, Input, OnInit, ViewChild} from '@angular/core';
import {PaySheet} from '../pay-sheet.model';
import {MatTable} from '@angular/material/table';
import {MatPaginator} from '@angular/material/paginator';
import {MatSort} from '@angular/material/sort';
import {PaySheetService} from '../pay-sheet.service';
import {MatDialog} from '@angular/material/dialog';
import {NotifierService} from 'angular-notifier';
import {PaySlipSalaryComponent} from '../pay-slip-salary/pay-slip-salary.component';

@Component({
  selector: 'app-pay-sheet-tab-pay-slip',
  templateUrl: './pay-sheet-tab-pay-slip.component.html',
  styleUrls: ['./pay-sheet-tab-pay-slip.component.css']
})
export class PaySheetTabPaySlipComponent implements OnInit {

  @Input() paySheet: PaySheet;
  @ViewChild(MatTable, { static: true }) table: MatTable<any>;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  isLoadingResults = false;
  isRateLimitReached = false;

  dataSource = [];
  columnsHeader = {
    'employee': 'Tên nhân viên',
    'total_salary': 'Tổng lương',
    'total_payment_salary': 'Đã trả',
    'total_need_pay_salary': 'Cần trả',
    'actions': 'Hành động',
  };

  displayedColumns: string[] = [
    'employee',
    'total_salary',
    'total_payment_salary',
    'total_need_pay_salary',
    'actions',
  ];

  constructor(
      private paySheetService: PaySheetService,
      private dialog: MatDialog,
      private notifyService: NotifierService,
  ) {
  }

  ngOnInit(): void {
    this.dataSource = this.paySheet.listPaySlip.filter(item => item['status'] !== 0);
  }


  loadPaySheet() {
    this.paySheetService.getDetail(this.paySheet.id.toString()).subscribe(res => {
      this.dataSource = res.listPaySlip.filter(item => item['status'] !== 0);
    });
  }

  paySheetSalary(paySheet = null) {
    let obj;
    if (paySheet) {
      obj = {
        'paySlipList': [paySheet]
      };
    } else {
      obj = {
        'paySlipList': this.dataSource.filter(item => item['status'] === 9),
      };
    }
    const dialogRef = this.dialog.open(PaySlipSalaryComponent, {
      data: obj,
      width: '60%',
      minHeight: '80%',
    });

    dialogRef.afterClosed().subscribe(result => {
      this.loadPaySheet();
    });
  }

}
