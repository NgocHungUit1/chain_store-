import {Component, Inject, OnInit, Optional} from '@angular/core';
import {AbstractControl, FormBuilder, FormGroup, ValidationErrors, Validators} from '@angular/forms';
import {Observable} from 'rxjs/Observable';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {NotifierService} from 'angular-notifier';
import {UserService} from '../user.service';

@Component({
  selector: 'app-user-form-dialog',
  templateUrl: './user-form-dialog.component.html',
  styleUrls: ['./user-form-dialog.component.css']
})
export class UserFormDialogComponent implements OnInit {
  form: FormGroup;
  loading = false;
  local_data: any;
  user_id: string;
  checkChangePassword = false;
  storeRoles: any;
  userRole: string[];

  statusItems: any[] = [
    {
      'id': 9,
      'title': 'Tạm khóa'
    },
    {
      'id': 10,
      'title': 'Đang hoạt động'
    }
  ];

  constructor(
    public dialogRef: MatDialogRef<UserFormDialogComponent>,
    public notifySer: NotifierService,
    private fb: FormBuilder,
    private userService: UserService,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: Object
  ) {

    this.local_data = {...data};
    if (this.local_data.user_id) {
      this.user_id = this.local_data.user_id;
      this.checkChangePassword = this.local_data.update_pw;
    }
  }

  ngOnInit(): void {

    this.initForm();

    this.getStoreRoleList();

    this.loadUserRole();

    if (this.user_id !== null && this.user_id !== undefined) {
      this.loadUser(this.user_id);
    }

  }

  initForm() {
    this.form = this.fb.group({
      username: [null,
        Validators.compose([
          Validators.required, Validators.maxLength(32)
        ])
      ],
      password: [null, this.user_id ?
        [Validators.minLength(6), Validators.maxLength(32)] :
        [Validators.minLength(6), Validators.required, Validators.maxLength(32)]
      ],
      password_confirm: [null, this.user_id ?
        null : [Validators.required]
      ],
      phone_number: [null, Validators.compose([
        Validators.required, Validators.maxLength(20)
      ])],
      email: [null, Validators.compose([
        Validators.required, Validators.maxLength(100), Validators.email
      ])],
      status: [10, Validators.compose([
        Validators.required, Validators.maxLength(3)
      ])],
      store_role_id: [null, Validators.compose([
        Validators.required,
        Validators.maxLength(40)
      ])],
    }, {validators: this.checkPasswordConfirm});
  }

  loadUser(id) {
    this.userService.getUser(id).subscribe(user => {
      this.form.patchValue({
        username: user['username'],
        phone_number: user['phone_number'],
        email: user['email'],
        status: user['status'],
        store_role_id: user['storeRole'] ? user['storeRole']['id'] : null,
      });
    });
  }

  loadUserRole() {
    this.userService.getUserRole().subscribe(res => {
      this.userRole = res.roles;
    });
  }

  getStoreRoleList() {
    this.userService.getStoreRoleList().subscribe(res => {
      this.storeRoles = res.body;
    });
  }

  submit() {
    if (this.form.valid) {
      const data = this.form.getRawValue();

      if (this.user_id !== null && this.user_id !== undefined) {
        this.userService.update(this.user_id, data).subscribe(res => {
          this.notifySer.notify('success', 'Cập nhật tài khoản thành công!');
          this.dialogRef.close(res);
        }, (error) => {
          if (error.status === 422) {
            this.ajaxValidate(error);
          }
        });
      } else {
        this.userService.create(data).subscribe(res => {
          this.notifySer.notify('success', 'Thêm tài khoản thành công!');
          this.dialogRef.close(res);
        }, (error) => {
          if (error.status === 422) {
            this.ajaxValidate(error);
          }
        });
      }
    }
  }

  public ajaxValidate(error) {
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

  onNoClick(): void {
    this.dialogRef.close();
  }
}
