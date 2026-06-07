import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import {Router} from '@angular/router';
import {ListComponentBase} from '../../shared/base';
import {MatDialog} from '@angular/material/dialog';
import {NotifierService} from 'angular-notifier';
import {animate, state, style, transition, trigger} from '@angular/animations';
import {ActivatedRoute} from '@angular/router';
import {MatTable} from '@angular/material/table';
import {MatPaginator} from '@angular/material/paginator';
import {MatSort} from '@angular/material/sort';
import {InvoiceFilter, Invoice, DateFilter} from '../invoice.model';
import {InvoiceService} from '../invoice.service';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {DatetimeDefaultFilterDialogComponent} from '../datetime-default-filter-dialog/datetime-default-filter-dialog.component';
import {DatetimeChooseFilterDialogComponent} from '../datetime-choose-filter-dialog/datetime-choose-filter-dialog.component';
import {catchError, debounceTime, map, startWith, switchMap} from 'rxjs/operators';
import {Product} from '../../product/product.model';
import {Observable} from 'rxjs';
import {Supplier} from '../../supplier/supplier.model';
import {of} from 'rxjs/internal/observable/of';
import {ProductService} from '../../product/product.service';
import {Customer} from '../../customer/customer.model';
import {CustomerService} from '../../customer/customer.service';
import * as moment from 'moment';
import {SelectionModel} from '@angular/cdk/collections';
import {PopupConfirmDialogComponent} from '../../common/popup-confirm-dialog/popup-confirm-dialog.component';
import {StoreService} from '../../store/store.service';
import {Store} from '../../store/store.model';
import {Location} from '@angular/common';

@Component({
  selector: 'app-invoice-list',
  templateUrl: './invoice-list.component.html',
  styleUrls: ['./invoice-list.component.css'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({height: '0px', minHeight: '0'})),
      state('expanded', style({height: '*'})),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ]
})
export class InvoiceListComponent extends ListComponentBase implements OnInit, AfterViewInit {

  constructor(
    private service: InvoiceService,
    private route: ActivatedRoute,
    private dialog: MatDialog,
    private notifySer: NotifierService,
    private fb: FormBuilder,
    private router: Router,
    private location: Location,
    private productSer: ProductService,
    private customerSer: CustomerService,
    private storeSer: StoreService
  ) {
    super();
  }

  @ViewChild(MatTable, {static: true}) table: MatTable<any>;
  @ViewChild('selectColumn') selectColumn;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  public downloadLink = '';

  isLoadingResults = true;
  isRateLimitReached = false;
  toggleDropdownSearch = false;

  apiFilter: InvoiceFilter;
  expandedElement: Invoice | null;
  timeFilter: FormGroup;
  orderStatusFilter: FormGroup;
  orderNationalFilter: FormGroup;
  productFilter: FormGroup;
  customerFilter: FormGroup;
  einvoiceFilter: FormGroup;
  expensesFilter: FormGroup;

  currentDateFilter: DateFilter;

  searchInvoiceForm = new FormControl();

  store: Store = null;

  // second column
  TongTienHang = 0;
  GiamGia = 0;
  ChiPhiKhac = 0;
  KhachHangTra = 0;

  //
  titleTimeDefault = '3 tháng trước';
  titleTimeChoose = 'Lựa chọn khác';

  columnsHeader = {
    '#': '#',
    'invoice_no': 'Mã đơn',
    'created_at': 'Thời gian',
    'returns': 'Mã trả hàng',
    'customer': 'Khách hàng',
    'national_pharmacy_no': 'Phiếu DQG',
    'total_price': 'Tổng tiền hàng',
    'discount': 'Giảm giá',
    'expenses_order_price': 'Chi phí khác',
    'payment': 'Khách đã trả',
    'einvoice_no': 'Số HĐĐT',
    'einvoice_status': 'Trạng thái ĐĐT'
  };

  displayedColumns: string[] = ['select',
    '#', 'invoice_no', 'created_at', 'returns', 'customer', 'national_pharmacy_no',
    'total_price', 'discount', 'expenses_order_price', 'payment', 'einvoice_no', 'einvoice_status'
  ];
  columnsToDisplay: string[] = ['select',
    '#', 'invoice_no', 'created_at', 'returns', 'customer', 'national_pharmacy_no',
    'total_price', 'discount', 'expenses_order_price', 'payment', 'einvoice_no', 'einvoice_status'
  ];

  // for second column
  second_columnsToDisplay: string[] = ['second_select',
    'second_#', 'second_invoice_no', 'second_created_at', 'second_returns', 'second_customer',
    'second_national_pharmacy_no', 'second_total_price', 'second_discount', 'second_expenses_order_price', 'second_payment',
    'second_einvoice_no', 'second_einvoice_status'
  ];
  get second_displayedColumns(): string[] {
    return this.displayedColumns.map(col => `second_${col}`).filter(col => this.second_columnsToDisplay.includes(col));
  }


  dataSource: Invoice[] = [];
  selection = new SelectionModel<Invoice>(true, []);
  toggleMore = false;

