import {Component, Input, OnInit} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {NotifierService} from 'angular-notifier';
import {User} from '../user.model';
import {UserService} from '../user.service';
import {UserFormDialogComponent} from '../user-form-dialog/user-form-dialog.component';
import {UserPopupDeleteDialogComponent} from '../user-popup-delete-dialog/user-popup-delete-dialog.component';
import {StoreRoleService} from '../store-role.service';

@Component({
  selector: 'app-user-tab-authorization',
  templateUrl: './user-tab-authorization.component.html',
  styleUrls: ['./user-tab-authorization.component.css']
})
export class UserTabAuthorizationComponent implements OnInit {


  @Input() user: User;
  @Input() permissionData: any;

  storeRoles: any;
  selectedRoleId = null;
  permissionList = [];

  sexHeader = {
    '1': 'Nam',
    '0': 'Nữ',
  };

  constructor(
    private userService: UserService,
    private storeRoleService: StoreRoleService,
    private dialog: MatDialog,
    private notifyService: NotifierService
  ) { }

  ngOnInit(): void {
    this.getStoreRoleList();
    this.selectedRoleId = this.user.store_role_id;
  }

  loadUser(id) {
    this.userService.getUser(id).subscribe(res => {
      this.user = res;
    });
  }

  openUserFormDialog(id) {
    const obj = {
      action: 'Update',
      title: 'Cập nhật tài khoản',
      user_id: id,
    };

    const dialogRef = this.dialog.open(UserFormDialogComponent, {
      data: obj,
      width: '50%',
      minHeight: '80%',
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadUser(result.id);
      }
    });
  }

  openDeleteUser(id) {

    const obj = {
      action: 'Delete',
      title: 'Xóa tài khoản',
      user_id: id,
    };

    const dialogRef = this.dialog.open(UserPopupDeleteDialogComponent, {
      data: obj,
      width: '20%',
      minHeight: '80%',
    });

    dialogRef.afterClosed().subscribe(result => {

    });
  }

  save() {
    const data = {
      role_id: this.selectedRoleId,
      permission_list: []
    };
    this.userService.updatePermission(this.user.id, data).subscribe(x => {
      this.user.store_role_id = this.selectedRoleId;
      this.notifyService.notify('success', 'Cập nhật thành công!');
    });
  }

  getStoreRoleList() {
    this.userService.getStoreRoleList().subscribe(res => {
      this.storeRoles = res.body;
    });
  }

  onChangeRole(event) {
    console.log(this.selectedRoleId);
    this.loadRolePermission();
  }

  loadRolePermission() {
    this.storeRoleService.getPermissionList(this.selectedRoleId).subscribe(res => {
      this.permissionList = res.body;
      console.log(res.body);
    });
  }
}
