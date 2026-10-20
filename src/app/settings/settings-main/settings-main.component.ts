import { Component, OnInit } from '@angular/core';
import {FormArray, FormBuilder, FormGroup, Validators} from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { NotifierService } from 'angular-notifier';
import { OptionStoreService } from '../../common/option-store.service';
import { OptionStore } from '../../common/option-store.model';
import {StoreService} from '../../store/store.service';
import {BranchService} from '../../branch/branch.service';
import {ActivatedRoute, Route} from '@angular/router';
import {Location} from '@angular/common';
import {BaseComponent} from '../../shared/base';
import {AuthService} from '../../authentication/auth.service';
import {ConfirmationDialogComponent} from '../../shared/confirmation-dialog/confirmation-dialog.component';

class ImageSnippet {
  constructor(public src: string, public file: File, public id: string) {
  }
}

@Component({
  selector: 'app-settings-main',
  templateUrl: './settings-main.component.html',
  styleUrls: ['./settings-main.component.css']
})
export class SettingsMainComponent extends BaseComponent implements OnInit {

  constructor(
    private dialog: MatDialog,
    private notifySer: NotifierService,
    private fb: FormBuilder,
    public storeSer: StoreService,
    public branchSer: BranchService,
    public route: ActivatedRoute,
    public authSer: AuthService,
    private location: Location,
    public optionStoreService: OptionStoreService
  ) {
    super(authSer);
  }

  settingsType: string;

  printType: string;

  settingsTypeName = {
    'transaction': 'Giao dịch',
    'store': 'Hàng hóa',
    'partner': 'Đối tác',
    'print': 'Cài đặt khổ mẫu giấy in',
    'edit-print': 'Chỉnh sửa mẫu in',
    'logo': 'Logo cửa hàng',
    'branch-connect': 'Liên thông theo chi nhánh',
    'store-connect': 'Liên thông cửa hàng',
    'score': 'Tích điểm',
    'einvoice': 'Hóa đơn điện tử'
  };

  isLoadingResults = true;
  isRateLimitReached = false;
  public connectForm: FormGroup;
  /** Ẩn/hiện mật khẩu CSDL Dược quốc gia của chi nhánh */
  hideBranchConnectPassword = true;
  public storeConnectForm: FormGroup;
  /** Ẩn/hiện mật khẩu CSDL Dược quốc gia của cửa hàng */
  hideStoreConnectPassword = true;
  public storeForm: FormGroup;
  public commForm: FormGroup;
  public pointSettingsForm: FormGroup;
  public einvoiceForm: FormGroup;

  optionStore_transaction_expenses_order: OptionStore;
  optionStore_transaction_expenses_transaction: OptionStore;
  optionStore_sale_negative_stock: OptionStore;
  optionStore_lot_selection_order: OptionStore;
  optionStore_allow_past_expiration: OptionStore;
  allowPastExpiration = false;
  optionStore_batch_tracking_self_manage: OptionStore;
  batchTrackingSelfManage = false;
  lotSelectionOrder = 'fefo'; // 'fefo' (mặc định) | 'fifo'
  optionStore_expiry_alert_days: OptionStore;
  expiryAlertDays = '30,60,90'; // các mốc cảnh báo hạn dùng tự động, ngày
  optionStore_print_type: OptionStore; // print_type
  point_enabled: OptionStore;
  point_cash_to_point_rate: OptionStore;
  point_point_to_cash_rate: OptionStore;
  point_can_pay_by_point_after_invoices: OptionStore;
  point_dont_add_point_for_discount_invoice: OptionStore;
  point_dont_add_point_for_invoice_paid_by_point: OptionStore;

  optionStore_comm_percent_product: OptionStore;
  optionStore_comm_percent_invoice: OptionStore;

  needToSaveLogo = false;
  selectedFiles: ImageSnippet[] = [];
  imageButtons = [
    {isShow: true}
  ];
  storeFeatures = [];