  statusItems: any[] = [
    {
      'id': 'default',
      'title': 'Mặc định'
    },
    {
      'id': 'choose',
      'title': 'Lựa chọn khác'
    }
  ];

  orderStatusFilterList = [
    {
      'value': 'pending',
      'name': 'Đang xử lý',
    },
    {
      'value': 'done',
      'name': 'Hoàn thành',
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

  codeSearch = null;

  filteredProducts: Observable<Product[]>;
  filteredCustomers: Observable<Customer[]>;

  einvoiceFilterList = [
    { value: 'yes', name: 'Có' },
    { value: 'no', name: 'Không' },
  ];

  expensesFilterList = [
    { value: 'yes', name: 'Có' },
    { value: 'no', name: 'Không' },
  ];

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
  checkboxLabel(row?: Invoice): string {
    if (!row) {
      return `${this.isAllSelected() ? 'deselect' : 'select'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row?.id + 1}`;
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
          this.service.connect(item.id).subscribe(res => {
            if (res?.success) {
            } else {
              this.notifySer.notify('warning', res?.message);
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
            this.service.disconnect(item.id).subscribe(res => {
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
          this.service.delete(item.id).subscribe(res => {
            // if (res?.success) {
            //
            // } else {
            //   this.notifySer.notify('warning', res?.message);
            // }
            itemsProcessed++;
            if (itemsProcessed === array.length) {
              this.notifySer.notify('success', 'Xóa danh sách thành công.');
              this.refreshData();
            }
          });

        });
      }
    });
  }

  displayProduct(product?: Product): string | undefined {
    return (product === undefined || product === null) ? undefined : product.product_name;
  }

  displayCustomer(customer?: Customer): string | undefined {
    return (customer === undefined || customer === null) ? undefined : customer.name;
  }

  buildFilterFromParams(): InvoiceFilter {
    function write<K extends keyof InvoiceFilter>(arg: InvoiceFilter, key: K, value: InvoiceFilter[K]): void {
      arg[key] = value;
    }

    const objDateFilter = this.service.getDateFilter();
    const filter = new InvoiceFilter();

    const objectKeys = Object.keys(filter) as Array<keyof InvoiceFilter>;

    for (const attr of objectKeys) {
      write(filter, attr, this.route.snapshot.queryParams['InvoiceSearch[' + attr + ']']);
    }
    filter.page = this.route.snapshot.queryParams['page'];
    filter.pageSize = this.route.snapshot.queryParams['pageSize'];
    filter.sort = this.route.snapshot.queryParams['sort'];
    filter.expand = 'customer,payment,store,user,returns,today,time,createdFormat,prescription';
    filter.date_from = objDateFilter.date_from;
    filter.date_to = objDateFilter.date_to;
    filter.order_status = this.orderStatusFilter.controls['status'].value.join(',');
    filter.order_national = this.orderNationalFilter.controls['status'].value.join(',');
    filter.einvoice = this.einvoiceFilter.controls['status'].value.join(',');
    filter.expenses = this.expensesFilter.controls['status'].value.join(',');

    const product = this.productFilter.controls['product']?.value;
    filter.product_id = product?.id;

    const customer = this.customerFilter.controls['customer']?.value;
    filter.customer_id = customer?.id;

    return filter;
  }

  buildFrom() {
    this.timeFilter = this.fb.group({
      typeTime: [
        'default'
      ],
    });
    this.orderStatusFilter = this.fb.group({
      status: [
        ['pending', 'done']
      ],
    });
    this.orderNationalFilter = this.fb.group({
      status: [
        ['yes', 'no']
      ],
    });
    this.productFilter = this.fb.group({
      product: [null],
    });
    this.customerFilter = this.fb.group({
      customer: [null],
    });
    this.einvoiceFilter = this.fb.group({
      status: new FormControl(['yes', 'no']),
    });
    this.expensesFilter = this.fb.group({
      status: new FormControl(['yes', 'no']),
    });
  }

  /**
   * Tim kiem theo trang thai don hang
   */
  orderStatusFilterChange() {
    this.apiFilter = this.buildFilterFromParams();
    this.loadData();
  }

  checkBoxFilterChange($event: any, value: any, field: string, form: FormGroup) {
    this.handleFilterCheckbox(form, field, value);
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

    obj.date_to = moment().format("YYYY-MM-DD");
    obj.date_from = moment().subtract(3, 'months').format("YYYY-MM-DD");
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
        this.apiFilter.invoice_no = code;
        this.codeSearch = code;
        this.apiFilter.date_from = '';
        this.apiFilter.date_to = '';
      } else {
        const objDateFilter = this.service.getDateFilter();
        this.apiFilter.date_from = objDateFilter.date_from;
        this.apiFilter.date_to = objDateFilter.date_to;
        this.apiFilter.invoice_no = '';
      }
    }
    this.downloadLink = this.service.getDownloadLink(this.apiFilter);
    this.isLoadingResults = true;
    this.service.getList(this.apiFilter).subscribe(res => {
      const data = res.body;
      let stt = 0;
      if (data.length === 1) {
        const arr = data;
        this.expandedElement = data[0];
      }

      data.forEach(elementData => {
        stt++;
        elementData.stt = stt; // tinh STT

        // const date = new Date(1000 * elementData.created_at).toJSON().slice(0, 16);
        // elementData.created_at = date.slice(8, 10) + '/'
        //   + date.slice(5, 7) + '/'
        //   + date.slice(0, 4) + ' '
        //   + date.slice(11, 16);

        // tong tien khach hang da tra, tien giam gia
        let total_payment = 0;
        let discount_price = 0;
        elementData.payment.forEach(ele => {
          total_payment = total_payment + ele.total_price;

        });
        elementData.total_payment = total_payment;
        // End - tong tien khach hang da tra, tien giam gia

        if (elementData.discount_type === 'price') {
          discount_price = elementData.discount;
        } else {
          discount_price = elementData.total_price * elementData.discount / 100;
        }
        elementData.discount_price = discount_price;

      });
      this.dataSource = data;

      this.reloadFilter(res);

      let url = '/transaction/invoice';
      url += '?' + this.apiFilter.toFilterString();
      this.location.go(url);

      this.isLoadingResults = false;
    });

    // second header
    this.service.getSumaryInvoice(this.apiFilter).subscribe(res => {
      this.TongTienHang = res.body['TongTienHang'];
      this.GiamGia = res.body['GiamGia'];
      this.ChiPhiKhac = res.body['ChiPhiKhac'];
      this.KhachHangTra = res.body['KhachHangTra'];
    });
  }

  ngOnInit(): void {
    this.initDateFilter();
    this.buildFrom();
    this.apiFilter = this.buildFilterFromParams();
    this.loadData();

    this.service.subscribeDateFilter.subscribe(obj => {
      if (JSON.stringify(this.currentDateFilter) !== JSON.stringify(obj)) {
        this.currentDateFilter = obj;
        this.apiFilter = this.buildFilterFromParams();
        this.loadData();
      }
    });

    this.searchInvoiceForm.valueChanges.pipe(debounceTime(800)).subscribe(res => {
      this.apiFilter = this.buildFilterFromParams();
      if (res !== '' && res !== null) {
        this.apiFilter.invoice_no = res;
      }
      this.loadData();
    });

    this.service.subscribeLoadInvoice.subscribe(action => {
      if (action === true) {
        this.apiFilter = this.buildFilterFromParams();
        this.loadData();
        this.service.setLoadInvoice(false);
      }
    });

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

    this.productFilter.controls['product'].valueChanges.pipe(debounceTime(300)).subscribe(value => {
      if (value === null || value === '') {
        this.filterChange();
      }
    });

    this.filteredCustomers = this.customerFilter.controls['customer'].valueChanges.pipe(
      startWith(''),
      // delay emits
      debounceTime(300),
      // use switch map so as to cancel previous subscribed events, before creating new once
      switchMap(value => {
        if (value !== '') {
          // lookup from github
          return this.lookupCustomer(value);
        } else {
          // if no value is present, return null
          return of(null);
        }
      })
    );

    this.customerFilter.controls['customer'].valueChanges.pipe(debounceTime(300)).subscribe(value => {
      if (value === null || value === '') {
        this.filterChange();
      }
    });

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

  ngAfterViewInit(): void { //
    const customer_id = localStorage.getItem('customer_id');
    if (customer_id !== null) {
      this.isLoadingResults = true;
      this.customerSer.getDetail(customer_id, '').subscribe(customer => {
        this.customerFilter.patchValue({
          'customer': customer,
        });
        localStorage.removeItem('customer_id');

        setTimeout(() => {
          this.refreshData();
        }, this.timeOutSelect);

      });
    }
  }

  refreshData() {
    this.apiFilter = this.buildFilterFromParams();
    this.loadData();
    this.selection.clear();
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.apiFilter = this.buildFilterFromParams();
    this.apiFilter.invoice_no = filterValue;
    this.loadData();
  }

  openTimeDefault() {
    const obj = { currentTitle: this.titleTimeDefault };
    const dialogRef = this.dialog.open(DatetimeDefaultFilterDialogComponent, {
      data: obj,
      width: '40%',
      minHeight: '80%',
      autoFocus: false,
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

  goToCartPage() {
    this.router.navigate(['/sale']);
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

  lookupCustomer(value: string): Observable<Customer[]> {
    return this.customerSer.autocomplete(value, null).pipe(
      // map the item property of the github results as our return object
      map(results => results),
      // catch errors
      catchError(_ => {
        return of(null);
      })
    );
  }

  filterChange() {
    this.apiFilter = this.buildFilterFromParams();
    this.loadData();
  }

  toggleDropdown() {
    if (this.toggleDropdownSearch === false) {
      this.toggleDropdownSearch = true;
    } else {
      this.toggleDropdownSearch = false;
    }
  }

  resetFilter() {
    this.orderStatusFilter.patchValue({
      status: ['pending', 'done'],
    });

    this.orderNationalFilter.patchValue({
      status: ['yes', 'no'],
    });

    this.einvoiceFilter.patchValue({
      status: ['yes', 'no'],
    });

    this.expensesFilter.patchValue({
      status: ['yes', 'no'],
    });
  }
}
