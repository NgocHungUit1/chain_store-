import { Component, HostListener, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { NotifierService } from 'angular-notifier';
import { Observable, of } from 'rxjs';
import { catchError, debounceTime, map, startWith, switchMap } from 'rxjs/operators';
import * as moment from 'moment';

import { AuthService } from '../../authentication/auth.service';
import { ProductService } from '../../product/product.service';
import { UserService } from '../../user/user.service';
import { Product } from '../../product/product.model';
import { SearchProductDialogComponent } from '../../common/search-product-dialog/search-product-dialog.component';
import { PopupConfirmDialogComponent } from '../../common/popup-confirm-dialog/popup-confirm-dialog.component';

import { OpeningBalanceService } from '../opening-balance.service';
import { OpeningBalanceItem, OPENING_BALANCE_STATUS } from '../opening-balance.model';
import { OpeningBalanceUploadDialogComponent } from '../opening-balance-upload-dialog/opening-balance-upload-dialog.component';

/** Một lỗi/cảnh báo hiển thị trên màn hình, gắn mã theo bảng kiểm tra trong PRD. */
interface ValidationMessage {
  code: string;
  level: 'error' | 'warning';
  message: string;
}

@Component({
  selector: 'app-opening-balance-form',
  templateUrl: './opening-balance-form.component.html',
  styleUrls: ['./opening-balance-form.component.css'],
})
export class OpeningBalanceFormComponent implements OnInit {

  constructor(
    private service: OpeningBalanceService,
    private productSer: ProductService,
    private userSer: UserService,
    private route: ActivatedRoute,
    private router: Router,
    private dialog: MatDialog,
    private fb: FormBuilder,
    private notifySer: NotifierService,
    public authSer: AuthService,
  ) {
  }

  @ViewChild('productInput') productInput;

  form: FormGroup;
  selectProduct = new FormControl();
  filteredProducts: Observable<Product[]>;

  updateModelId: string = null;
  isSaving = false;
  isLoading = false;
  /** Phiếu đã hoàn thành thì chỉ xem, muốn sửa phải dùng Kiểm kho. */
  readonly = false;

  branchList: any[] = [];

  data: OpeningBalanceItem[] = [];
  dataSource = new MatTableDataSource<OpeningBalanceItem>([]);

  displayedColumns: string[] = [
    '#', 'product_no', 'product_name', 'unit', 'parcel_no', 'expiration_date',
    'quantity', 'price', 'amount', 'placement', 'actions',
  ];

  messages: ValidationMessage[] = [];
  /** Cảnh báo từ API check-closing-date (đã có giao dịch sau ngày chốt). */
  closingDateWarning: string = null;

  /** Chặn chọn ngày chốt ở tương lai ngay trên datepicker (V12). */
  today = new Date();

  /**
   * Giữ đúng phím tắt của màn Nhập hàng để nhân viên triển khai không phải học lại.
   */
  @HostListener('document:keydown', ['$event'])
  onKeydown(event: KeyboardEvent) {
    if (this.readonly) {
      return;
    }

    if (event.key === 'F3') {
      event.preventDefault();
      if (this.productInput) {
        this.productInput.nativeElement.focus();
      }
    }

    if (event.key === 'F9') {
      event.preventDefault();
      this.saveDraft();
    }

    if (event.key === 'F10') {
      event.preventDefault();
      this.confirmComplete();
    }
  }

  ngOnInit(): void {
    this.form = this.fb.group({
      branch_id: [null, Validators.required],
      date: [new Date(), Validators.required],
      no: [null],
      note: [null],
    });

    this.filteredProducts = this.selectProduct.valueChanges.pipe(
      startWith(''),
      debounceTime(300),
      switchMap(value => (value && typeof value === 'string') ? this.lookupProduct(value) : of([])),
    );

    this.userSer.getStoreBranchList().subscribe(res => {
      this.branchList = (res.body as any) || [];
    });

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.updateModelId = id;
      this.loadDetail();
    } else {
      this.userSer.getBranchLogin().subscribe(branchId => {
        this.form.patchValue({branch_id: Number(branchId)});
        this.refreshClosingDateWarning();
      });
      this.service.getRenderNo().subscribe(res => this.form.patchValue({no: res.no}));
    }

    this.form.controls['date'].valueChanges.subscribe(() => {
      this.refreshClosingDateWarning();
      this.validate();
    });
    this.form.controls['branch_id'].valueChanges.subscribe(() => this.refreshClosingDateWarning());
  }

  // ------------------------------------------------------------ Nạp dữ liệu

  loadDetail() {
    this.isLoading = true;
    const expand = 'warehouseProducts.product,warehouseProducts.productUnits,warehouseProducts.productParcels';

    this.service.getDetail(this.updateModelId, expand).subscribe(res => {
      this.readonly = Number(res['status']) === OPENING_BALANCE_STATUS.DONE;

      this.form.patchValue({
        branch_id: res['branch_id'],
        date: res['date'] ? new Date(res['date']) : new Date(),
        no: res['no'],
        note: res['note'],
      });

      this.data = (res['warehouseProducts'] || []).map(wp => this.itemFromWarehouseProduct(wp));
      this.refreshTable();

      if (this.readonly) {
        this.form.disable();
      }

      this.isLoading = false;
    }, () => {
      this.isLoading = false;
      this.notifySer.notify('error', 'Không tải được phiếu tồn đầu.');
      this.router.navigate(['/store/opening-balance']);
    });
  }

  itemFromWarehouseProduct(wp): OpeningBalanceItem {
    const item = new OpeningBalanceItem();
    const product = wp.product || {};
    const parcel = (wp.productParcels || [])[0] || {};
    const units = wp.productUnits || [];
    const unit = units.find(u => Number(u.id) === Number(wp.product_unit_id));

    item.id = wp.id;
    item.product_id = wp.product_id;
    item.product_no = product.product_no;
    item.product_name = product.product_name;
    item.product_unit_id = wp.product_unit_id;
    item.unit_name = unit ? unit.name : '';
    item.unit_value = unit ? Number(unit.value) || 1 : 1;
    item.productUnits = units;
    item.require_parcel = product.product_type === 'medicine' || !!product.batch_tracking_enabled;
    item.parcel_no = parcel.parcel_no || null;
    item.expiration_date = parcel.expiration_date || null;
    item.quantity = Number(wp.quantity) || 0;
    item.price = Number(wp.price) || 0;
    item.amount = Number(wp.amount) || 0;
    item.sell_price = wp.sell_price || null;
    item.note = wp.note || null;

    return item;
  }

  lookupProduct(value: string): Observable<Product[]> {
    return this.productSer.autocomplete(value).pipe(
      map(results => results),
      catchError(() => of([])),
    );
  }

  // --------------------------------------------------------- Thêm hàng hoá

  onSelectedProduct(product) {
    this.addProduct(product.id);
    this.selectProduct.patchValue('');
  }

  openSearchProductDialog() {
    const dialogRef = this.dialog.open(SearchProductDialogComponent, {
      width: '80%',
      minWidth: '750px',
      minHeight: '85%',
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && result['event'] === 'Choose') {
        if (result['product_id']) {
          this.addProduct(result['product_id']);
        }
        (result['product_ids'] || []).forEach(id => this.addProduct(id));
      }
    });
  }

  addProduct(productId) {
    this.productSer.getDetail(String(productId), 'productUnits').subscribe(res => {
      const units = (res['productUnits'] || []).slice().sort((a, b) => Number(a.value) - Number(b.value));

      if (units.length === 0) {
        this.notifySer.notify('error', 'Sản phẩm "' + res['product_name'] + '" chưa khai báo đơn vị tính.');
        return;
      }

      const item = new OpeningBalanceItem();
      const baseUnit = units.find(u => Number(u.is_base) === 1) || units[0];

      item.product_id = res['id'];
      item.product_no = res['product_no'];
      item.product_name = res['product_name'];
      item.productUnits = units;
      item.product_unit_id = baseUnit.id;
      item.unit_name = baseUnit.name;
      item.unit_value = Number(baseUnit.value) || 1;
      item.require_parcel = res['product_type'] === 'medicine' || !!res['batch_tracking_enabled'];
      item.quantity = 1;
      item.price = Number(res['original_price']) || 0;
      item.sell_price = Number(res['sell_price']) || null;
      item.amount = item.quantity * item.price;

      this.data = this.data.concat([item]);
      this.refreshTable();
    });
  }

  removeItem(index: number) {
    this.data.splice(index, 1);
    this.data = this.data.slice();
    this.refreshTable();
  }

  onUnitChange(item: OpeningBalanceItem) {
    const unit = item.productUnits.find(u => Number(u.id) === Number(item.product_unit_id));
    if (unit) {
      item.unit_name = unit.name;
      item.unit_value = Number(unit.value) || 1;
    }
    this.validate();
  }

  onRowChange(item: OpeningBalanceItem) {
    item.quantity = Number(item.quantity) || 0;
    item.price = Number(item.price) || 0;
    item.amount = item.quantity * item.price;
    this.validate();
  }

  refreshTable() {
    this.dataSource = new MatTableDataSource<OpeningBalanceItem>(this.data);
    this.validate();
  }

  // ------------------------------------------------------------- Import Excel

  openUploadDialog() {
    if (!this.form.controls['branch_id'].value) {
      this.notifySer.notify('error', 'Vui lòng chọn chi nhánh trước khi nạp file.');
      return;
    }

    const dialogRef = this.dialog.open(OpeningBalanceUploadDialogComponent, {
      data: {
        branch_id: this.form.controls['branch_id'].value,
        closing_date: this.closingDateString(),
      },
      width: '75%',
      minWidth: '900px',
      maxHeight: '90vh',
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && result.items && result.items.length) {
        result.items.forEach(row => this.data.push(this.itemFromImport(row)));
        this.data = this.data.slice();
        this.refreshTable();
        this.notifySer.notify('success', 'Đã nạp ' + result.items.length + ' dòng vào phiếu.');
      }
    });
  }

  itemFromImport(row): OpeningBalanceItem {
    const item = new OpeningBalanceItem();

    item.product_id = row.product_id;
    item.product_no = row.product_no;
    item.product_name = row.product_name;
    item.product_unit_id = row.product_unit_id;
    item.unit_name = row.unit_name;
    item.unit_value = Number(row.unit_value) || 1;
    item.quantity = Number(row.quantity) || 0;
    item.price = Number(row.price) || 0;
    item.amount = Number(row.amount) || item.quantity * item.price;
    item.sell_price = row.sell_price || null;
    item.note = row.note || null;

    const parcel = (row.product_parcels || [])[0];
    if (parcel) {
      item.parcel_no = parcel.parcel_no;
      item.expiration_date = parcel.expiration_date;
      item.require_parcel = true;
    }

    // Danh sách đơn vị không có trong kết quả import; nạp bổ sung để dropdown đổi
    // đơn vị vẫn dùng được sau khi nạp.
    this.productSer.getDetail(String(item.product_id), 'productUnits').subscribe(res => {
      item.productUnits = (res['productUnits'] || []).slice().sort((a, b) => Number(a.value) - Number(b.value));
      if (!item.require_parcel) {
        item.require_parcel = res['product_type'] === 'medicine' || !!res['batch_tracking_enabled'];
        this.validate();
      }
    });

    return item;
  }

  // -------------------------------------------------------------- Tổng hợp

  get totalProducts(): number {
    return this.data.length;
  }

  get totalQuantity(): number {
    return this.data.reduce((sum, item) => sum + (Number(item.quantity) || 0) * (Number(item.unit_value) || 1), 0);
  }

  get totalAmount(): number {
    return this.data.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  }

  get errors(): ValidationMessage[] {
    return this.messages.filter(m => m.level === 'error');
  }

  get warnings(): ValidationMessage[] {
    return this.messages.filter(m => m.level === 'warning');
  }

  closingDateString(): string {
    const value = this.form.controls['date'].value;
    return value ? moment(value).format('YYYY-MM-DD') : null;
  }

  refreshClosingDateWarning() {
    const branchId = this.form.controls['branch_id'].value;
    const date = this.closingDateString();

    if (!branchId || !date) {
      this.closingDateWarning = null;
      return;
    }

    this.service.checkClosingDate(branchId, date).subscribe(res => {
      this.closingDateWarning = res && res.message ? res.message : null;
    }, () => this.closingDateWarning = null);
  }

  // ------------------------------------------------------------- Kiểm tra

  /**
   * Kiểm tra phía client theo đúng bảng quy tắc của backend, để người dùng thấy
   * lỗi ngay trên lưới thay vì đợi API trả về từng lỗi một.
   */
  validate() {
    const messages: ValidationMessage[] = [];
    const closingDate = this.closingDateString();
    const nearExpiry = closingDate ? moment(closingDate).add(90, 'days').format('YYYY-MM-DD') : null;
    const seen = {};

    this.data.forEach(item => item.warnings = []);

    if (this.data.length === 0) {
      messages.push({code: 'V01', level: 'error', message: 'Vui lòng thêm ít nhất một mặt hàng.'});
    }

    if (closingDate && closingDate > moment().format('YYYY-MM-DD')) {
      messages.push({code: 'V12', level: 'error', message: 'Ngày chốt tồn đầu không được lớn hơn ngày hiện tại.'});
    }

    this.data.forEach((item, index) => {
      const line = index + 1;
      const name = item.product_name || item.product_no;

      if (!item.product_unit_id) {
        messages.push({code: 'V11', level: 'error', message: 'Dòng ' + line + ' («' + name + '»): chưa chọn đơn vị tính.'});
      }

      if (!item.quantity || Number(item.quantity) <= 0) {
        messages.push({code: 'V03', level: 'error', message: 'Dòng ' + line + ' («' + name + '»): số lượng phải lớn hơn 0.'});
      }

      if (Number(item.price) < 0) {
        messages.push({code: 'V04', level: 'error', message: 'Dòng ' + line + ' («' + name + '»): đơn giá vốn không được âm.'});
      } else if (Number(item.price) === 0) {
        messages.push({code: 'V05', level: 'warning', message: 'Dòng ' + line + ': đơn giá vốn bằng 0, giá vốn sản phẩm sẽ bị ảnh hưởng.'});
        item.warnings.push('V05');
      }

      if (item.require_parcel && (!item.parcel_no || !item.expiration_date)) {
        messages.push({code: 'V06', level: 'error', message: 'Dòng ' + line + ': «' + name + '» quản lý theo lô, cần nhập số lô và hạn dùng.'});
      }

      if (item.expiration_date && closingDate) {
        if (item.expiration_date <= closingDate) {
          messages.push({
            code: 'V08', level: 'warning',
            message: 'Dòng ' + line + ': lô «' + item.parcel_no + '» đã hết hạn tại ngày chốt.',
          });
          item.warnings.push('V08');
        } else if (item.expiration_date <= nearExpiry) {
          messages.push({
            code: 'V09', level: 'warning',
            message: 'Dòng ' + line + ': lô «' + item.parcel_no + '» sẽ hết hạn trong vòng 3 tháng.',
          });
          item.warnings.push('V09');
        }
      }

      const key = [item.product_id, item.product_unit_id, item.parcel_no || '', item.expiration_date || ''].join('|');
      if (seen[key]) {
        messages.push({
          code: 'V10', level: 'error',
          message: 'Dòng ' + line + ' trùng với dòng ' + seen[key] + ' (cùng sản phẩm, đơn vị, lô và hạn dùng).',
        });
      } else {
        seen[key] = line;
      }
    });

    this.messages = messages;
  }

  canComplete(): boolean {
    return this.authSer.getPermissionsFromLocalStorage().indexOf('Opening-Balance.Complete') !== -1;
  }

  // ---------------------------------------------------------------- Lưu

  saveDraft() {
    this.save(OPENING_BALANCE_STATUS.DRAFT);
  }

  confirmComplete() {
    this.validate();
    if (this.errors.length > 0) {
      this.notifySer.notify('error', 'Còn ' + this.errors.length + ' lỗi cần sửa trước khi hoàn thành phiếu.');
      return;
    }

    let content = 'Hoàn thành phiếu sẽ <b>ghi tăng tồn kho</b> theo từng lô và cập nhật giá vốn. '
      + 'Phiếu đã hoàn thành không sửa được nữa.';
    if (this.closingDateWarning) {
      content += '<br><br><b>Lưu ý:</b> ' + this.closingDateWarning;
    }
    content += '<br><br>Bạn có chắc chắn muốn hoàn thành phiếu?';

    const dialogRef = this.dialog.open(PopupConfirmDialogComponent, {
      data: {action: 'Complete', title: 'Hoàn thành phiếu tồn đầu', content: content},
      width: '45%',
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && result.event === 'confirm') {
        this.save(OPENING_BALANCE_STATUS.DONE);
      }
    });
  }

  save(status: number) {
    this.validate();

    if (this.errors.length > 0) {
      this.notifySer.notify('error', this.errors[0].message);
      return;
    }

    if (!this.form.controls['branch_id'].value) {
      this.notifySer.notify('error', 'Vui lòng chọn chi nhánh.');
      return;
    }

    const payload = {
      branch_id: this.form.controls['branch_id'].value,
      date: this.closingDateString() + ' 00:00:00',
      no: this.form.controls['no'].value,
      note: this.form.controls['note'].value,
      status: status,
      total_price: this.totalAmount,
      total_amount: this.totalAmount,
      items: this.data.map(item => this.itemPayload(item)),
    };

    this.isSaving = true;

    const request = this.updateModelId
      ? this.service.update(this.updateModelId, payload)
      : this.service.create(payload);

    request.subscribe(res => {
      this.isSaving = false;

      if (res && res.success === false) {
        this.notifySer.notify('error', res.message || 'Lưu không thành công.');
        return;
      }

      this.notifySer.notify('success', res && res.message ? res.message : 'Lưu thành công.');

      if (status === OPENING_BALANCE_STATUS.DONE) {
        this.router.navigate(['/store/opening-balance']);
      } else {
        const id = res && res.data ? res.data.id : this.updateModelId;
        this.router.navigate(['/store/opening-balance/update/' + id]);
      }
    }, error => {
      this.isSaving = false;
      const message = error && error.error && error.error.message
        ? error.error.message
        : 'Lưu không thành công.';
      this.notifySer.notify('error', message);
    });
  }

  itemPayload(item: OpeningBalanceItem) {
    const payload: any = {
      product_id: item.product_id,
      product_unit_id: item.product_unit_id,
      quantity: Number(item.quantity) || 0,
      price: Number(item.price) || 0,
      discount: 0,
      discount_type: 'price',
      amount: Number(item.amount) || 0,
      sell_price: item.sell_price,
      note: item.note,
      product_parcels: [],
    };

    // Giữ id khi sửa phiếu lưu tạm, nếu không backend sẽ xoá dòng cũ rồi tạo lại.
    if (item.id) {
      payload.id = item.id;
    }

    if (item.parcel_no && item.expiration_date) {
      payload.product_parcels.push({
        parcel_no: item.parcel_no,
        expiration_date: item.expiration_date,
        quantity: Number(item.quantity) || 0,
        unit_cost: Number(item.price) || 0,
      });
    }

    return payload;
  }

  back() {
    this.router.navigate(['/store/opening-balance']);
  }
}
