import { Component, Inject, OnInit, Optional } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { Observable } from 'rxjs/Observable';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { NotifierService } from 'angular-notifier';
import { UserService } from '../user.service';
import {StoreRoleService} from '../store-role.service';
import {StorePermissionService} from '../store-permission.service';

@Component({
  selector: 'app-store-role-form-dialog',
  templateUrl: './store-role-form-dialog.component.html',
  styleUrls: ['./store-role-form-dialog.component.css']
})
export class StoreRoleFormDialogComponent implements OnInit {
  form: FormGroup;
  loading = false;
  local_data: any;
  store_role_id: string = null;
  copy_role_id: string = null;
  storePerData: any;
  selectedPermissions = [];

  constructor(
    public dialogRef: MatDialogRef<StoreRoleFormDialogComponent>,
    public notifySer: NotifierService,
    private fb: FormBuilder,
    private userService: UserService,
    private storeRoleService: StoreRoleService,
    private storePerSer: StorePermissionService,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: Object
  ) {

    this.local_data = {...data};
    if (this.local_data.role_id) {
      this.store_role_id = this.local_data.role_id;
    }
    if (this.local_data.copy_role_id) {
      this.copy_role_id = this.local_data.copy_role_id;
    }
  }

  ngOnInit(): void {

    this.initForm();

    this.storePerSer.getPermissionListWithGroup().subscribe(res => {
      this.storePerData = res.body;
    });

    if (this.store_role_id !== null) {
      this.loadRolePermission(this.store_role_id);
      this.loadRoleDetail();
    }
    if (this.copy_role_id !== null) {
      this.loadRolePermission(this.copy_role_id);
    }
  }

  loadRoleDetail() {
    this.storeRoleService.getDetail(this.store_role_id).subscribe(res => {
      this.form.patchValue(res);
    });
  }

  loadRolePermission(role_id) {
    this.storeRoleService.getPermissionList(role_id).subscribe(res => {
      this.selectedPermissions = res.body;
    });
  }

  initForm() {
    this.form = this.fb.group({
      name: [null,
        Validators.compose([
          Validators.required, Validators.maxLength(32)
        ])
      ],
    });
  }

  submit() {
    if (this.form.valid) {
      const data = this.form.getRawValue();
      data['permission_list'] = this.selectedPermissions;

      if (this.store_role_id !== null && this.store_role_id !== undefined) {
        this.storeRoleService.update(this.store_role_id, data).subscribe(res => {
          this.notifySer.notify('success', 'Cập nhật vai trò thành công!');
          this.dialogRef.close(res);
        }, (error) => {
          if (error.status === 422) {
            this.ajaxValidate(error);
          }
        });
      } else {
        this.storeRoleService.create(data).subscribe(res => {
          this.notifySer.notify('success', 'Thêm vai trò thành công!');
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

  onNoClick(): void {
    this.dialogRef.close();
  }

  public nodeChecked(args: any): void {
    args.data.forEach(item => {
      const index = this.selectedPermissions.indexOf(item.id);
      if (item['isChecked'] === 'true') {
        // Item checked then check not exist
        if (index === -1) {
          this.selectedPermissions.push(item.id);
        }
      } else {
        if (index !== -1) {
          this.selectedPermissions.splice(index, 1);
        }
      }
    });

  }
}