  ngOnInit(): void {
    this.settingsType = 'transaction';
    this.printType = 'K58';
    this.isLoadingResults = false;

    const tab = this.route.snapshot.paramMap.get('tab');
    if (tab !== null) {
      this.settingsType = tab;
    }

    this.connectForm = this.fb.group({
      // Mã cơ sở dùng CHUNG cho cả liên thông cũ lẫn mới, nay nằm ở khung liên thông mới và
      // mở theo nút gạt mới (onConnectV2Change). Disabled thì Angular không kiểm required.
      national_pharmacy_registration_no: [{value: null, disabled: true}, Validators.compose([Validators.required])],
      // Hai ô tài khoản/mật khẩu HỆ THỐNG CŨ: giao diện đã ẩn nên không bắt buộc nữa. Để required
      // thì chi nhánh từng bật "dùng tài khoản riêng" mà thiếu một ô sẽ không lưu được tài khoản
      // liên thông MỚI (cùng một form), và người dùng không thấy lý do vì phần cũ đã bị ẩn.
      // Giá trị cũ vẫn được giữ: saveConnect() gửi getRawValue().
      national_pharmacy_login_username: [{value: null, disabled: true}],
      national_pharmacy_login_password: [{value: null, disabled: true}],
      use_branch_national_connect: [false, Validators.compose([Validators.required])],
      // Liên thông CSDL Dược quốc gia dùng tài khoản do TTYQG cấp riêng, không dùng
      // chung với tài khoản liên thông cũ ở trên.
      national_pharmacy_v2_login_username: [{value: null, disabled: true}],
      national_pharmacy_v2_login_password: [{value: null, disabled: true}],
      use_branch_national_v2_connect: [false]
    });

    // Tài khoản CSDL Dược quốc gia (hệ thống mới) của cửa hàng, dùng chung cho mọi chi
    // nhánh không bật tài khoản riêng. Liên thông hệ thống cũ đã đóng và đã ẩn khỏi giao diện.
    this.storeConnectForm = this.fb.group({
      national_pharmacy_v2_login_username: [null],
      national_pharmacy_v2_login_password: [null],
    });

    this.storeForm = this.fb.group({
      description: [''],
      can_change_completed: [false],
      require_payment_before_print: [false],
    });

    this.commForm = this.fb.group({
      comm_percent_product: [0],
      comm_percent_invoice: [0],
    });

    this.pointSettingsForm = this.fb.group({
      point_enabled: [false],
      point_cash_to_point_rate: [{value: null}, Validators.compose([Validators.min(1)])],
      point_point_to_cash_rate: [{value: null}, Validators.compose([Validators.min(1)])],
      point_can_pay_by_point_after_invoices: [{value: null}, Validators.compose([Validators.min(0)])],
      point_dont_add_point_for_discount_invoice: [false],
      point_dont_add_point_for_invoice_paid_by_point: [false],
    });

    this.einvoiceForm = this.fb.group({
      einvoice_enabled: [false],
      einvoice_partner_guid: ['', Validators.required],
      einvoice_partner_token: ['', Validators.required],
      einvoice_api_url: ['', Validators.required],
      einvoice_invoice_serial: ['', Validators.required],
      einvoice_invoice_type: ['', Validators.required]
    });

    if (this.canDo('Branch.Get-Connect')) {
      this.branchSer.getConnect().subscribe(res => {
        this.connectForm.patchValue(res);
        this.onConnectChange();
        this.onConnectV2Change();
      });
    }

    if (this.canDo('Store.Get-Detail')) {
      this.storeSer.getDetail().subscribe(res => {
        if (res['logo'] !== null && res['logo'].length > 0) {
          this.selectedFiles.push(new ImageSnippet(res['logo'], null, ''));
          this.imageButtons[0]['isShow'] = false;
        }

        this.storeForm.patchValue({
          description: res['description'],
          can_change_completed: res['can_change_completed'],
          require_payment_before_print: !!res['require_payment_before_print'],
        });

        this.storeConnectForm.patchValue({
          national_pharmacy_v2_login_username: res['national_pharmacy_v2_login_username'],
          national_pharmacy_v2_login_password: res['national_pharmacy_v2_login_password'],
        });

        this.storeFeatures = res['features'];
      });
    }

    this.optionStoreService.getValue('sale_negative_stock').subscribe(res => {
      this.optionStore_sale_negative_stock = res;
    });

    this.optionStoreService.getValue('lot_selection_order').subscribe(res => {
      this.optionStore_lot_selection_order = res;
      this.lotSelectionOrder = (res && res.value === 'fifo') ? 'fifo' : 'fefo';
    });

    this.optionStoreService.getValue('expiry_alert_days').subscribe(res => {
      this.optionStore_expiry_alert_days = res;
      this.expiryAlertDays = res?.value || '30,60,90';
    });

    this.optionStoreService.getValue('allow_past_expiration').subscribe(res => {
      this.optionStore_allow_past_expiration = res;
      this.allowPastExpiration = res && res.value === 'yes';
    });

    this.optionStoreService.getValue('batch_tracking_self_manage').subscribe(res => {
      this.optionStore_batch_tracking_self_manage = res;
      this.batchTrackingSelfManage = res && res.value === 'yes';
    });

    this.optionStoreService.getValue('transaction_expenses_order').subscribe(res => {
      this.optionStore_transaction_expenses_order = res;
    });

    this.optionStoreService.getValue('transaction_expenses_transaction').subscribe(res => {
      this.optionStore_transaction_expenses_transaction = res;
    });

    this.optionStoreService.getValue('print_type').subscribe(res => {
      this.optionStore_print_type = res;
      this.printType = this.optionStore_print_type.value;
    });

    this.optionStoreService.getValue('point_enabled').subscribe(res => {
      this.point_enabled = res;
      this.pointSettingsForm.patchValue({ point_enabled: res.value === 'true' });
    });

    this.optionStoreService.getValue('point_cash_to_point_rate').subscribe(res => {
      this.point_cash_to_point_rate = res;
      this.pointSettingsForm.patchValue({ point_cash_to_point_rate: res.value });
    });

    this.optionStoreService.getValue('point_point_to_cash_rate').subscribe(res => {
      this.point_point_to_cash_rate = res;
      this.pointSettingsForm.patchValue({ point_point_to_cash_rate: res.value });
    });

    this.optionStoreService.getValue('point_can_pay_by_point_after_invoices').subscribe(res => {
      this.point_can_pay_by_point_after_invoices = res;
      this.pointSettingsForm.patchValue({ point_can_pay_by_point_after_invoices: res.value });
    });

    this.optionStoreService.getValue('point_dont_add_point_for_discount_invoice').subscribe(res => {
      this.point_dont_add_point_for_discount_invoice = res;
      this.pointSettingsForm.patchValue({ point_dont_add_point_for_discount_invoice: res.value === 'true' });
    });

    this.optionStoreService.getValue('point_dont_add_point_for_invoice_paid_by_point').subscribe(res => {
      this.point_dont_add_point_for_invoice_paid_by_point = res;
      this.pointSettingsForm.patchValue({ point_dont_add_point_for_invoice_paid_by_point: res.value === 'true' });
    });

    this.optionStoreService.getValue('comm_percent_product').subscribe(res => {
      this.optionStore_comm_percent_product = res;
      this.commForm.patchValue({ comm_percent_product: res.value });
    });

    this.optionStoreService.getValue('comm_percent_invoice').subscribe(res => {
      this.optionStore_comm_percent_invoice = res;
      this.commForm.patchValue({ comm_percent_invoice: res.value });
    });

    this.loadEinvoiceSettings();
  }

