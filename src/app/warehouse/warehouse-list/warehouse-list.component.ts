import {Component, HostListener, OnInit, ViewChild} from '@angular/core';
import {MatTable} from '@angular/material/table';
import {MatPaginator} from '@angular/material/paginator';
import {MatSort} from '@angular/material/sort';
import {ListComponentBase} from '../../shared/base';
import {ActivatedRoute, Router} from '@angular/router';
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
import {IResponse} from '../../common/response.model';


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
    private router: Router,
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

  // Khoảng thời gian trên URL khác khoảng mặc định -> người dùng đã tự chọn.
  khoiPhucThoiGianTuUrl = false;

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
            this.mainService.update(item.id, {status: 10}).subscribe((res: IResponse<Warehouse>) => {
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
        let failedCount = 0;
        this.selection.selected.forEach((item, index, array) => {
          this.mainService.delete(item.id).subscribe(res => {
            itemsProcessed++;
            if (itemsProcessed === array.length) {
              if (failedCount === 0) {
                this.notifyService.notify('success', 'Xóa danh sách thành công.');
              }
              this.refreshData();
            }
          }, error => {
            // Hiện thông báo lỗi từ BE (vd: chặn xóa vì hàng đã bán) cho từng phiếu bị chặn.
            itemsProcessed++;
            failedCount++;
            this.notifyService.notify('error', error?.error?.message || 'Không thể xóa đơn nhập.');
            if (itemsProcessed === array.length) {
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
    filter.expand = 'supplier,created_user,product_count,total_quantity,warehouseExpensess,nationalPharmacyV2';
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

  /**
   * Đọc lại một bộ lọc nhiều lựa chọn từ URL.
   *
   * buildFilterFromParams() lấy giá trị các nhóm checkbox từ chính form chứ không
   * từ URL, nên form luôn dựng bằng giá trị mặc định sẽ làm mất lựa chọn của người
   * dùng mỗi khi quay lại màn hình.
   *
   * Lưu ý: toFilterString() bỏ qua giá trị rỗng nên khi bỏ chọn hết, tham số không
   * có trên URL và ta trả về mặc định.
   */
  private locNhieuLuaChonTuUrl(thamSo: string, macDinh: string[]): string[] {
    const giaTri = this.route.snapshot.queryParams['WarehouseSearch[' + thamSo + ']'];
    if (giaTri === undefined || giaTri === null || giaTri === '') {
      return macDinh;
    }
    return String(giaTri).split(',');
  }

  /**
   * Đưa bộ lọc hiện tại lên thanh địa chỉ để quay lại còn khôi phục được.
   *
   * PHẢI dùng router.navigate, KHÔNG dùng location.go.
   *
   * location.go() chỉ gọi history.pushState và gắn lại đúng navigationId của lần
   * điều hướng hiện tại. Router vì thế không biết URL đã đổi: mọi lần đổi bộ lọc
   * đều mang chung một navigationId, mà URL Router nhớ cho id đó là URL gốc KHÔNG
   * có tham số lọc. Nên khi bấm Back, Router khôi phục theo id -> ra URL gốc, sạch
   * bộ lọc. Đó là lý do "trên thanh địa chỉ có đủ tham số mà back lại vẫn mất".
   *
   * router.navigate tạo một lần điều hướng thật, Router nhớ đúng URL kèm tham số,
   * nên Back khôi phục đúng.
   */
  private ghiBoLocLenUrl(): void {
    this.router.navigate(['/transaction/warehouse'], {
      queryParams: this.thamSoLocChoUrl(),
      replaceUrl: true,
    });
  }

  /**
   * Chuyển chuỗi lọc + hai tham số thời gian thành object cho router.navigate.
   *
   *  - timeType : người dùng đang đứng ở ô radio nào ('default' = chọn nhanh,
   *               'choose' = tự chọn khoảng).
   *  - timeTitle: nhãn preset đang chọn ở ô trên ("Hôm nay", "Tháng này"...).
   *
   * date_from/date_to không cho biết hai điều đó, thiếu chúng thì ô trên luôn hiện
   * "3 tháng trước". Đặt ngoài WarehouseSearch[] để không gửi rác lên API.
   */
  private thamSoLocChoUrl(): { [key: string]: string } {
    const thamSo: { [key: string]: string } = {};

    for (const cap of this.apiFilter.toFilterString().split('&')) {
      if (!cap) {
        continue;
      }
      const viTri = cap.indexOf('=');
      if (viTri > 0) {
        thamSo[cap.substring(0, viTri)] = cap.substring(viTri + 1);
      }
    }

    // Không có khoảng ngày = đang mở đúng một phiếu theo mã, cố ý bỏ giới hạn thời
    // gian. Đánh dấu 'all' để lần dựng lại component còn biết mà giữ nguyên.
    if (!this.apiFilter.date_from && !this.apiFilter.date_to) {
      thamSo['timeType'] = 'all';
      return thamSo;
    }

    const loai = this.timeFilter?.controls['typeTime']?.value;
    if (loai) {
      thamSo['timeType'] = loai;
    }
    if (this.titleTimeDefault) {
      thamSo['timeTitle'] = this.titleTimeDefault;
    }
    return thamSo;
  }

  initDateFilter() {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    const first = new Date(year, month, 1);
    const obj = new DateFilter();
    // 3 tháng trước

    const macDinhTu = moment().subtract(3, 'months').format('YYYY-MM-DD');
    const macDinhDen = moment().format('YYYY-MM-DD');

    // Ưu tiên khoảng thời gian đang có trên URL (loadData() đã ghi ra bằng location.go).
    // Trước đây luôn ghi đè về "3 tháng gần nhất" nên lọc xong, vào một phiếu rồi
    // quay lại là mất khoảng thời gian đã chọn.
    const tuUrl = this.route.snapshot.queryParams['WarehouseSearch[date_from]'];
    const denUrl = this.route.snapshot.queryParams['WarehouseSearch[date_to]'];
    const loaiThoiGian = this.route.snapshot.queryParams['timeType'];

    if (loaiThoiGian === 'all') {
      // Đang mở đúng một phiếu theo mã (bấm từ Thẻ kho): cố ý KHÔNG giới hạn thời
      // gian, nếu không thì phiếu cũ hơn 3 tháng sẽ không hiện ra.
      //
      // Phải đánh dấu tường minh trên URL vì ghiBoLocLenUrl() điều hướng từ
      // 'warehouse/code/:code' sang 'warehouse', Angular huỷ rồi dựng lại component,
      // làm mất đoạn xoá ràng buộc ngày mà loadData() vừa thực hiện.
      obj.date_from = '';
      obj.date_to = '';
    } else if (tuUrl && denUrl) {
      obj.date_from = tuUrl;
      obj.date_to = denUrl;
      this.khoiPhucThoiGianTuUrl = (tuUrl !== macDinhTu || denUrl !== macDinhDen);
    } else {
      obj.date_from = macDinhTu;
      obj.date_to = macDinhDen;
    }

    // Nhãn preset của ô radio trên. URL nói rõ thì tin URL, vì date_from/date_to
    // không cho biết người dùng đã chọn "Hôm nay" hay "Tháng này".
    const nhanUrl = this.route.snapshot.queryParams['timeTitle'];
    if (nhanUrl) {
      this.titleTimeDefault = nhanUrl;
    }
    // Ô radio đang đứng. Có timeType thì dùng thẳng, khỏi phải suy từ khoảng ngày.
    const loaiUrl = this.route.snapshot.queryParams['timeType'];
    if (loaiUrl === 'default' || loaiUrl === 'choose') {
      this.khoiPhucThoiGianTuUrl = (loaiUrl === 'choose');
    }

    // Không giới hạn thời gian thì để nguyên nhãn mặc định; dựng Date từ chuỗi rỗng
    // sẽ ra "NaN/NaN/NaN" trên giao diện.
    if (obj.date_from && obj.date_to) {
      const date_from = new Date(obj.date_from);
      const date_to = new Date(obj.date_to);
      this.titleTimeChoose = this.convertDate(date_from) + ' - ' + this.convertDate(date_to);
    }

    this.currentDateFilter = obj;
    this.service.setDateFilter(obj);
  }

  loadData(): void {
    const code = this.route.snapshot.paramMap.get('code');
    if (code !== null && code !== undefined) {
      if (this.codeSearch == null) {
        this.apiFilter.no = code;
        this.codeSearch = code;
        // Mở đúng một phiếu theo mã (bấm từ Thẻ kho) thì BỎ ràng buộc thời gian.
        // Thiếu hai dòng này thì bộ lọc mặc định 3 tháng vẫn áp, phiếu nhập cũ
        // hơn 3 tháng không hiện ra dù đã nhảy đúng màn. Màn Hoá đơn bán vốn đã
        // làm việc này, màn Nhập hàng thì chưa.
        this.apiFilter.date_from = '';
        this.apiFilter.date_to = '';
      } else {
        const objDateFilter = this.service.getDateFilter();
        this.apiFilter.date_from = objDateFilter.date_from;
        this.apiFilter.date_to = objDateFilter.date_to;
        this.apiFilter.no = '';
      }
    }
    this.isLoadingResults = true;
    this.downloadLink = this.mainService.getDownloadLink(this.apiFilter);

    // Ghi URL NGAY lúc phát request, không đợi response.
    // Trước đây ghi trong callback: nhiều lần loadData() chồng nhau thì response
    // nào về sau cùng sẽ ghi đè URL - kể cả response của bộ lọc CŨ. Đó là lý do
    // filter lúc giữ được lúc không.
    this.ghiBoLocLenUrl();

    this.mainService.getList(this.apiFilter).subscribe(res => {
      this.dataSource = res.body;
      if (this.dataSource.length === 1) {
        const arr = this.dataSource;``
        this.expandedElement = arr[0];
      }
      this.reloadFilter(res);
      this.isLoadingResults = false;

    });
  }

  ngOnInit() {

    this.initDateFilter();

    this.orderFilter = this.fb.group({
      status: [
        this.locNhieuLuaChonTuUrl('status', ['10', '9'])
      ],
      supplier: [null],
      product: [null],
    });

    this.productFilter = this.fb.group({
      product: [null],
    });

    this.timeFilter = this.fb.group({
      typeTime: [
        this.khoiPhucThoiGianTuUrl ? 'choose' : 'default'
      ],
    });
    this.orderNationalFilter = this.fb.group({
      status: [
        this.locNhieuLuaChonTuUrl('order_national', ['yes', 'no'])
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

    this.orderFilter.controls['supplier'].valueChanges.subscribe(value => {
      if (value === null || value === '') {
        this.apiFilter = this.buildFilterFromParams();
        this.loadData();
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

    this.productFilter.controls['product'].valueChanges.subscribe(value => {
      if (value === null || value === '') {
        this.apiFilter = this.buildFilterFromParams();
        this.loadData();
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
      // Hộp thoại gọi setDateFilter() TRƯỚC khi đóng, nên loadData() đã ghi URL xong
      // từ lúc nhãn và radio còn là giá trị cũ. Ghi lại ở đây để URL mang đúng
      // preset vừa chọn, nếu không thì quay lại luôn thấy "3 tháng trước".
      this.ghiBoLocLenUrl();
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
      // Xem chú thích ở openTimeDefault(): URL đã được ghi trước khi radio đổi.
      this.ghiBoLocLenUrl();
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
