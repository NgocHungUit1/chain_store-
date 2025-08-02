import { Component, OnInit, ViewChild } from '@angular/core';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { ListComponentBase } from '../../shared/base';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { NotifierService } from 'angular-notifier';
import { ExpensesOrderService } from '../expenses-order.service';
import { MatTable } from '@angular/material/table';
import { Employee, EmployeeFilter } from '../../employee/employee.model';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { EmployeeFormDialogComponent } from '../../employee/employee-form-dialog/employee-form-dialog.component';
import { ExpensesOrder, ExpensesOrderFilter } from '../expenses-order.model';
import { ExpensesOrderFormDialogComponent } from '../expenses-order-form-dialog/expenses-order-form-dialog.component';

@Component({
  selector: 'app-expenses-order-list',
  templateUrl: './expenses-order-list.component.html',
  styleUrls: ['./expenses-order-list.component.css'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({height: '0px', minHeight: '0'})),
      state('expanded', style({height: '*'})),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ]
})
export class ExpensesOrderListComponent extends ListComponentBase implements OnInit {

  constructor(
    private service: ExpensesOrderService,
    private dialog: MatDialog,
    private route: ActivatedRoute,
    private notifyService: NotifierService
  ) {
    super();
  }

  @ViewChild(MatTable, {static: true}) table: MatTable<any>;

  apiFilter: ExpensesOrderFilter;

  columnsHeader = {
    '#': '#',
    'no': 'Mã thu',
    'name': 'Loại thu',
    'price': 'Tiền thu',
    'status': 'Trạng thái',
  };

  displayedColumns: string[] = [
    '#',
    'no',
    'name',
    'price',
    'status',
  ];
  columnsToDisplay: string[] = [
    '#',
    'no',
    'name',
    'price',
    'status',
  ];

  dataSource = [];
  expandedElement: ExpensesOrder | null;

  statusText = {
    10: 'Đang thu',
    9: 'Ngừng thu'
  };


  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  isLoadingResults = true;
  isRateLimitReached = false;

  buildFilterFromParams(): ExpensesOrderFilter {
    function write<K extends keyof ExpensesOrderFilter>(arg: ExpensesOrderFilter, key: K, value: ExpensesOrderFilter[K]): void {
      arg[key] = value;
    }

    const filter = new ExpensesOrderFilter();
    const objectKeys = Object.keys(filter) as Array<keyof ExpensesOrderFilter>;

    for (const attr of objectKeys) {
      write(filter, attr, this.route.snapshot.queryParams['ExpensesOrderSearch[' + attr + ']']);
    }
    filter.page = this.route.snapshot.queryParams['page'];
    filter.pageSize = this.route.snapshot.queryParams['pageSize'];
    filter.sort = this.route.snapshot.queryParams['sort'];
    // filter.expand = 'province,ward,user';
    return filter;
  }

  loadData(): void {
    this.isLoadingResults = true;
    this.service.getList(this.apiFilter).subscribe(res => {
      this.dataSource = res.body;
      let stt = 0;
      if (this.dataSource.length === 1) {
        const arr = this.dataSource;
        this.expandedElement = arr[0];
      }
      this.dataSource.forEach(elementData => {
        stt++;
        elementData.stt = this.pageSize * (this.page - 1) + stt;
      });
      this.reloadFilter(res);
      this.isLoadingResults = false;
    });
  }

  ngOnInit(): void {
    this.apiFilter = this.buildFilterFromParams();
    this.loadData();

  }

  openExpensesOrderFormDialog() {
    const dialogRef = this.dialog.open(ExpensesOrderFormDialogComponent, {
      width: '500px',
      minHeight: '80%',
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadData();
      }
    });
  }

}