  onConnectChange() {
    // Mã cơ sở KHÔNG còn gắn với nút gạt hệ thống cũ — xem onConnectV2Change().
    if (this.connectForm.controls['use_branch_national_connect'].value) {
      this.connectForm.controls['national_pharmacy_login_username'].enable();
      this.connectForm.controls['national_pharmacy_login_password'].enable();
    } else {
      this.connectForm.controls['national_pharmacy_login_username'].disable();
      this.connectForm.controls['national_pharmacy_login_password'].disable();
    }
  }

  /**
   * Tài khoản CSDL Dược quốc gia của chi nhánh, bật/tắt độc lập với tài khoản
   * liên thông cũ: một cơ sở có thể dùng tài khoản riêng cho hệ này nhưng vẫn dùng
   * tài khoản cửa hàng cho hệ kia.
   */
  /** Đang gọi API kiểm tra kết nối */
  testingConnectionV2 = false;

  /** Kết quả kiểm tra gần nhất, hiển thị ngay dưới nút */
  testConnectionV2Result: { success: boolean; message: string } = null;

  /**
   * Kiểm tra tài khoản CSDL Dược quốc gia có đăng nhập được không.
   *
   * Kiểm tra giá trị đang nhập trên form (chưa cần bấm Lưu) để người dùng phát hiện
   * sai tài khoản ngay, thay vì tới lúc đẩy phiếu mới biết.
   */
  testConnectionV2() {
    if (this.testingConnectionV2) {
      return;
    }

    const username = this.connectForm.getRawValue()['national_pharmacy_v2_login_username'];
    const password = this.connectForm.getRawValue()['national_pharmacy_v2_login_password'];

    this.testingConnectionV2 = true;
    this.testConnectionV2Result = null;

    this.branchSer.testConnectionV2(username, password).subscribe(res => {
      this.testingConnectionV2 = false;
      this.testConnectionV2Result = res;
      this.notifySer.notify(res.success ? 'success' : 'error', res.message);
    }, error => {
      this.testingConnectionV2 = false;
      const message = error?.error?.message || 'Không gọi được API kiểm tra kết nối.';
      this.testConnectionV2Result = {success: false, message};
      this.notifySer.notify('error', message);
    });
  }

