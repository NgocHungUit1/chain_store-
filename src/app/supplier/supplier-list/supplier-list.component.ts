import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTable } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { ListComponentBase } from '../../shared/base';
import { SupplierService } from '../supplier.service';
import { ActivatedRoute } from '@angular/router';
import { Supplier, SupplierFilter } from '../supplier.model';
import { MatDialog } from '@angular/material/dialog';
import { SupplierFormDialogComponent } from '../supplier-form-dialog/supplier-form-dialog.component';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import {debounceTime} from 'rxjs/operators';
import {SupplierUploadDialogComponent} from '../supplier-upload-dialog/supplier-upload-dialog.component';
import {AuthService} from '../../authentication/auth.service';
import { DateFilter } from '../../invoice/invoice.model';
import {
  DatetimeDefaultFilterDialogComponent
} from '../datetime-default-filter-dialog/datetime-default-filter-dialog.component';
import { DatetimeChooseFilterDialogComponent } from '../datetime-choose-filter-dialog/datetime-choose-filter-dialog.component';

@Component({
  templateUrl: './supplier-list.component.html',
  styleUrls: ['./supplier-list.component.css'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ]
})
export class SupplierListComponent extends ListComponentBase implements OnInit {

  constructor(
    private service: SupplierService,
    private dialog: MatDialog,
    private route: ActivatedRoute,
    private authSer: AuthService,
    private fb: FormBuilder
  ) {
    super();
  }

  @ViewChild(MatTable, { static: true }) table: MatTable<any>;

  apiFilter: SupplierFilter;
  searchForm = new FormControl();

  columnsHeader = {
    '#': '#',
    'name': 'Tên đối tác',
    'phone_number': 'Số điện thoại',
    'email': 'Email',
    'company_name': 'Tên công ty',
    'tax_code': 'Mã số thuế',
    'status': 'Trạng thái',
    'total_amount': 'Tổng mua',
    'paid_amount': 'Đã trả',
    'remain_amount': 'Còn nợ',
  };

  displayedColumns: string[] = [
    '#',
    'name',
    'phone_number',
    'email',
    'tax_code',
    'company_name',
    'status',
    'total_amount',
    'paid_amount',
    'remain_amount',
  ];
  columnsToDisplay: string[] = [
    '#',
    'name',
    'company_name',
    'phone_number',
    'email',
    'tax_code',
    'status'
  ];
  dataSource = [];
  expandedElement: Supplier | null;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  public downloadLink = '';

  isLoadingResults = true;
  isRateLimitReached = false;

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

  buildFilterFromParams(): SupplierFilter {
    function write<K extends keyof SupplierFilter>(arg: SupplierFilter, key: K, value: SupplierFilter[K]): void {
      arg[key] = value;
    }

    const objDateFilter = this.service.getDateFilter();

    const filter = new SupplierFilter();
    const objectKeys = Object.keys(filter) as Array<keyof SupplierFilter>;

    for (const attr of objectKeys) {
      write(filter, attr, this.route.snapshot.queryParams['SupplierSearch[' + attr + ']']);
    }
    filter.page = this.route.snapshot.queryParams['page'];
    filter.pageSize = this.route.snapshot.queryParams['pageSize'];
    filter.sort = this.route.snapshot.queryParams['sort'];
    filter.expand = 'province,district,ward,total_amount,paid_amount,remain_amount';
    filter.status = this.statusFilter.controls['status'].value;
    filter.date_from = objDateFilter.date_from;
    filter.date_to = objDateFilter.date_to;
    return filter;
  }

  loadData(): void {
    this.isLoadingResults = true;
    this.downloadLink = this.service.getDownloadLink(this.apiFilter);
    this.service.getList(this.apiFilter).subscribe(res => {
      this.dataSource = res.body;
      let stt = 0;
      this.dataSource.forEach(elementData => {
        stt++;
        elementData.stt = stt;
      });
      this.reloadFilter(res);
      this.isLoadingResults = false;
    });
  }

  ngOnInit() {
    this.initDateFilter();
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

    this.service.subscribeDateFilter.subscribe(obj => {
      if (JSON.stringify(this.currentDateFilter) !== JSON.stringify(obj)) {
        this.currentDateFilter = obj;
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

  openSupplierFormDialog() {
    const dialogRef = this.dialog.open(SupplierFormDialogComponent, {
      width: '50%',
      minHeight: '80%',
    });

    dialogRef.afterClosed().subscribe(result => {
      this.loadData();
    });
  }

  openUploadDialog() {
    const dialogRef = this.dialog.open(SupplierUploadDialogComponent, {
      width: '45%',
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result['success']) {
        this.loadData();
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

  checkBoxFilterChange($event: any, value: any, field: string) {
    this.handleFilterCheckbox(this.statusFilter, field, value);
    this.apiFilter = this.buildFilterFromParams();
    this.loadData();
  }

}
