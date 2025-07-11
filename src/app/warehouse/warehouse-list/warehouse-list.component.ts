import {Component, HostListener, OnInit, ViewChild} from '@angular/core';
import {MatTable} from '@angular/material/table';
import {MatPaginator} from '@angular/material/paginator';
import {MatSort} from '@angular/material/sort';
import {ListComponentBase} from '../../shared/base';
import {ActivatedRoute} from '@angular/router';
import {MatDialog} from '@angular/material/dialog';
import {animate, state, style, transition, trigger} from '@angular/animations';
import {NotifierService} from 'angular-notifier';
import {WarehouseService} from '../warehouse.service';
import {Warehouse, WarehouseFilter} from '../warehouse.model';
import {Location} from '@angular/common';
import {WarehouseUploadDialogComponent} from '../warehouse-upload-dialog/warehouse-upload-dialog.component';
import {FormBuilder, FormControl, FormGroup} from '@angular/forms';
import {catchError, debounceTime, map, startWith, switchMap} from 'rxjs/operators';
import {InvoiceService} from '../../invoice/invoice.service';
import {DatetimeDefaultFilterDialogComponent} from '../../invoice/datetime-default-filter-dialog/datetime-default-filter-dialog.component';
import {DatetimeChooseFilterDialogComponent} from '../../invoice/datetime-choose-filter-dialog/datetime-choose-filter-dialog.component';
import {DateFilter, Invoice} from '../../invoice/invoice.model';
import {Observable} from 'rxjs';
import {Supplier} from '../../supplier/supplier.model';
import {of} from 'rxjs/internal/observable/of';
import {SupplierService} from '../../supplier/supplier.service';
import {Product} from '../../product/product.model';
import {ProductService} from '../../product/product.service';
import * as moment from 'moment';
import {SelectionModel} from '@angular/cdk/collections';
import {PopupConfirmDialogComponent} from '../../common/popup-confirm-dialog/popup-confirm-dialog.component';
import {Store} from '../../store/store.model';
import {StoreService} from '../../store/store.service';
import {AuthService} from '../../authentication/auth.service';


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
    private location: Location,
    private supplierSer: SupplierService,
    private productSer: ProductService,
    private storeSer: StoreService,
    public authSer: AuthService
  ) {
    super();
  }

  @ViewChild(MatTable, {static: true}) table: MatTable<any>;

  apiFilter: WarehouseFilter;

  searchProductForm = new FormControl();
  orderFilter: FormGroup;
  productFilter: FormGroup;
  orderNationalFilter: FormGroup;

  timeFilter: FormGroup;

  titleTimeDefault = '3 tháng trước';
  titleTimeChoose = 'Lựa chọn khác';

  currentDateFilter: DateFilter;
  store: Store = null;

  public downloadLink = '';

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
    'no': 'Mã phiếu',
    'supplier': 'Nhà cung cấp',
    'type': 'Loại',
    'quantity': 'Số lượng',
    'total_price': 'Tổng tiền',
    'discount_type': 'Loại giảm giá',
    'branch_id': 'Chi nhánh',
    'price': 'Giá vốn',
    'vat': 'VAT',
    'vat_type': 'Loại VAT',
    'discount': 'Giảm giá',
    'amount': 'Thành tiền',
    'product_unit_id': 'Mã đơn vị',
    'note': 'Ghi chú',
    'expenses_price': 'Chi phí nhập trả NCC',
  };

  displayedColumns: string[] = ['select',
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
  columnsToDisplay: string[] = ['select',
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

  orderNationalFilterList = [
    {
      'value': 'yes',
      'name': 'Đã liên thông',
    },
    {
      'value': 'no',
      'name': 'Chưa liên thông',
    },
  ];
  actionNameObj = {
    'Update': 'Cập nhật',
    'Create': 'Tạo mới',
    'Update_Product': 'Cập nhật sản phẩm',
    'Create_Product': 'Thêm sản phẩm',
    'Delete_Product': 'Xóa sản phẩm',
  };

  dataSource = [];
  expandedElement: Warehouse | null;
  selection = new SelectionModel<Warehouse>(true, []);
  toggleMore = false;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  isLoadingResults = true;
  isRateLimitReached = false;
  codeSearch = null;
  toggleDropdownSearch = false;

  filteredSuppliers: Observable<Supplier[]>;
  filteredProducts: Observable<Product[]>;

  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource?.length;
    return numSelected === numRows;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  toggleAllRows() {
    if (this.isAllSelected()) {
      this.selection.clear();
      return;
    }
    this.selection.select(...this.dataSource);
  }

  /** The label for the checkbox on the passed row */
  checkboxLabel(row?: Warehouse): string {
    if (!row) {
      return `${this.isAllSelected() ? 'deselect' : 'select'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row?.id + 1}`;
  }

  finishSelect() {
    this._finishSelect();
  }

  _finishSelect() {
    const obj = {
      action: 'Connect',
      title: 'Xác nhận hoàn thành danh sách đã chọn .',
      content: 'Thẻ kho sẽ được tạo cho sản phẩm khi xác nhận thành công',
    };

    const dialogRef = this.dialog.open(PopupConfirmDialogComponent, {
      data: obj,
      width: '30%',
      minHeight: '60%',
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result?.event === 'confirm') {
        let itemsProcessed = 0;
        const total = this.selection.selected.length;
        this.selection.selected.forEach((item, index, array) => {
          if (item.status === 9) {
            this.mainService.update(item.id, {status: 10}).subscribe(res => {
              this.refreshData();
            });
          }

          itemsProcessed++;
          if (itemsProcessed === total) {
            this.notifyService.notify('success', 'Hoàn thành danh sách thành công.');
          }
        });
      }
    });
  }

  connectSelect() {
    this._connectSelect();
  }

  _connectSelect() {
    const obj = {
      action: 'Connect',
      title: 'Xác nhận liên thông danh sách đã chọn .',
      content: '',
    };

    const dialogRef = this.dialog.open(PopupConfirmDialogComponent, {
      data: obj,
      width: '30%',
      minHeight: '60%',
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result?.event === 'confirm') {
        let itemsProcessed = 0;
        this.selection.selected.forEach((item, index, array) => {
          this.mainService.connect(item.id).subscribe(res => {
            if (res?.success) {
            } else {
              this.notifyService.notify('warning', res?.message);
            }
            itemsProcessed++;
            if (itemsProcessed === array.length) {
              this.refreshData();
            }
          });

        });
      }
    });
  }

  disconnectSelect() {
    this._disconnectSelect();
  }

  _disconnectSelect() {
    const obj = {
      action: 'Connect',
      title: 'Xác nhận gỡ liên thông danh sách đã chọn .',
      content: '',
    };

    const dialogRef = this.dialog.open(PopupConfirmDialogComponent, {
      data: obj,
      width: '30%',
      minHeight: '60%',
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result?.event === 'confirm') {
        let itemsProcessed = 0;
        this.selection.selected.forEach((item, index, array) => {
          setTimeout(() => {
            this.mainService.disconnect(item.id).subscribe(res => {
              // if (res?.success) {
              // } else {
              //   this.notifySer.notify('warning', res?.message);
              // }
              itemsProcessed++;
              if (itemsProcessed === array.length) {
                this.refreshData();
              }
            });
          }, this.timeOutSelect);
        });
      }
    });
  }

  deleteSelect() {
    this._deleteSelect();
  }

  _deleteSelect() {
    const obj = {
      action: 'Delete',
      title: 'Xác nhận xóa danh sách đã chọn .',
      content: 'Thông tin sản phẩm đã xác nhận hoàn thành trước đó sẽ được hệ thống tạo thẻ kho xóa đi !',
    };

    const dialogRef = this.dialog.open(PopupConfirmDialogComponent, {
      data: obj,
      width: '30%',
      minHeight: '60%',
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result?.event === 'confirm') {
        let itemsProcessed = 0;
        this.selection.selected.forEach((item, index, array) => {
          this.mainService.delete(item.id).subscribe(res => {
            // if (res?.success) {
            //
            // } else {
            //   this.notifySer.notify('warning', res?.message);
            // }
            itemsProcessed++;
            if (itemsProcessed === array.length) {
              this.notifyService.notify('success', 'Xóa danh sách thành công.');
              this.refreshData();
            }
          });
        });
      }
    });
  }

  displaySupplier(supplier?: Supplier): string | undefined {
    return (supplier === undefined || supplier === null) ? undefined : supplier.name;
  }

  displayProduct(product?: Product): string | undefined {
    return (product === undefined || product === null) ? undefined : product.product_name;
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
    filter.status = this.orderFilter.controls['status'].value;
    filter.order_national = this.orderNationalFilter.controls['status'].value;

    const supplier = this.orderFilter.controls['supplier']?.value;
    const product = this.productFilter.controls['product']?.value;
    filter.supplier_id = supplier?.id;
    filter.product_id = product?.id;
    return filter;
  }

  initDateFilter() {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    const first = new Date(year, month, 1);
    const obj = new DateFilter();
    // 3 tháng trước

    obj.date_to = moment().format('YYYY-MM-DD');
    obj.date_from = moment().subtract(3, 'months').format('YYYY-MM-DD');
    // obj.date_from = this.service.convertDateYYYYMMDD(first);
    // obj.date_to = this.service.convertDateYYYYMMDD(today);

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
    this.downloadLink = this.mainService.getDownloadLink(this.apiFilter);
    this.mainService.getList(this.apiFilter).subscribe(res => {
      this.dataSource = res.body;
      if (this.dataSource.length === 1) {
        const arr = this.dataSource;``
        this.expandedElement = arr[0];
      }
      this.reloadFilter(res);
      this.isLoadingResults = false;

      let url = '/transaction/warehouse';
      url += '?' + this.apiFilter.toFilterString();
      this.location.go(url);
    });
  }

  ngOnInit() {

    this.initDateFilter();

    this.orderFilter = this.fb.group({
      status: [
        ['10', '9']
      ],
      supplier: [null],
      product: [null],
    });

    this.productFilter = this.fb.group({
      product: [null],
    });

    this.timeFilter = this.fb.group({
      typeTime: [
        'default'
      ],
    });
    this.orderNationalFilter = this.fb.group({
      status: [
        ['yes', 'no']
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

    this.filteredSuppliers = this.orderFilter.controls['supplier'].valueChanges.pipe(
      startWith(''),
      // delay emits
      debounceTime(300),
      // use switch map so as to cancel previous subscribed events, before creating new once
      switchMap(value => {
        if (value !== '') {
          // lookup from github
          return this.lookupSupplier(value);
        } else {
          // if no value is present, return null
          return of(null);
        }
      })
    );

    this.filteredProducts = this.productFilter.controls['product'].valueChanges.pipe(
      startWith(''),
      // delay emits
      debounceTime(300),
      // use switch map so as to cancel previous subscribed events, before creating new once
      switchMap(value => {
        if (value !== '') {
          // lookup from github
          return this.lookupProduct(value);
        } else {
          // if no value is present, return null
          return of(null);
        }
      })
    );

    this.selection.changed.subscribe(res => {
      if (this.selection.selected.length > 0) {
        this.toggleMore = true;
      } else {
        this.toggleMore = false;
      }
    });

    this.storeSer.getDetail().subscribe(res => {
      this.store = res;
    });
  }

  refreshData() {
    this.apiFilter = this.buildFilterFromParams();
    this.loadData();
    this.selection.clear();
  }

  lookupSupplier(value: string): Observable<Supplier[]> {
    return this.supplierSer.autocomplete(value).pipe(
      // map the item property of the github results as our return object
      map(results => results),
      // catch errors
      catchError(_ => {
        return of(null);
      })
    );
  }

  lookupProduct(value: string): Observable<Supplier[]> {
    return this.productSer.autocomplete(value).pipe(
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

  orderFilterChange() {
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

  toggleDropdown() {
    if (this.toggleDropdownSearch === false) {
      this.toggleDropdownSearch = true;
    } else {
      this.toggleDropdownSearch = false;
    }
  }

  canDo(permissionName: string): boolean {
    const allPermissions = this.authSer.getPermissionsFromLocalStorage();

    return allPermissions.indexOf(permissionName) !== -1;
  }

  checkBoxFilterChange($event: any, value: any, field: string, form: FormGroup) {
    this.handleFilterCheckbox(form, field, value);
    this.apiFilter = this.buildFilterFromParams();
    this.loadData();
  }
}
