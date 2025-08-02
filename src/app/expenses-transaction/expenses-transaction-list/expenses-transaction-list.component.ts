import { Component, OnInit, ViewChild } from '@angular/core';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { ListComponentBase } from '../../shared/base';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { NotifierService } from 'angular-notifier';
import { MatTable } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { ExpensesTransactionFormDialogComponent } from '../expenses-transaction-form-dialog/expenses-transaction-form-dialog.component';
import { ExpensesTransaction, ExpensesTransactionFilter } from '../expenses-transaction.model';
import { ExpensesTransactionService } from '../expenses-transaction.service';

@Component({
  selector: 'app-expenses-transaction-list',
  templateUrl: './expenses-transaction-list.component.html',
  styleUrls: ['./expenses-transaction-list.component.css'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({height: '0px', minHeight: '0'})),
      state('expanded', style({height: '*'})),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ]
})
export class ExpensesTransactionListComponent extends ListComponentBase implements OnInit {

  methodText = {
    import: 'Chi phí nhập trả nhà cung cấp',
    other: 'Chi phí khác'
  };

  constructor(
    private service: ExpensesTransactionService,
    private dialog: MatDialog,
    private route: ActivatedRoute,
    private notifyService: NotifierService
  ) {
    super();
  }

  @ViewChild(MatTable, {static: true}) table: MatTable<any>;

  apiFilter: ExpensesTransactionFilter;

  columnsHeader = {
    '#': '#',
    'no': 'Mã chi phí',
    'name': 'Loại chi phí',
    'price': 'Giá trị ',
    'method': 'Hình thức ',
    'status': 'Trạng thái',
  };

  displayedColumns: string[] = [
    '#',
    'no',
    'name',
    'price',
    'method',
    'status',
  ];
  columnsToDisplay: string[] = [
    '#',
    'no',
    'name',
    'price',
    'method',
    'status',
  ];

  dataSource = [];
  expandedElement: ExpensesTransaction | null;

  statusText = {
    10: 'Đang thu',
    9: 'Ngừng thu'
  };


  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  isLoadingResults = true;
  isRateLimitReached = false;

  buildFilterFromParams(): ExpensesTransactionFilter {
    function write<K extends keyof ExpensesTransactionFilter>(arg: ExpensesTransactionFilter, key: K, value: ExpensesTransactionFilter[K]): void {
      arg[key] = value;
    }

    const filter = new ExpensesTransactionFilter();
    const objectKeys = Object.keys(filter) as Array<keyof ExpensesTransactionFilter>;

    for (const attr of objectKeys) {
      write(filter, attr, this.route.snapshot.queryParams['ExpensesTransactionSearch[' + attr + ']']);
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
        elementData.stt = stt;
      });
      this.reloadFilter(res);
      this.isLoadingResults = false;
    });
  }

  ngOnInit(): void {
    this.apiFilter = this.buildFilterFromParams();
    this.loadData();

  }

  openExpensesTransactionFormDialog() {
    const dialogRef = this.dialog.open(ExpensesTransactionFormDialogComponent, {
      width: '600px',
      minHeight: '80%',
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadData();
      }
    });
  }

}