  /**
   * Mã cơ sở của chi nhánh mở theo nút gạt liên thông MỚI: backend
   * (NationalPharmacyV2Credential) lấy branch.national_pharmacy_registration_no đúng khi
   * use_branch_national_v2_connect bật. Trước đây ô này lại mở theo nút gạt hệ thống cũ,
   * nên chi nhánh chỉ bật liên thông mới thì không nhập được mã cơ sở của mình.
   */
  onConnectV2Change() {
    if (this.connectForm.controls['use_branch_national_v2_connect'].value) {
      this.connectForm.controls['national_pharmacy_registration_no'].enable();
      this.connectForm.controls['national_pharmacy_v2_login_username'].enable();
      this.connectForm.controls['national_pharmacy_v2_login_password'].enable();
    } else {
      this.connectForm.controls['national_pharmacy_registration_no'].disable();
      this.connectForm.controls['national_pharmacy_v2_login_username'].disable();
      this.connectForm.controls['national_pharmacy_v2_login_password'].disable();
    }
  }

  changeSlideToggle(name: string) {

    if (name === 'transaction_expenses_order') {
      this.optionStore_transaction_expenses_order.value = (this.optionStore_transaction_expenses_order.value === 'no') ? 'yes' : 'no';
      this.optionStoreService.update(this.optionStore_transaction_expenses_order.id,
        this.optionStore_transaction_expenses_order).subscribe(res => {
        // console.log(res);
      });
    }
    if (name === 'transaction_expenses_transaction') {
      this.optionStore_transaction_expenses_transaction.value = (this.optionStore_transaction_expenses_transaction.value === 'no') ? 'yes' : 'no';
      this.optionStoreService.update(this.optionStore_transaction_expenses_transaction.id,
        this.optionStore_transaction_expenses_transaction).subscribe(res => {
        // console.log(res);
      });
    }
    if (name === 'sale_negative_stock') {
      this.optionStore_sale_negative_stock.value = (this.optionStore_sale_negative_stock.value === 'no') ? 'yes' : 'no';
      this.optionStoreService.update(this.optionStore_sale_negative_stock.id,
        this.optionStore_sale_negative_stock).subscribe(res => {
        // console.log(res);
      });
    }
  }

  changeLotSelectionOrder() {
    if (!this.optionStore_lot_selection_order) {
      return;
    }
    this.optionStore_lot_selection_order.value = this.lotSelectionOrder;
    this.optionStoreService.update(this.optionStore_lot_selection_order.id, this.optionStore_lot_selection_order).subscribe(res => {
    });
  }

