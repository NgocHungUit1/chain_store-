import {Component, HostBinding, OnInit} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators} from '@angular/forms';
import {UserService} from '../../user/user.service';
import {NotifierService} from 'angular-notifier';
import { CustomValidators } from 'ng2-validation';
import {StoreService} from '../../store/store.service';
import {BranchService} from '../../branch/branch.service';
import {AuthService} from '../../authentication/auth.service';
import {date} from 'ng2-validation/dist/date';

const password = new FormControl('');

@Component({
  selector: 'app-setting-store',
  templateUrl: './setting-store.component.html',
  styleUrls: ['./setting-store.component.css']
})
export class SettingStoreComponent implements OnInit {
  @HostBinding('class.dv-detail-page') layout = true;

  sidePanelOpened = true;
  notes = [];
  searchText;
  clrName = 'warning';
  colors = [{ colorName: 'info' }, { colorName: 'warning' }, { colorName: 'danger' }, { colorName: 'success' }];

  pricingPlan = {
    '-1': 'Không giới hạn',
    '-10': 'Tùy chọn',
    '1': '1 năm',
    '2': '3 năm',
  };

  form: FormGroup;
  loading = false;
  hidePassword = true;
  hideV2Password = true;
  testingConnection = false;
  testConnectionResult: { success: boolean; message: string } = null;
  local_data: any;
  user_id: string;
  checkChangePassword = false;

  constructor(
    public userService: UserService,
    public storeSer: StoreService,
    public notifySer: NotifierService,
    private fb: FormBuilder,
    private branchSer: BranchService,
    private authSer: AuthService,
  ) {
  }

  ngOnInit() {
    this.initForm();
  }

  isOver(): boolean {
    return window.matchMedia(`(max-width: 960px)`).matches;
  }

  initForm() {
    // Khoá: thông tin hợp đồng và mã cơ sở - chỉ bộ phận hỗ trợ đổi được (sai mã cơ sở
    // là hỏng liên thông Dược Quốc Gia). Các ô còn lại cửa hàng tự cập nhật.
    this.form = this.fb.group({
      pricing_plan_id: [{value: null, disabled: true}],
      created_by: [{value: null, disabled: true}],
      created_at: [{value: null, disabled: true}],
      registration_no: [{value: null, disabled: true}],

      nation_username: [null],
      nation_password: [null],
      // Tài khoản CSDL Dược quốc gia (hệ thống mới) của cửa hàng. Nhà thuốc tự nhập: màn
      // này thay cho mục "Liên thông cửa hàng" cũ ở Thiết lập, cùng lưu vào 2 cột
      // store.national_pharmacy_v2_login_username / _password.
      nation_v2_username: [null],
      nation_v2_password: [null],
      owner_name: [null],
      phone: [null],
      email: [null, Validators.email],
      pharmacist_name: [null],
      pharmacist_license_number: [null],
      pharmacist_phone: [null],
      pharmacist_email: [null, Validators.email],
    });

    this.loadData();
  }

  loadData() {
    this.storeSer.getDetail().subscribe(store => {
      this.form.patchValue({
        pricing_plan_id: store['pricing_plan_id'],
        created_by: store['created_by'],
        created_at: store['created_at'],
        registration_no: store['national_pharmacy_registration_no'],
        nation_username: store['national_pharmacy_login_username'],
        nation_password: store['national_pharmacy_login_password'],
        nation_v2_username: store['national_pharmacy_v2_login_username'],
        nation_v2_password: store['national_pharmacy_v2_login_password'],
        owner_name: store['owner_name'],
        phone: store['phone'],
        email: store['email'],
        pharmacist_name: store['pharmacist_name'],
        pharmacist_license_number: store['pharmacist_license_number'],
        pharmacist_phone: store['pharmacist_phone'],
        pharmacist_email: store['pharmacist_email'],
      });
    });
  }

  submit() {
    if (this.form.invalid || this.loading) {
      return;
    }

    this.loading = true;
    const v = this.form.value;   // chỉ lấy ô đang mở, ô khoá không gửi lên

    this.storeSer.updateInfo({
      national_pharmacy_login_username: v.nation_username,
      national_pharmacy_login_password: v.nation_password,
      national_pharmacy_v2_login_username: v.nation_v2_username,
      national_pharmacy_v2_login_password: v.nation_v2_password,
      owner_name: v.owner_name,
      phone: v.phone,
      email: v.email,
      pharmacist_name: v.pharmacist_name,
      pharmacist_license_number: v.pharmacist_license_number,
      pharmacist_phone: v.pharmacist_phone,
      pharmacist_email: v.pharmacist_email,
    }).subscribe(res => {
      this.loading = false;
      if (res['success']) {
        this.notifySer.notify('success', 'Cập nhật thông tin cửa hàng thành công!');
      } else {
        this.notifySer.notify('warning', 'Không có thay đổi nào để lưu');
      }
    }, error => {
      this.loading = false;
      const message = error && error.error ? error.error['message'] : null;
      this.notifySer.notify('error', message || 'Cập nhật thất bại, vui lòng thử lại');
    });
  }

  canDo(permissionName: string): boolean {
    return this.authSer.getPermissionsFromLocalStorage().indexOf(permissionName) !== -1;
  }

  /**
   * Thử đăng nhập CSDL Dược quốc gia bằng tài khoản ĐANG GÕ trên form (chưa cần Lưu),
   * để nhà thuốc biết sai tài khoản ngay chứ không phải chờ tới lúc đẩy phiếu.
   */
  testConnectionV2() {
    if (this.testingConnection) {
      return;
    }
    const v = this.form.getRawValue();
    this.testingConnection = true;
    this.testConnectionResult = null;

    this.branchSer.testConnectionV2(v.nation_v2_username, v.nation_v2_password).subscribe(res => {
      this.testingConnection = false;
      this.testConnectionResult = res;
      this.notifySer.notify(res.success ? 'success' : 'error', res.message);
    }, error => {
      this.testingConnection = false;
      const message = (error && error.error && error.error.message) || 'Không gọi được API kiểm tra kết nối.';
      this.testConnectionResult = {success: false, message};
      this.notifySer.notify('error', message);
    });
  }

  ajaxValidate(error) {
    if (error.error) {
      if (this.form instanceof FormGroup) {
        const _fields = this.form.controls;
        Object.keys(_fields).forEach(key => {
          const errorField = error.error.find(x => x.field === key);
          if (errorField) {
            this.form.controls[key].setErrors({
              ajaxValidator: {
                value: errorField.message,
              }
            });
          }
        });
      }
    }
  }
}
