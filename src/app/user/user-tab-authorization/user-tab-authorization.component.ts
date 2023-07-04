import {Component, Input, OnInit} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {NotifierService} from 'angular-notifier';
import {User} from '../user.model';
import {UserService} from '../user.service';
import {UserFormDialogComponent} from '../user-form-dialog/user-form-dialog.component';
import {StoreRoleService} from '../store-role.service';
import {StoreUserPermissionService} from '../store-user-permission.service';
import {StoreRoleFormDialogComponent} from '../store-role-form-dialog/store-role-form-dialog.component';

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
  selectedPermissions = [];
  savedUserPermission = [];
  savedUserRoleId = null;

  sexHeader = {
    '1': 'Nam',
    '0': 'Nữ',
  };

  constructor(
    private userService: UserService,
    private storeRoleService: StoreRoleService,
    private storeUserPermissionService: StoreUserPermissionService,
    private dialog: MatDialog,
    private notifyService: NotifierService
  ) { }

  ngOnInit(): void {
    this.getStoreRoleList();
    this.loadUserPermission();
  }

  loadUser(id) {
    this.userService.getUser(id).subscribe(res => {
      this.user = res;
    });
  }

  loadUserPermission() {
    this.storeUserPermissionService.getPermissionByUser(this.user.id).subscribe(res => {
      this.selectedRoleId = res.body['role_id'];
      this.savedUserRoleId = res.body['role_id'];
      this.selectedPermissions = res.body['permission_list'];
      this.savedUserPermission = res.body['permission_list'];
    });
  }

  save() {
    const data = {
      role_id: this.selectedRoleId,
      permission_list: this.selectedPermissions
    };
    this.storeUserPermissionService.updatePermission(this.user.id, data).subscribe(x => {
      this.savedUserRoleId = this.selectedRoleId;
      this.savedUserPermission = this.selectedPermissions;

      this.notifyService.notify('success', 'Cập nhật thành công!');
    });
  }

  getStoreRoleList() {
    this.userService.getStoreRoleList().subscribe(res => {
      this.storeRoles = res.body;
    });
  }

  onChangeRole(event) {
    this.loadRolePermission();
  }

  loadRolePermission() {
    this.storeRoleService.getPermissionList(this.selectedRoleId).subscribe(res => {
      if (this.selectedRoleId == this.savedUserRoleId) {
        this.selectedPermissions = [...new Set([...res.body , ...this.savedUserPermission])];
      } else {
        this.selectedPermissions = res.body;
      }
    });
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

  openStoreRoleDialog(role_id = null, copy_role_id = null) {
    const obj = {
      action: 'Create',
      title: 'Thêm mới vai trò',
    };
    if (role_id !== null) {
      obj['role_id'] = role_id;
    }
    if (copy_role_id !== null) {
      obj['copy_role_id'] = copy_role_id;
    }

    const dialogRef = this.dialog.open(StoreRoleFormDialogComponent, {
      data: obj,
      width: '50%',
      minHeight: '80%',
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.getStoreRoleList();
      }
    });
  }
}
