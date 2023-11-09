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
import { NotifierService } from 'angular-notifier';
import {FormControl} from '@angular/forms';
import {debounceTime} from 'rxjs/operators';

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
    private notifyService: NotifierService
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

  buildFilterFromParams(): SupplierFilter {
    function write<K extends keyof SupplierFilter>(arg: SupplierFilter, key: K, value: SupplierFilter[K]): void {
      arg[key] = value;
    }

    const filter = new SupplierFilter();
    const objectKeys = Object.keys(filter) as Array<keyof SupplierFilter>;

    for (const attr of objectKeys) {
      write(filter, attr, this.route.snapshot.queryParams['SupplierSearch[' + attr + ']']);
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
      this.dataSource.forEach(elementData => {
        stt++;
        elementData.stt = stt;
      });
      this.reloadFilter(res);
      this.isLoadingResults = false;
    });
  }

  ngOnInit() {
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

  openSupplierFormDialog() {
    const dialogRef = this.dialog.open(SupplierFormDialogComponent, {
      width: '50%',
      minHeight: '80%',
    });

    dialogRef.afterClosed().subscribe(result => {
      this.loadData();
    });
  }
}
