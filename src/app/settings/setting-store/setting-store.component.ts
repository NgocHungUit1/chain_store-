import {Component, HostBinding, OnInit} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators} from '@angular/forms';
import {UserService} from '../../user/user.service';
import {NotifierService} from 'angular-notifier';
import { CustomValidators } from 'ng2-validation';
import {StoreService} from '../../store/store.service';
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
  local_data: any;
  user_id: string;
  checkChangePassword = false;

  constructor(
    public userService: UserService,
    public storeSer: StoreService,
    public notifySer: NotifierService,
    private fb: FormBuilder,
  ) {
  }

  ngOnInit() {
    this.initForm();
  }

  isOver(): boolean {
    return window.matchMedia(`(max-width: 960px)`).matches;
  }

  initForm() {
    this.form = this.fb.group({
      pricing_plan_id: [{value: null, disabled: true}, Validators.required],
      created_by: [{value: null, disabled: true}, Validators.required],
      created_at: [{value: null, disabled: true}, Validators.required],
      expiration_date: [{value: null, disabled: true}, Validators.required],
      nation_username: [{value: null, disabled: true}, Validators.required],
      nation_password: [{value: null, disabled: true}, Validators.required],
      registration_no: [{value: null, disabled: true}, Validators.required],
      // Tài khoản liên thông CSDL Dược quốc gia của cửa hàng (chỉ xem, do quản trị
      // viên khai báo ở trang quản trị)
      nation_v2_username: [{value: null, disabled: true}],
      nation_v2_password: [{value: null, disabled: true}],
      pharmacist_name:  [{value: null, disabled: true}, Validators.required],
      pharmacist_license_number:  [{value: null, disabled: true}, Validators.required],
    });

    this.loadData();
  }

  loadData() {
    this.storeSer.getDetail().subscribe(store => {
      this.form.patchValue({
        pricing_plan_id: store['pricing_plan_id'],
        created_by: store['created_by'],
        created_at: store['created_at'],
        expiration_date: store['expiration_date'],
        registration_no: store['national_pharmacy_registration_no'],
        nation_username: store['national_pharmacy_login_username'],
        nation_password: store['national_pharmacy_login_password'],
        nation_v2_username: store['national_pharmacy_v2_login_username'],
        nation_v2_password: store['national_pharmacy_v2_login_password'],
        pharmacist_name: store['pharmacist_name'],
        pharmacist_license_number: store['pharmacist_license_number'],
      });
    });
  }

  submit() {
    if (this.form.valid) {
      const data = this.form.getRawValue();
      this.userService.updateProfile(data).subscribe(res => {
        this.loading = false;
        if (res['success']) {
          this.notifySer.notify('success', 'Cập nhật thành công!');
        } else {
          const errors = JSON.parse(res['error_message']);
          errors.forEach(error => {
            this.notifySer.notify('error', error);
          });
        }
      }, error => {
        this.loading = false;
        if (error.status === 422) {
          error.error.forEach(err => {
            this.form.controls[err.field].setErrors({'error': true});
          });
        }
      });
    }
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
