import { Component, OnInit, ViewChild } from '@angular/core';
import { ListComponentBase } from '../../shared/base';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { NotifierService } from 'angular-notifier';
import { BankAccountService } from '../bank-account.service';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { BankAccount, BankAccountFilter } from '../bank-account.model';
import { BankAccountFormDialogComponent } from '../bank-account-form-dialog/bank-account-form-dialog.component';
import {debounceTime} from 'rxjs/operators';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { DateFilter } from '../../invoice/invoice.model';

@Component({
  selector: 'app-bank-account-list',
  templateUrl: './bank-account-list.component.html',
  styleUrls: ['./bank-account-list.component.css'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({height: '0px', minHeight: '0'})),
      state('expanded', style({height: '*'})),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ]
})
export class BankAccountListComponent extends ListComponentBase implements OnInit {

  constructor(
    private service: BankAccountService,
    private dialog: MatDialog,
    private route: ActivatedRoute,
    private notifyService: NotifierService,
    private fb: FormBuilder
  ) {
    super();
  }

  @ViewChild(MatTable, {static: true}) table: MatTable<any>;

  apiFilter: BankAccountFilter;

  bankCodesObj = {
  };

  columnsHeader = {
    '#': '#',
    'bank_code': 'Ngân hàng',
    'account_number': 'Số tài khoản',
    'account_name': 'Tên tài khoản',
    'status': 'Trạng thái',
  };

  displayedColumns: string[] = [
    '#',
    'bank_code',
    'account_number',
    'account_name',
    'status'
  ];
  columnsToDisplay: string[] = [
    '#',
    'bank_code',
    'account_number',
    'account_name',
    'status'
  ];

  data: BankAccount[] = [];
  itemDataSource = new MatTableDataSource<BankAccount>([]);
  expandedElement: BankAccount | null;


  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  isLoadingResults = true;
  isRateLimitReached = false;


  searchForm = new FormControl();
  timeFilter: FormGroup;
  titleTimeDefault = 'Tháng này';
  titleTimeChoose = 'Lựa chọn khác';
  currentDateFilter: DateFilter;

  statusFilter: FormGroup;
  statusFilterList = [
    {
      'value': '10',
      'name': 'Hoạt động',
    },
    {
      'value': '9',
      'name': 'Ngưng hoạt động',
    },
  ];


  buildFilterFromParams(): BankAccountFilter {
    function write<K extends keyof BankAccountFilter>(arg: BankAccountFilter, key: K, value: BankAccountFilter[K]): void {
      arg[key] = value;
    }

    const filter = new BankAccountFilter();
    const objectKeys = Object.keys(filter) as Array<keyof BankAccountFilter>;

    for (const attr of objectKeys) {
      write(filter, attr, this.route.snapshot.queryParams['BankAccountSearch[' + attr + ']']);
    }
    filter.page = this.route.snapshot.queryParams['page'];
    filter.pageSize = this.route.snapshot.queryParams['pageSize'];
    filter.sort = this.route.snapshot.queryParams['sort'];
    filter.expand = 'province,district,ward';
    filter.status = this.statusFilter.controls['status'].value;
    return filter;
  }

  loadData(): void {
    this.isLoadingResults = true;
    this.service.getList(this.apiFilter).subscribe(res => {
      this.data = res.body;
      this.itemDataSource = new MatTableDataSource<BankAccount>(this.data);
      this.reloadFilter(res);
      this.isLoadingResults = false;
    });
  }

  ngOnInit(): void {
    this.bankCodesObj = BankAccount.getBankCodes();
    this.buildFrom();
    this.apiFilter = this.buildFilterFromParams();
    this.loadData();

    this.searchForm.valueChanges.pipe(debounceTime(800)).subscribe(res => {
      if (res !== '') {
        this.apiFilter = this.buildFilterFromParams();
        this.apiFilter.keyword = res;
        this.loadData();
      } else {
        this.apiFilter = this.buildFilterFromParams();
        this.loadData();
      }
    });
  }

  buildFrom() {
    this.timeFilter = this.fb.group({
      typeTime: [
        'default'
      ],
    });

    this.statusFilter = this.fb.group({
      status: [
        ['10', '9']
      ],
    });
  }

  openBankAccountFormDialog() {
    const dialogRef = this.dialog.open(BankAccountFormDialogComponent, {
      width: '70%',
      minWidth: '600px',
      minHeight: '80%',
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadData();
      }
    });
  }

  checkBoxFilterChange($event: any, value: any, field: string) {
    this.handleFilterCheckbox(this.statusFilter, field, value);
    this.apiFilter = this.buildFilterFromParams();
    this.loadData();
  }
}
