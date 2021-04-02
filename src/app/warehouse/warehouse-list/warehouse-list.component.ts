import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTable } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { ListComponentBase } from '../../shared/base';
import { ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { NotifierService } from 'angular-notifier';
import { WarehouseService } from '../warehouse.service';
import { Warehouse, WarehouseFilter } from '../warehouse.model';
import { ProductUploadDialogComponent } from '../../product/product-upload-dialog/product-upload-dialog.component';
import { WarehouseUploadDialogComponent } from '../warehouse-upload-dialog/warehouse-upload-dialog.component';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { catchError, debounceTime, map, startWith, switchMap } from 'rxjs/operators';
import { InvoiceService } from '../../invoice/invoice.service';
import { DatetimeDefaultFilterDialogComponent } from '../../invoice/datetime-default-filter-dialog/datetime-default-filter-dialog.component';
import { DatetimeChooseFilterDialogComponent } from '../../invoice/datetime-choose-filter-dialog/datetime-choose-filter-dialog.component';
import { DateFilter } from '../../invoice/invoice.model';
import { Observable } from 'rxjs';
import { Supplier } from '../../supplier/supplier.model';
import { of } from 'rxjs/internal/observable/of';
import { SupplierService } from '../../supplier/supplier.service';

@Component({
  templateUrl: './warehouse-list.component.html',
  styleUrls: ['./warehouse-list.component.css'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({height: '0px', minHeight: '0'})),
      state('expanded', style({height: '*'})),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ]
})
export class WarehouseListComponent extends ListComponentBase implements OnInit {

  constructor(
    private mainService: WarehouseService,
    private dialog: MatDialog,
    private route: ActivatedRoute,
    private notifyService: NotifierService,
    private service: InvoiceService,
    private fb: FormBuilder,
    private supplierSer: SupplierService,
  ) {
    super();
  }

  @ViewChild(MatTable, {static: true}) table: MatTable<any>;

  apiFilter: WarehouseFilter;

  searchProductForm = new FormControl();
  orderStatusFilter: FormGroup;

  timeFilter: FormGroup;

  titleTimeDefault = 'Tháng này';
  titleTimeChoose = 'Lựa chọn khác';

  currentDateFilter: DateFilter;

  columnsHeader = {
    '#': '#',
    'national_pharmacy_no': 'Mã DQG',
    'date': 'Ngày nhập',
    'supplier_id': 'Nhà cung cấp',
    'total_amount': 'Tổng tiền',
    'discount_amount': 'Giảm giá',
    'paid_amount': 'Đã trả',
    'remain_amount': 'Còn lại',
    'status': 'Trạng thái',
  };

  displayedColumns: string[] = [
    '#',
    'date',
    'supplier_id',
    'total_amount',
    // 'discount_amount',
    'paid_amount',
    // 'remain_amount',
    'status',
    'national_pharmacy_no',
  ];
  columnsToDisplay: string[] = [
    '#',
    'date',
    'supplier_id',
    'total_amount',
    'discount_amount',
    'paid_amount',
    'remain_amount',
    'status',
    'national_pharmacy_no',
  ];

  statusFilterList = [
    {
      'value': '10',
      'name': 'Hoàn thành',
    },
    {
      'value': '9',
      'name': 'Lưu tạm',
    },
  ];

  dataSource = [];
  expandedElement: Warehouse | null;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  isLoadingResults = true;
  isRateLimitReached = false;
  codeSearch = null;

  filteredSuppliers: Observable<Supplier[]>;

  displaySupplier(supplier?: Supplier): string | undefined {
    return (supplier === undefined || supplier === null) ? undefined : supplier.name;
  }

  buildFilterFromParams(): WarehouseFilter {
    function write<K extends keyof WarehouseFilter>(arg: WarehouseFilter, key: K, value: WarehouseFilter[K]): void {
      arg[key] = value;
    }

    const filter = new WarehouseFilter();
    const objectKeys = Object.keys(filter) as Array<keyof WarehouseFilter>;
    const objDateFilter = this.service.getDateFilter();

    for (const attr of objectKeys) {
      write(filter, attr, this.route.snapshot.queryParams['WarehouseSearch[' + attr + ']']);
    }
    filter.page = this.route.snapshot.queryParams['page'];
    filter.pageSize = this.route.snapshot.queryParams['pageSize'];
    filter.sort = this.route.snapshot.queryParams['sort'];
    filter.expand = 'supplier,created_user,product_count,total_quantity,warehouseExpensess';
    filter.type = 'import';
    filter.date_from = objDateFilter.date_from;
    filter.date_to = objDateFilter.date_to;
    filter.status = this.orderStatusFilter.controls['status'].value;

    const data = this.orderStatusFilter.controls['supplier']?.value;
    filter.supplier_id = data?.id;
    return filter;
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

  loadData(): void {
    const code = this.route.snapshot.paramMap.get('code');
    if (code !== null && code !== undefined) {
      if (this.codeSearch == null) {
        this.apiFilter.no = code;
        this.codeSearch = code;
      } else {
        this.apiFilter.no = '';
      }
    }
    this.isLoadingResults = true;
    this.mainService.getList(this.apiFilter).subscribe(res => {
      this.dataSource = res.body;
      this.reloadFilter(res);
      this.isLoadingResults = false;
    });
  }

  ngOnInit() {

    this.initDateFilter();

    this.orderStatusFilter = this.fb.group({
      status: [
        ['10', '9']
      ],
      supplier: [null],
    });

    this.timeFilter = this.fb.group({
      typeTime: [
        'default'
      ],
    });

    this.apiFilter = this.buildFilterFromParams();
    this.loadData();

    this.service.subscribeDateFilter.subscribe(obj => {
      if (JSON.stringify(this.currentDateFilter) !== JSON.stringify(obj)) {
        this.currentDateFilter = obj;
        this.apiFilter = this.buildFilterFromParams();
        this.loadData();
      }
    });

    this.searchProductForm.valueChanges.pipe(debounceTime(800)).subscribe(res => {
      if (res !== '') {
        this.apiFilter = this.buildFilterFromParams();
        this.apiFilter.keyword = res;
        this.loadData();
        // this.service.setLoadProduct(false);
      } else {
        this.apiFilter = this.buildFilterFromParams();
        this.loadData();
        // this.service.setLoadProduct(false);
      }
    });

    this.filteredSuppliers = this.orderStatusFilter.controls['supplier'].valueChanges.pipe(
      startWith(''),
      // delay emits
      debounceTime(300),
      // use switch map so as to cancel previous subscribed events, before creating new once
      switchMap(value => {
        if (value !== '') {
          // lookup from github
          return this.lookup(value);
        } else {
          // if no value is present, return null
          return of(null);
        }
      })
    );
  }

  lookup(value: string): Observable<Supplier[]> {
    return this.supplierSer.autocomplete(value).pipe(
      // map the item property of the github results as our return object
      map(results => results),
      // catch errors
      catchError(_ => {
        return of(null);
      })
    );
  }

  openUploadDialog() {
    const dialogRef = this.dialog.open(WarehouseUploadDialogComponent, {
      width: '40%',
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadData();
      }
    });
  }

  orderStatusFilterChange() {
    this.apiFilter = this.buildFilterFromParams();
    this.loadData();
  }

  convertDate(date: Date) {
    const month = date.getMonth() + 1;
    return date.getDate() + '/' + month + '/' + date.getFullYear();
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
}
