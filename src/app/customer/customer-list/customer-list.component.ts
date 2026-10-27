import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTable } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { ListComponentBase } from '../../shared/base';
import { Customer, CustomerFilter } from '../customer.model';
import { MatDialog } from '@angular/material/dialog';
import { CustomerService } from '../customer.service';
import { ActivatedRoute } from '@angular/router';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { NotifierService } from 'angular-notifier';
import { CustomerFormDialogComponent } from '../customer-form-dialog/customer-form-dialog.component';
import {SupplierFormDialogComponent} from '../../supplier/supplier-form-dialog/supplier-form-dialog.component';
import {CustomerUploadDialogComponent} from '../customer-upload-dialog/customer-upload-dialog.component';
import {AuthService} from '../../authentication/auth.service';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { DateFilter } from '../../invoice/invoice.model';
import { debounceTime } from 'rxjs/operators';
import { DatetimeChooseFilterDialogComponent } from '../datetime-choose-filter-dialog/datetime-choose-filter-dialog.component';
import { DatetimeDefaultFilterDialogComponent } from '../datetime-default-filter-dialog/datetime-default-filter-dialog.component';

@Component({
  // selector: 'app-customer-list',
  templateUrl: './customer-list.component.html',
  styleUrls: ['./customer-list.component.css'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ]
})
export class CustomerListComponent extends ListComponentBase implements OnInit {

  constructor(
    private service: CustomerService,
    private dialog: MatDialog,
    private route: ActivatedRoute,
    private authSer: AuthService,
    private fb: FormBuilder
  ) {
    super();
  }

  @ViewChild(MatTable, { static: true }) table: MatTable<any>;

  apiFilter: CustomerFilter;

  columnsHeader = {
    '#': '#',
    'name': 'Khách hàng',
    'phone': 'Số điện thoại',
    'member_tier': 'Hạng',
    'email': 'Email',
    'company_name': 'Tên công ty',
    'tax_code': 'Mã số thuế',
    'status': 'Trạng thái',
    'total_amount': 'Tổng bán',
    'remain_amount': 'Còn nợ',
  };

  displayedColumns: string[] = [
    '#',
    'name',
    'phone',
    'member_tier',
    'email',
    // 'tax_code',
    // 'company_name',
    'status',
    'total_amount',
    'remain_amount',
  ];
  columnsToDisplay: string[] = [
    '#',
    'name',
    'company_name',
    'phone',
    'member_tier',
    'email',
    'tax_code',
    'status'
  ];

  dataSource = [];
  expandedElement: Customer | null;
  public downloadLink = '';

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  isLoadingResults = false;
  isRateLimitReached = false;

  amountData = {};

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

  searchForm = new FormControl();
  timeFilter: FormGroup;
  titleTimeDefault = 'Tháng này';
  titleTimeChoose = 'Lựa chọn khác';
  currentDateFilter: DateFilter;

  buildFilterFromParams(): CustomerFilter {
    function write<K extends keyof CustomerFilter>(arg: CustomerFilter, key: K, value: CustomerFilter[K]): void {
      arg[key] = value;
    }

    const filter = new CustomerFilter();
    const objectKeys = Object.keys(filter) as Array<keyof CustomerFilter>;

    for (const attr of objectKeys) {
      write(filter, attr, this.route.snapshot.queryParams['CustomerSearch[' + attr + ']']);
    }
    filter.page = this.route.snapshot.queryParams['page'];
    filter.pageSize = this.route.snapshot.queryParams['pageSize'];
    filter.sort = this.route.snapshot.queryParams['sort'];
    filter.expand = 'province,ward';
    filter.status = this.statusFilter.controls['status'].value;
    return filter;
  }

  loadData(): void {
    this.isLoadingResults = true;
    this.downloadLink = this.service.getDownloadLink(this.apiFilter);
    this.service.getList(this.apiFilter).subscribe(res => {
      this.dataSource = res.body;
      let stt = 0;
      if (this.dataSource.length === 1) {
        const arr = this.dataSource;
        this.expandedElement = arr[0];
      }
      const ids = [];
      this.dataSource.forEach(elementData => {
        stt++;
        elementData.stt = this.pageSize * (this.page - 1) + stt;
        ids.push(elementData.id);
      });

      const objDateFilter = this.service.getDateFilter();

      const idsStr = ids.join(',');
      const apiFil = new CustomerFilter();
      apiFil.ids = idsStr;
      apiFil.expand = 'total_amount,paid_amount,remain_amount';
      apiFil.pageSize = this.apiFilter.pageSize;
      apiFil.date_from = objDateFilter.date_from;
      apiFil.date_to = objDateFilter.date_to;

      const amountD = {};
      this.service.getListAmount(apiFil).subscribe(amountRes => {
        amountRes.body.forEach(item => {
          amountD[item.id] = item;
        });

        this.amountData = amountD;
        this.isLoadingResults = false;
      });

      this.reloadFilter(res);
    });
  }

