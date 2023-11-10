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
    private authSer: AuthService
  ) {
    super();
  }

  @ViewChild(MatTable, { static: true }) table: MatTable<any>;

  apiFilter: CustomerFilter;

  columnsHeader = {
    '#': '#',
    'name': 'Khách hàng',
    'phone': 'Số điện thoại',
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
    'email',
    'tax_code',
    'status'
  ];

  dataSource = [];
  expandedElement: Customer | null;
  public downloadLink = '';

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  isLoadingResults = true;
  isRateLimitReached = false;

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
    filter.expand = 'province,district,ward,total_amount,paid_amount,remain_amount';
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

    this.service.subscribeLoadCustomer.subscribe(action => {
      if (action === true) {
        this.apiFilter = this.buildFilterFromParams();
        this.loadData();
        this.service.setLoadCustmer(false);
      }
    });
  }

  openCustomerFormDialog() {
    const dialogRef = this.dialog.open(CustomerFormDialogComponent, {
      width: '50%',
      minHeight: '80%',
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

}