  saveExpiryAlertDays() {
    if (!this.optionStore_expiry_alert_days) {
      return;
    }
    this.optionStore_expiry_alert_days.value = this.expiryAlertDays;
    // Backend chuẩn hoá (1..365 ngày, tăng dần, tối đa 5 mốc) rồi trả lại giá trị đã lưu
    this.optionStoreService.update(this.optionStore_expiry_alert_days.id, this.optionStore_expiry_alert_days).subscribe((res: any) => {
      if (res?.value) {
        this.expiryAlertDays = res.value;
      }
      this.notifySer.notify('success', 'Đã lưu mốc cảnh báo hạn dùng');
    });
  }

  changeAllowPastExpiration() {
    if (!this.optionStore_allow_past_expiration) {
      return;
    }
    this.optionStore_allow_past_expiration.value = this.allowPastExpiration ? 'yes' : 'no';
    this.optionStoreService.update(this.optionStore_allow_past_expiration.id, this.optionStore_allow_past_expiration).subscribe(res => {
    });
  }

  /**
   * Quyền tự bật/tắt quản lý theo lô: bật thì phải xác nhận đã đọc cảnh báo rủi ro,
   * tắt thì lưu thẳng (đưa cửa hàng về trạng thái an toàn, không cần hỏi).
   */
  changeBatchTrackingSelfManage() {
    if (!this.optionStore_batch_tracking_self_manage) {
      return;
    }

    if (!this.batchTrackingSelfManage) {
      this.saveBatchTrackingSelfManage();
      return;
    }

    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '560px',
      disableClose: true,
      data: {
        title: 'Xác nhận bật quyền tự bật/tắt quản lý theo lô',
        message: 'Khi bật, nhân viên cửa hàng có thể tự tắt quản lý theo lô cho sản phẩm đã có tồn kho.\n\n'
          + '• Sản phẩm bị tắt lô sẽ không còn ghi số lô và hạn dùng khi nhập và khi bán → không truy xuất được lô '
          + 'khi có sự cố về thuốc, không cảnh báo được hàng cận date.\n'
          + '• Rủi ro pháp lý: dữ liệu phát sinh trong thời gian tắt lô không đáp ứng yêu cầu truy xuất nguồn gốc theo lô.\n'
          + '• Báo cáo tồn kho theo lô và hạn dùng của sản phẩm đó sẽ không còn chính xác.\n'
          + '• Khi bật lô trở lại, phần tồn chưa có lô được gom vào một lô "tồn cũ" (hạn 31/12/2028); '
          + 'số lô và hạn dùng thật của phần tồn đó không khôi phục được.\n\n'
          + 'Cửa hàng xác nhận đã đọc, hiểu và tự chịu trách nhiệm về các rủi ro trên?',
        confirmButtonText: 'Tôi đã hiểu, bật quyền',
        cancelButtonText: 'Bỏ qua'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === true) {
        this.saveBatchTrackingSelfManage();
      } else {
        this.batchTrackingSelfManage = false;
      }
    });
  }

  private saveBatchTrackingSelfManage() {
    this.optionStore_batch_tracking_self_manage.value = this.batchTrackingSelfManage ? 'yes' : 'no';
    this.optionStoreService.update(this.optionStore_batch_tracking_self_manage.id,
      this.optionStore_batch_tracking_self_manage).subscribe(() => {
      this.notifySer.notify('success', this.batchTrackingSelfManage
        ? 'Đã bật quyền tự bật/tắt quản lý theo lô'
        : 'Đã tắt quyền tự bật/tắt quản lý theo lô');
    }, () => {
      this.batchTrackingSelfManage = !this.batchTrackingSelfManage;
      this.notifySer.notify('error', 'Lưu cài đặt thất bại, vui lòng thử lại');
    });
  }

  changePrintType() {
    // console.log(this.printType);
    this.optionStore_print_type.value = this.printType;
    this.optionStoreService.update(this.optionStore_print_type.id, this.optionStore_print_type).subscribe(res => {
      // console.log(res);
    });
  }

  changeSettingType() {
    const url = '/setting/common/' + this.settingsType;

    this.location.go(url);
  }

  processFile(imageInput) {
    const file: File = imageInput.files[0];
    const reader = new FileReader();

    reader.addEventListener('load', (event: any) => {
      this.selectedFiles.push(new ImageSnippet(event.target.result, file, ''));

      this.selectedFiles.forEach((value, index) => {
        this.imageButtons[index]['isShow'] = false;
      });
    });
    this.needToSaveLogo = true;
    reader.readAsDataURL(file);
  }

  reloadImageButtons() {
    this.imageButtons.forEach(img => {
      img.isShow = true;
    });
    this.selectedFiles.forEach((value, index) => {
      this.imageButtons[index]['isShow'] = false;
    });
  }

  removeSelectedImage(index) {
    const removeImage = this.selectedFiles[index];
    this.selectedFiles.splice(index, 1);

    if (removeImage['id'].length > 0) {
      // this.productSer.removeImage(this.product_id, removeImage['id']).subscribe(res => {
      //   this.notifySer.notify('warning', 'Đã xóa hình ảnh!');
        this.reloadImageButtons();

      // });
    } else {
      this.reloadImageButtons();
    }

    this.needToSaveLogo = true;
  }

  saveLogo() {
      /**
       * Upload product images
       */
      const formData = new FormData();

      if (this.selectedFiles.length > 0) {
        formData.append('file', this.selectedFiles[0].file);
      }

      this.storeSer.uploadLogo(formData).subscribe(res => {
        this.isLoadingResults = false;
        if (res['success'] === false) {
          this.notifySer.notify('error', 'Lưu không thành công!');
        } else {
          this.notifySer.notify('success', 'Lưu thành công!');
        }
        this.reloadImageButtons();
      });
  }

  saveConnect() {
    this.connectForm.markAllAsTouched();
    if (!this.connectForm.valid) {
      return;
    }

    const data = this.connectForm.getRawValue();

    this.branchSer.updateConnect(data)
      .subscribe(res => {
        if (res['success'] === false) {
          this.notifySer.notify('error', 'Lưu không thành công!');
        } else {
          this.notifySer.notify('success', 'Lưu thành công!');
        }
      });
  }

  /** Đang gọi API kiểm tra kết nối cho tài khoản cấp cửa hàng */
  testingStoreConnectionV2 = false;

  testStoreConnectionV2Result: { success: boolean; message: string } = null;

  /**
   * Kiểm tra tài khoản CSDL Dược quốc gia của cửa hàng, dùng giá trị đang nhập trên
   * form nên phát hiện sai tài khoản trước khi lưu.
   */
  testStoreConnectionV2() {
    if (this.testingStoreConnectionV2) {
      return;
    }

    const username = this.storeConnectForm.getRawValue()['national_pharmacy_v2_login_username'];
    const password = this.storeConnectForm.getRawValue()['national_pharmacy_v2_login_password'];

    this.testingStoreConnectionV2 = true;
    this.testStoreConnectionV2Result = null;

    this.branchSer.testConnectionV2(username, password).subscribe(res => {
      this.testingStoreConnectionV2 = false;
      this.testStoreConnectionV2Result = res;
      this.notifySer.notify(res.success ? 'success' : 'error', res.message);
    }, error => {
      this.testingStoreConnectionV2 = false;
      const message = error?.error?.message || 'Không gọi được API kiểm tra kết nối.';
      this.testStoreConnectionV2Result = {success: false, message};
      this.notifySer.notify('error', message);
    });
  }

  saveStoreConnect() {
    this.storeConnectForm.markAllAsTouched();
    if (!this.storeConnectForm.valid) {
      return;
    }

    const data = this.storeConnectForm.value;

    this.storeSer.updateInfo(data).subscribe(res => {
      if (res['success'] === false) {
        this.notifySer.notify('warning', 'Không có thay đổi nào để lưu');
      } else {
        this.notifySer.notify('success', 'Lưu thành công!');
      }
    }, error => {
      const message = error && error.error ? error.error['message'] : null;
      this.notifySer.notify('error', message || 'Lưu không thành công!');
    });
  }

  saveStore() {
    this.storeForm.markAllAsTouched();
    if (!this.storeForm.valid) {
      return;
    }

    const data = this.storeForm.getRawValue();

    this.storeSer.updateInfo(data)
      .subscribe(res => {
        if (res['success'] === false) {
          this.notifySer.notify('error', 'Lưu không thành công!');
        } else {
          this.notifySer.notify('success', 'Lưu thành công!');
        }
      });
  }

  saveComm() {
    this.commForm.markAllAsTouched();
    if (!this.commForm.valid) {
      return;
    }

    const data = this.commForm.getRawValue();

    this.optionStore_comm_percent_invoice.value = data['comm_percent_invoice'];
    this.optionStore_comm_percent_product.value = data['comm_percent_product'];

    this.optionStoreService.update(this.optionStore_comm_percent_invoice.id, this.optionStore_comm_percent_invoice).subscribe(res => {
    });
    this.optionStoreService.update(this.optionStore_comm_percent_product.id, this.optionStore_comm_percent_product).subscribe(res => {
    });
    this.notifySer.notify('success', 'Lưu thành công!');
  }

  async savePointSettings() {
    let isError = false;
    this.pointSettingsForm.markAllAsTouched();
    if (!this.pointSettingsForm.valid) {
      return;
    }

    const data = this.pointSettingsForm.getRawValue();
    this.point_enabled.value = data.point_enabled.toString();
    await this.optionStoreService.update(this.point_enabled.id, this.point_enabled).toPromise()
      .then(res => { },
        err => {
          isError = true;
        });

    this.point_cash_to_point_rate.value = data.point_cash_to_point_rate.toString();
    await this.optionStoreService.update(this.point_cash_to_point_rate.id, this.point_cash_to_point_rate).toPromise()
      .then(res => { },
        err => {
          isError = true;
        });

    this.point_point_to_cash_rate.value = data.point_point_to_cash_rate.toString();
    await this.optionStoreService.update(this.point_point_to_cash_rate.id, this.point_point_to_cash_rate).toPromise()
      .then(res => { },
        err => {
          isError = true;
        });

    this.point_can_pay_by_point_after_invoices.value = data.point_can_pay_by_point_after_invoices.toString();
    await this.optionStoreService.update(this.point_can_pay_by_point_after_invoices.id, this.point_can_pay_by_point_after_invoices).toPromise()
      .then(res => { },
        err => {
          isError = true;
        });

    this.point_dont_add_point_for_discount_invoice.value = data.point_dont_add_point_for_discount_invoice.toString();
    await this.optionStoreService.update(this.point_dont_add_point_for_discount_invoice.id, this.point_dont_add_point_for_discount_invoice).toPromise()
      .then(res => { },
        err => {
          isError = true;
        });

    this.point_dont_add_point_for_invoice_paid_by_point.value = data.point_dont_add_point_for_invoice_paid_by_point.toString();
    await this.optionStoreService.update(this.point_dont_add_point_for_invoice_paid_by_point.id, this.point_dont_add_point_for_invoice_paid_by_point).toPromise()
      .then(res => { },
        err => {
          isError = true;
        });

    if (isError) {
      this.notifySer.notify('error', 'Lưu không thành công!');
    } else {
      this.notifySer.notify('success', 'Lưu thành công!');
    }
  }

  loadEinvoiceSettings() {
    this.optionStoreService.getValue('einvoice_enabled').subscribe(res => {
      this.einvoiceForm.patchValue({
        einvoice_enabled: res.value === 'true'
      });
    });

    this.optionStoreService.getValue('einvoice_partner_guid').subscribe(res => {
      this.einvoiceForm.patchValue({
        einvoice_partner_guid: res.value || ''
      });
    });

    this.optionStoreService.getValue('einvoice_partner_token').subscribe(res => {
      this.einvoiceForm.patchValue({
        einvoice_partner_token: res.value || ''
      });
    });

    this.optionStoreService.getValue('einvoice_api_url').subscribe(res => {
      this.einvoiceForm.patchValue({
        einvoice_api_url: res.value || ''
      });
    });

    this.optionStoreService.getValue('einvoice_invoice_serial').subscribe(res => {
      this.einvoiceForm.patchValue({
        einvoice_invoice_serial: res.value || ''
      });
    });

    this.optionStoreService.getValue('einvoice_invoice_type').subscribe(res => {
      this.einvoiceForm.patchValue({
        einvoice_invoice_type: res.value || ''
      });
    });
  }

  async saveEinvoice() {
    this.einvoiceForm.markAllAsTouched();
    if (!this.einvoiceForm.valid) {
      return;
    }

    const formData = this.einvoiceForm.value;
    let success = true;

    try {
      let enabledOption = await this.optionStoreService.getValue('einvoice_enabled').toPromise();
      let guidOption = await this.optionStoreService.getValue('einvoice_partner_guid').toPromise();
      let tokenOption = await this.optionStoreService.getValue('einvoice_partner_token').toPromise();
      let urlOption = await this.optionStoreService.getValue('einvoice_api_url').toPromise();
      let serialOption = await this.optionStoreService.getValue('einvoice_invoice_serial').toPromise();
      let typeOption = await this.optionStoreService.getValue('einvoice_invoice_type').toPromise();

      if (!enabledOption) {
        enabledOption = { id: null, name: 'einvoice_enabled', value: 'false', no: '', auto: '', return_auto: '', type: '', sort: '', status: 1 };
      }
      if (!guidOption) {
        guidOption = { id: null, name: 'einvoice_partner_guid', value: '', no: '', auto: '', return_auto: '', type: '', sort: '', status: 1 };
      }
      if (!tokenOption) {
        tokenOption = { id: null, name: 'einvoice_partner_token', value: '', no: '', auto: '', return_auto: '', type: '', sort: '', status: 1 };
      }
      if (!urlOption) {
        urlOption = { id: null, name: 'einvoice_api_url', value: '', no: '', auto: '', return_auto: '', type: '', sort: '', status: 1 };
      }
      if (!serialOption) {
        serialOption = { id: null, name: 'einvoice_invoice_serial', value: '', no: '', auto: '', return_auto: '', type: '', sort: '', status: 1 };
      }
      if (!typeOption) {
        typeOption = { id: null, name: 'einvoice_invoice_type', value: '1', no: '', auto: '', return_auto: '', type: '', sort: '', status: 1 };
      }

      enabledOption.value = formData.einvoice_enabled ? 'true' : 'false';
      guidOption.value = formData.einvoice_partner_guid;
      tokenOption.value = formData.einvoice_partner_token;
      urlOption.value = formData.einvoice_api_url;
      serialOption.value = formData.einvoice_invoice_serial;
      typeOption.value = formData.einvoice_invoice_type;

      // Lưu hoặc cập nhật
      if (enabledOption.id) {
        await this.optionStoreService.update(enabledOption.id, enabledOption).toPromise();
      } else {
        await this.optionStoreService.create(enabledOption).toPromise();
      }
      if (guidOption.id) {
        await this.optionStoreService.update(guidOption.id, guidOption).toPromise();
      } else {
        await this.optionStoreService.create(guidOption).toPromise();
      }
      if (tokenOption.id) {
        await this.optionStoreService.update(tokenOption.id, tokenOption).toPromise();
      } else {
        await this.optionStoreService.create(tokenOption).toPromise();
      }
      if (urlOption.id) {
        await this.optionStoreService.update(urlOption.id, urlOption).toPromise();
      } else {
        await this.optionStoreService.create(urlOption).toPromise();
      }
      if (serialOption.id) {
        await this.optionStoreService.update(serialOption.id, serialOption).toPromise();
      } else {
        await this.optionStoreService.create(serialOption).toPromise();
      }
      if (typeOption.id) {
        await this.optionStoreService.update(typeOption.id, typeOption).toPromise();
      } else {
        await this.optionStoreService.create(typeOption).toPromise();
      }

      this.notifySer.notify('success', 'Đã lưu cấu hình hóa đơn điện tử thành công!');
    } catch (error) {
      console.error('Error saving einvoice settings:', error);
      this.notifySer.notify('error', 'Lưu cấu hình thất bại, vui lòng thử lại!');
    }
  }
}
