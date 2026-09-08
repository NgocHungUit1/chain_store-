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
import {PrescriptionDetailsDialogComponent} from '../prescription-details-dialog/prescription-details-dialog.component';

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
  paymentMethodFilter: FormGroup;
  prescriptionTypeFilter: FormGroup;

  currentDateFilter: DateFilter;

  searchInvoiceForm = new FormControl();
  patientNameSearchForm = new FormControl();

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
    'patient_name': 'Tên bệnh nhân',
    'national_pharmacy_no': 'Phiếu DQG',
    'total_price': 'Tổng tiền hàng',
    'discount': 'Giảm giá',
    'expenses_order_price': 'Chi phí khác',
    'payment': 'Khách đã trả',
    'payment_method': 'Phương thức TT',
    'einvoice_no': 'Số HĐĐT',
    'einvoice_status': 'Trạng thái ĐĐT'
  };

  displayedColumns: string[] = ['select',
    '#', 'invoice_no', 'created_at', 'returns', 'customer', 'patient_name', 'national_pharmacy_no',
    'total_price', 'discount', 'expenses_order_price', 'payment', 'payment_method', 'einvoice_no', 'einvoice_status'
  ];
  columnsToDisplay: string[] = ['select',
    '#', 'invoice_no', 'created_at', 'returns', 'customer', 'patient_name', 'national_pharmacy_no',
    'total_price', 'discount', 'expenses_order_price', 'payment', 'payment_method', 'einvoice_no', 'einvoice_status'
  ];

  // for second column
  second_columnsToDisplay: string[] = ['second_select',
    'second_#', 'second_invoice_no', 'second_created_at', 'second_returns', 'second_customer', 'second_patient_name',
    'second_national_pharmacy_no', 'second_total_price', 'second_discount', 'second_expenses_order_price', 'second_payment',
    'second_payment_method', 'second_einvoice_no', 'second_einvoice_status'
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

  // Khoảng thời gian trên URL khác khoảng mặc định -> người dùng đã tự chọn,
  // cần bật lại radio "tự chọn" sau khi buildFrom() dựng form.
  khoiPhucThoiGianTuUrl = false;

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

  // Map giá trị payment_method -> nhãn hiển thị (đồng bộ với tab Lịch sử thanh toán)
  typeMethods = {
    'cash': 'Tiền mặt',
    'card': 'Thẻ',
    'transfer': 'Chuyển khoản',
    'bank_transfer': 'Chuyển khoản',
    'point': 'Điểm',
  };

  paymentMethodFilterList = [
    { value: 'cash', name: 'Tiền mặt' },
    { value: 'bank_transfer', name: 'Chuyển khoản' },
  ];

  prescriptionTypeFilterList = [
    { value: '1', name: 'Có đơn thuốc' },
    { value: '0', name: 'Không có đơn thuốc (Bán lẻ)' },
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

  // ===== Xuất hoá đơn điện tử hàng loạt =====

  /** Đang chạy tới hoá đơn thứ mấy, để hiện tiến độ và khoá nút */
  einvoiceRunning = false;
  einvoiceDone = 0;
  einvoiceTotal = 0;

  /**
   * Hoá đơn đủ điều kiện xuất HĐĐT: đã hoàn thành, chưa bị huỷ, và CHƯA phát hành.
   *
   * Bỏ qua hoá đơn đã phát hành là chủ ý: API xuất HĐĐT không chặn xuất trùng
   * (đoạn kiểm tra use_einvoice trong InvoiceController đang bị comment lại),
   * nên bấm nhầm trên hoá đơn đã có HĐĐT là phát hành thêm một số nữa ở cơ quan
   * thuế - sai sót đó không thu lại được từ đây.
   */
  private laHoaDonXuatDuoc(item): boolean {
    return item && item.order_status === 'done' && Number(item.status) === 10
      && Number(item.use_einvoice) !== 1 && Number(item.einvoice_status) !== 1;
  }

  createEInvoiceSelect() {
    if (this.einvoiceRunning) {
      return;
    }
    const chon = this.selection.selected;
    if (!chon.length) {
      this.notifySer.notify('warning', 'Chưa chọn hoá đơn nào.');
      return;
    }

    const lam = chon.filter(x => this.laHoaDonXuatDuoc(x));
    const boQua = chon.length - lam.length;

    if (!lam.length) {
      this.notifySer.notify('warning',
        'Không có hoá đơn nào xuất được. ' + chon.length + ' hoá đơn đã chọn đều đã phát hành HĐĐT, '
        + 'chưa hoàn thành hoặc đã huỷ.');
      return;
    }

    let content = 'Sẽ xuất hóa đơn điện tử cho <b>' + lam.length + '</b> hóa đơn.';
    if (boQua > 0) {
      content += '<br>Bỏ qua <b>' + boQua + '</b> hóa đơn đã phát hành HĐĐT hoặc chưa hoàn thành.';
    }
    content += '<br><br>Hóa đơn đã phát hành thì <b>không thu hồi được</b>, hãy kiểm tra kỹ danh sách đã chọn.';

    const dialogRef = this.dialog.open(PopupConfirmDialogComponent, {
      data: {action: 'Connect', title: 'Xác nhận xuất hóa đơn điện tử hàng loạt', content: content},
      width: '30%',
      minHeight: '60%',
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result?.event === 'confirm') {
        this.chayXuatEInvoice(lam);
      }
    });
  }

  /**
   * Chạy TUẦN TỰ từng hoá đơn, không bắn song song như liên thông.
   * Mỗi lần xuất là một lượt gọi sang Bkav; bắn 50 lượt cùng lúc dễ bị chặn
   * hoặc timeout, mà lỗi giữa chừng thì không biết cái nào đã phát hành cái nào chưa.
   */
  private chayXuatEInvoice(danhSach: any[]) {
    this.einvoiceRunning = true;
    this.einvoiceTotal = danhSach.length;
    this.einvoiceDone = 0;

    const thanhCong: string[] = [];
    const that: { no: string, ly_do: string }[] = [];

    const chayTiep = (i: number) => {
      if (i >= danhSach.length) {
        this.einvoiceRunning = false;
        this.baoKetQuaEInvoice(thanhCong, that);
        this.refreshData();
        return;
      }
      const item = danhSach[i];
      this.service.createEInvoice(item.id).subscribe(
        res => {
          if (res && res.success === true) {
            thanhCong.push(item.invoice_no);
          } else {
            that.push({no: item.invoice_no, ly_do: (res && res.message) ? res.message : 'Không rõ lỗi'});
          }
          this.einvoiceDone = i + 1;
          chayTiep(i + 1);
        },
        () => {
          that.push({no: item.invoice_no, ly_do: 'Lỗi kết nối'});
          this.einvoiceDone = i + 1;
          chayTiep(i + 1);
        }
      );
    };

    chayTiep(0);
  }

  private baoKetQuaEInvoice(thanhCong: string[], that: { no: string, ly_do: string }[]) {
    if (thanhCong.length) {
      this.notifySer.notify('success', 'Đã xuất HĐĐT cho ' + thanhCong.length + ' hóa đơn.');
    }
    if (that.length) {
      // Liệt kê tối đa 5 hoá đơn lỗi cho gọn, còn lại gộp số
      const dau = that.slice(0, 5).map(x => x.no + ': ' + x.ly_do).join(' | ');
      const conLai = that.length > 5 ? ' ... và ' + (that.length - 5) + ' hóa đơn khác' : '';
      this.notifySer.notify('error', that.length + ' hóa đơn thất bại — ' + dau + conLai);
    }
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

  // Gộp các phương thức thanh toán (không trùng) của 1 hóa đơn để hiển thị ở cột
  paymentMethodLabel(element: Invoice): string {
    const payments = (element?.payment || []) as any[];
    const labels: string[] = [];
    for (const p of payments) {
      const label = this.typeMethods[p?.payment_method] || p?.payment_method;
      if (label && !labels.includes(label)) {
        labels.push(label);
      }
    }
    return labels.join(', ');
  }

  displayCustomer(customer?: Customer): string | undefined {
    return (customer === undefined || customer === null) ? undefined : customer.name;
  }

  displayPatient(invoice: Invoice): string {
    return invoice?.patient_name || '';
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
    filter.expand = 'customer,payment,store,user,returns,today,time,createdFormat,prescription,nationalPharmacyV2,patient_name';
    const prescriptionTypes = this.prescriptionTypeFilter?.controls['status']?.value || [];
    filter.has_prescription = prescriptionTypes.length === 1 ? prescriptionTypes[0] : null;
    filter.patient_name = this.patientNameSearchForm?.value || '';
    filter.date_from = objDateFilter.date_from;
    filter.date_to = objDateFilter.date_to;
    filter.order_status = this.orderStatusFilter.controls['status'].value.join(',');
    filter.order_national = this.orderNationalFilter.controls['status'].value.join(',');
    filter.einvoice = this.einvoiceFilter.controls['status'].value.join(',');
    filter.expenses = this.expensesFilter.controls['status'].value.join(',');
    filter.payment_method = this.paymentMethodFilter.controls['status'].value.join(',');

    const product = this.productFilter.controls['product']?.value;
    filter.product_id = product?.id;

    const customer = this.customerFilter.controls['customer']?.value;
    filter.customer_id = customer?.id;

    return filter;
  }

  /**
   * Đọc lại một bộ lọc nhiều lựa chọn từ URL.
   *
   * buildFilterFromParams() lấy giá trị các nhóm checkbox từ chính form chứ không
   * từ URL, nên nếu form luôn dựng bằng giá trị mặc định thì mọi lựa chọn của người
   * dùng biến mất khi quay lại màn hình. Hàm này lấy lại từ URL nếu có.
   *
   * Lưu ý: toFilterString() bỏ qua giá trị rỗng, nên trường hợp người dùng bỏ chọn
   * hết thì tham số không xuất hiện trên URL và ta trả về mặc định.
   */
  private locNhieuLuaChonTuUrl(thamSo: string, macDinh: string[]): string[] {
    const giaTri = this.route.snapshot.queryParams['InvoiceSearch[' + thamSo + ']'];
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
   * nên Back khôi phục đúng. replaceUrl để không đẩy thêm một mục lịch sử cho mỗi
   * lần gõ phím / tick chọn.
   */
  private ghiBoLocLenUrl(): void {
    this.router.navigate(['/transaction/invoice'], {
      queryParams: this.thamSoLocChoUrl(),
      replaceUrl: true,
    });
  }

  /** Chuyển chuỗi lọc + hai tham số thời gian thành object cho router.navigate. */
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

    // Không có khoảng ngày = đang mở đúng một chứng từ theo mã, cố ý bỏ giới hạn
    // thời gian. Đánh dấu 'all' để lần dựng lại component còn biết mà giữ nguyên,
    // thay vì áp lại mặc định 3 tháng rồi làm hoá đơn cũ biến mất.
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

  buildFrom() {
    this.timeFilter = this.fb.group({
      typeTime: [
        'default'
      ],
    });
    this.orderStatusFilter = this.fb.group({
      status: [
        this.locNhieuLuaChonTuUrl('order_status', ['pending', 'done'])
      ],
    });
    this.orderNationalFilter = this.fb.group({
      status: [
        this.locNhieuLuaChonTuUrl('order_national', ['yes', 'no'])
      ],
    });
    this.productFilter = this.fb.group({
      product: [null],
    });
    this.customerFilter = this.fb.group({
      customer: [null],
    });
    this.einvoiceFilter = this.fb.group({
      status: new FormControl(this.locNhieuLuaChonTuUrl('einvoice', ['yes', 'no'])),
    });
    this.expensesFilter = this.fb.group({
      status: new FormControl(this.locNhieuLuaChonTuUrl('expenses', ['yes', 'no'])),
    });
    this.paymentMethodFilter = this.fb.group({
      status: new FormControl(this.locNhieuLuaChonTuUrl('payment_method', ['cash', 'bank_transfer'])),
    });
    this.prescriptionTypeFilter = this.fb.group({
      status: [this.route.snapshot.queryParams['InvoiceSearch[has_prescription]']
        ? [this.route.snapshot.queryParams['InvoiceSearch[has_prescription]']]
        : ['1', '0']],
    });
    this.patientNameSearchForm.setValue(this.route.snapshot.queryParams['InvoiceSearch[patient_name]'] || '', {emitEvent: false});
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

  prescriptionTypeFilterChange(value: string): void {
    this.handleFilterCheckbox(this.prescriptionTypeFilter, 'status', value);
    this.apiFilter = this.buildFilterFromParams();
    this.apiFilter.page = 1;
    this.loadData();
  }
  initDateFilter() {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    const first = new Date(year, month, 1);
    const obj = new DateFilter();
    // tháng này

    const macDinhTu = moment().subtract(3, 'months').format("YYYY-MM-DD");
    const macDinhDen = moment().format("YYYY-MM-DD");

    // Ưu tiên khoảng thời gian đang có sẵn trên URL (loadData() đã ghi ra bằng
    // location.go). Trước đây hàm này luôn ghi đè về "3 tháng gần nhất", nên lọc
    // xong bấm vào một hoá đơn rồi quay lại là mất khoảng thời gian đã chọn.
    const tuUrl = this.route.snapshot.queryParams['InvoiceSearch[date_from]'];
    const denUrl = this.route.snapshot.queryParams['InvoiceSearch[date_to]'];
    const loaiThoiGian = this.route.snapshot.queryParams['timeType'];

    if (loaiThoiGian === 'all') {
      // Đang mở đúng một chứng từ theo mã (bấm từ Thẻ kho): cố ý KHÔNG giới hạn
      // thời gian, nếu không thì hoá đơn cũ hơn 3 tháng sẽ không hiện ra.
      //
      // Phải đánh dấu tường minh trên URL vì ghiBoLocLenUrl() điều hướng từ
      // 'invoice/:code' sang 'invoice', Angular huỷ rồi dựng lại component, làm mất
      // đoạn xoá ràng buộc ngày mà loadData() vừa thực hiện.
      obj.date_from = '';
      obj.date_to = '';
    } else if (tuUrl && denUrl) {
      obj.date_from = tuUrl;
      obj.date_to = denUrl;
      // Trùng khoảng mặc định thì vẫn coi là "3 tháng trước" để radio hiển thị đúng ô đã bấm.
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

    // Ghi URL NGAY lúc phát request, không đợi response.
    // Trước đây ghi trong callback: nhiều lần loadData() chồng nhau (đổi bộ lọc,
    // subscribeDateFilter, ô tìm kiếm debounce...) thì response nào về sau cùng sẽ
    // ghi đè URL - kể cả response của bộ lọc CŨ. Đó là lý do filter lúc giữ được
    // lúc không, và thỉnh thoảng quay lại thấy khoảng thời gian của lần lọc trước.
    this.ghiBoLocLenUrl();

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
    // initDateFilter() chạy trước buildFrom() nên không tự đặt được radio;
    // đặt ở đây để ô "tự chọn" sáng đúng khi khoảng thời gian lấy lại từ URL.
    if (this.khoiPhucThoiGianTuUrl) {
      this.timeFilter.patchValue({ typeTime: 'choose' });
    }
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

    this.patientNameSearchForm.valueChanges.pipe(debounceTime(800)).subscribe(() => {
      this.apiFilter = this.buildFilterFromParams();
      this.apiFilter.page = 1;
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
    this.apiFilter.page = 1;
    this.loadData();
  }

  openPrescriptionDetails(element: Invoice): void {
    if (!element?.prescription_id) {
      this.notifySer.notify('info', 'Hóa đơn này không có đơn thuốc.');
      return;
    }

    this.dialog.open(PrescriptionDetailsDialogComponent, {
      width: '760px',
      maxWidth: '95vw',
      autoFocus: false,
      data: {
        invoiceId: element.id,
        prescriptionId: element.prescription_id,
        patientName: element.patient_name || element.prescription?.name,
      },
    });
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
