import {Component, Inject, Input, OnInit, Optional, ViewChild} from '@angular/core';
import {PaySheet} from '../pay-sheet.model';
import {MatTable} from '@angular/material/table';
import {MatPaginator} from '@angular/material/paginator';
import {MatSort} from '@angular/material/sort';
import {PaySheetService} from '../pay-sheet.service';

@Component({
  selector: 'app-pay-sheet-tab-history-pay-slip-complete',
  templateUrl: './pay-sheet-tab-history-pay-slip-complete.component.html',
  styleUrls: ['./pay-sheet-tab-history-pay-slip-complete.component.css']
})
export class PaySheetTabHistoryPaySlipCompleteComponent implements OnInit {

  @Input() paySheet: PaySheet;
  @ViewChild(MatTable, { static: true }) table: MatTable<any>;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  isLoadingResults = false;
  isRateLimitReached = false;

  dataSource = [];
  columnsHeader = {
    'employee': 'Tên nhân viên',
    'user_create': 'Người tạo',
    'created_at': 'Thời gian',
    'payment_type': 'Phương thức',
    'payment_salary': 'Tiên chi',
  };

  displayedColumns: string[] = [
    'employee',
    'user_create',
    'created_at',
    'payment_type',
    'payment_salary',
  ];

  constructor(
    private paySheetService: PaySheetService,
  ) {}

  ngOnInit(): void {
    this.loadPaySheet();
  }

  loadPaySheet() {
    this.paySheetService.getDetail(this.paySheet.id.toString()).subscribe(res => {
      this.dataSource = res.listPaySlip.filter(item => item['status'] === 10);
    });
  }
}
