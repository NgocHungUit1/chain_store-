import { Component, OnInit, ViewChild } from '@angular/core';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { NotifierService } from 'angular-notifier';
import { CashFlow, CashFlowFilter } from '../cash-flow.model';
import { CashFlowService } from '../cash-flow.service';
import { ListComponentBase } from '../../shared/base';
import { MatTable } from '@angular/material/table';
import { Branch, BranchFilter } from '../../branch/branch.model';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { BranchFormDialogComponent } from '../../branch/branch-form-dialog/branch-form-dialog.component';
import { CashFlowPaymentDialogComponent } from '../cash-flow-payment-dialog/cash-flow-payment-dialog.component';
import { CashFlowReceiptDialogComponent } from '../cash-flow-receipt-dialog/cash-flow-receipt-dialog.component';

@Component({
  selector: 'app-cash-flow-list',
  templateUrl: './cash-flow-list.component.html',
  styleUrls: ['./cash-flow-list.component.css'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({height: '0px', minHeight: '0'})),
      state('expanded', style({height: '*'})),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ]
})
export class CashFlowListComponent extends ListComponentBase implements OnInit {

  constructor(
    private service: CashFlowService,
    private dialog: MatDialog,
    private route: ActivatedRoute,
    private notifyService: NotifierService
  ) {
    super();
  }

  @ViewChild(MatTable, {static: true}) table: MatTable<any>;

  apiFilter: CashFlowFilter;

  columnsHeader = {
    '#': '#',
    'name': 'Tên chi nhánh',
    'address': 'Địa chỉ',
    'phone_number': 'Điện thoại',
    'total_employee': 'Số lượng người dùng',
    'status': 'Trạng thái',
  };

  displayedColumns: string[] = [
    '#',
    'name',
    'address',
    'phone_number',
    'total_employee',
    'status',
  ];
  columnsToDisplay: string[] = [
    '#',
    'name',
    'address',
    'phone_number',
    'total_employee',
    'status',
  ];

  dataSource = [];
  expandedElement: CashFlow | null;


  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  isLoadingResults = true;
  isRateLimitReached = false;

  buildFilterFromParams(): CashFlowFilter {
    function write<K extends keyof CashFlowFilter>(arg: CashFlowFilter, key: K, value: CashFlowFilter[K]): void {
      arg[key] = value;
    }

    const filter = new CashFlowFilter();
    const objectKeys = Object.keys(filter) as Array<keyof CashFlowFilter>;

    for (const attr of objectKeys) {
      write(filter, attr, this.route.snapshot.queryParams['CashFlowFilterSearch[' + attr + ']']);
    }
    filter.page = this.route.snapshot.queryParams['page'];
    filter.pageSize = this.route.snapshot.queryParams['pageSize'];
    filter.sort = this.route.snapshot.queryParams['sort'];
    filter.expand = 'province,district,ward,user';
    return filter;
  }

  loadData(): void {
    this.isLoadingResults = true;
    this.service.getList(this.apiFilter).subscribe(res => {
      this.dataSource = res.body;
      this.reloadFilter(res);
      this.isLoadingResults = false;
    });
  }

  ngOnInit(): void {
    this.apiFilter = this.buildFilterFromParams();
    this.loadData();

    // this.service.subscribeLoadBranch.subscribe(action => {
    //   if (action === true) {
    //     this.apiFilter = this.buildFilterFromParams();
    //     this.loadData();
    //     this.service.setLoadBranch(false);
    //   }
    // });
  }

  openBranchFormDialog() {
    // const dialogRef = this.dialog.open(BranchFormDialogComponent, {
    //   width: '80%',
    //   minHeight: '80%',
    // });
    //
    // dialogRef.afterClosed().subscribe(result => {
    //   if (result) {
    //     this.loadData();
    //   }
    // });
  }

  onCashFlowPaymentDialog() {
    const dialogRef = this.dialog.open(CashFlowPaymentDialogComponent, {
      width: '60%',
      minHeight: '70%',
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadData();
      }
    });
  }

  onCashFlowReceiptDialog() {
    const dialogRef = this.dialog.open(CashFlowReceiptDialogComponent, {
      width: '60%',
      minHeight: '70%',
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadData();
      }
    });
  }

}
