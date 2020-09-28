import {Component, Inject, OnInit, Optional} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
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
    }
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  initForm() {
    this.form = this.fb.group({
      username: [null,
        Validators.compose([
          Validators.required, Validators.maxLength(32)
        ])
      ],
      password: [null, this.user_id ?
        [Validators.minLength(6), Validators.maxLength(32)] : [Validators.minLength(6), Validators.required, Validators.maxLength(32)]
      ],
      password_confirm: [null, this.user_id ?
        [Validators.maxLength(32)] : [Validators.required, Validators.maxLength(32)]
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
    }, {
      validator: this.checkPasswordConfirm
    });
  }

  checkPasswordConfirm(group: FormGroup) {
    const password = group.get('password').value;
    const passwordConfirm = group.get('password_confirm').value;
    return password === passwordConfirm ? null : {passwordNotMatch: true};
  }

  ngOnInit(): void {

    this.initForm();
    if (this.user_id !== null && this.user_id !== undefined) {
      this.loadUser(this.user_id);
    }

  }

  loadUser(id) {
    this.userService.getUser(id).subscribe(user => {
      this.form.patchValue({
        username: user['username'],
        phone_number: user['phone_number'],
        email: user['email'],
        status: user['status'],
      });
    });
  }

  submit() {
    if (this.form.valid) {
      const data = this.form.getRawValue();

      if (this.user_id !== null && this.user_id !== undefined) {
        this.userService.update(this.user_id, data).subscribe(res => {
          this.notifySer.notify('success', 'Cập nhật tài khoản thành công!');
          this.dialogRef.close(res);
        });
      } else {
        this.userService.create(data).subscribe(res => {
          this.notifySer.notify('success', 'Thêm tài khoản thành công!');
          this.dialogRef.close(res);
        });
      }
    }
  }

  updatePassword() {
    this.checkChangePassword = !this.checkChangePassword;
  }

}
