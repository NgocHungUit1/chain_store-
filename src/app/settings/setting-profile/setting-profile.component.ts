import {Component, HostBinding, OnInit} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators} from '@angular/forms';
import {UserService} from '../../user/user.service';
import {NotifierService} from 'angular-notifier';
import { CustomValidators } from 'ng2-validation';

const password = new FormControl('');
const currentPassword = new FormControl('');
const confirmPassword = new FormControl('', CustomValidators.equalTo(password));

export const passwordValidator: ValidatorFn = (control: FormGroup): ValidationErrors | null => {
  const current_password = control.get('current_password');
  const password = control.get('password');

  return current_password.value.length > 0 && password.value.length === 0 ? { 'requiredPassword': true } : null;
};

@Component({
  selector: 'app-setting-profile',
  templateUrl: './setting-profile.component.html',
  styleUrls: ['./setting-profile.component.css']
})
export class SettingProfileComponent implements OnInit {
  @HostBinding('class.dv-detail-page') layout = true;

  sidePanelOpened = true;
  notes = [];
  searchText;
  clrName = 'warning';
  colors = [{ colorName: 'info' }, { colorName: 'warning' }, { colorName: 'danger' }, { colorName: 'success' }];

  form: FormGroup;
  loading = false;
  local_data: any;
  user_id: string;
  checkChangePassword = false;

  constructor(
    public userService: UserService,
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
      email: [null, Validators.required],
      username: [{value: null, disabled: true}, Validators.required],
      phone_number: [null, Validators.required],
      current_password: currentPassword,
      password: password,
      confirmPassword: confirmPassword,
    }, {validators: passwordValidator});

    this.loadUser();
  }

  loadUser() {
    this.userService.getProfile().subscribe(user => {
      this.form.patchValue({
        username: user['username'],
        phone_number: user['phone_number'],
        email: user['email'],
      });
    });
  }

  submit() {
    if (this.form.valid) {
      const data = this.form.getRawValue();
      this.userService.updateProfile(data).subscribe(res => {
        this.loading = false;
        if (res['success']) {
          this.form.patchValue({
            current_password: '',
            password: '',
            confirmPassword: '',
          });
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

  checkPasswordConfirm(group: FormGroup) {
    const password = group.get('password').value;
    const passwordConfirm = group.get('password_confirm').value;
    if (passwordConfirm != null) {
      if (password === passwordConfirm) {
        group.controls['password_confirm'].setErrors(
          null
        );
      } else {
        group.controls['password_confirm'].setErrors(
          {passwordNotMatch: true}
        );
      }
    }
    return password === passwordConfirm ? null : {passwordNotMatch: true};
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

  updatePassword() {
    this.checkChangePassword = !this.checkChangePassword;
  }

}