  ngOnInit(): void {
    this.initDateFilter();
    this.buildFrom();
    this.apiFilter = this.buildFilterFromParams();
    this.loadData();

    this.service.subscribeLoadCustomer.subscribe(action => {
      if (action === true) {
        this.apiFilter = this.buildFilterFromParams();
        this.loadData();
        this.service.setLoadCustmer(false);
      }
    });

    this.service.subscribeDateFilter.subscribe(obj => {
      if (JSON.stringify(this.currentDateFilter) !== JSON.stringify(obj)) {
        this.currentDateFilter = obj;
        this.apiFilter = this.buildFilterFromParams();
        this.loadData();
      }
    });

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

  openCustomerFormDialog() {
    const dialogRef = this.dialog.open(CustomerFormDialogComponent, {
      width: '760px',
      maxWidth: '95vw',
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadData();
      }
    });
  }

  openUploadDialog() {
    const dialogRef = this.dialog.open(CustomerUploadDialogComponent, {
      width: '45%',
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadData();
      } else {
      }
    });
  }

  canDo(permissionName: string): boolean {
    const allPermissions = this.authSer.getPermissionsFromLocalStorage();

    return allPermissions.indexOf(permissionName) !== -1;
  }


  openTimeDefault() {
    const obj = {};
    const dialogRef = this.dialog.open(DatetimeDefaultFilterDialogComponent, {
      data: obj,
      width: '40%',
      minHeight: '80%',
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result?.title !== undefined) {
        this.titleTimeDefault = result?.title;
      }
      const date = this.service.getDateFilter();
      const date_from = new Date(date.date_from);
      const date_to = new Date(date.date_to);
      this.titleTimeChoose = this.convertDate(date_from) + ' - ' + this.convertDate(date_to);
      this.timeFilter.patchValue({
        typeTime: 'default',
      });
    });
  }

  openTimeChoose() {
    const obj = {};
    const dialogRef = this.dialog.open(DatetimeChooseFilterDialogComponent, {
      data: obj,
      width: '40%',
      minHeight: '80%',
    });

    dialogRef.afterClosed().subscribe(result => {

      this.timeFilter.patchValue({
        typeTime: 'choose',
      });
      const date = this.service.getDateFilter();
      const date_from = new Date(date.date_from);
      const date_to = new Date(date.date_to);
      this.titleTimeChoose = this.convertDate(date_from) + ' - ' + this.convertDate(date_to);
    });
  }

  radioTimeChange(event: Event) {
    if (this.timeFilter.controls['typeTime'].value === 'choose') {
      const date = this.service.getDateFilter();
      const date_from = new Date(date.date_from);
      const date_to = new Date(date.date_to);
      this.titleTimeChoose = this.convertDate(date_from) + ' - ' + this.convertDate(date_to);
    } else {
      this.titleTimeChoose = 'Lựa chọn khác';
    }
  }

  convertDate(date: Date) {
    const month = date.getMonth() + 1;
    return date.getDate() + '/' + month + '/' + date.getFullYear();
  }

  checkBoxFilterChange($event: any, value: any, field: string) {
    this.handleFilterCheckbox(this.statusFilter, field, value);
    this.apiFilter = this.buildFilterFromParams();
    this.loadData();
  }



  initDateFilter() {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    const first = new Date(year, month, 1);
    const obj = new DateFilter();
    // tháng này

    obj.date_from = this.service.convertDateYYYYMMDD(first);
    obj.date_to = this.service.convertDateYYYYMMDD(today);

    const date_from = new Date(obj.date_from);
    const date_to = new Date(obj.date_to);
    this.titleTimeChoose = this.convertDate(date_from) + ' - ' + this.convertDate(date_to);

    this.currentDateFilter = obj;
    this.service.setDateFilter(obj);
  }
}
