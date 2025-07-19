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
  isLoadPermission = false;

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
      this.isLoadPermission = true;
    });
  }

  save() {
    const data = {
      role_id: this.selectedRoleId,
      permission_list: this.selectedPermissions
    };
    console.log('Save user permission data:');
    console.log(data);
    console.log(this.selectedPermissions);
    console.log(this.savedUserPermission);

    this.storeUserPermissionService.updatePermission(this.user.id, data).subscribe(x => {
      this.savedUserRoleId = this.selectedRoleId;
      this.savedUserPermission = [...this.selectedPermissions];

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
        this.selectedPermissions = [...res.body];
      }
    });
  }

  public nodeChecked(args: any): void {
    console.log(this.selectedPermissions);

    args.data.forEach(item => {
      console.log(item);
      const index = this.selectedPermissions.indexOf(item.id.toString());

      if (item.isChecked === 'true') {
        // Item checked then check not exist
        if (index === -1) {
          this.selectedPermissions.push(item.id.toString());

          // Kiểm tra có mục con không
          // Nếu có thì thêm tất cả các mục con vào selectedPermissions
          if (!item.checked && item.hasChildren) {
            const childrenIds = this.findChildrenIdsById(item.id.toString());
            for (const childId of childrenIds) {

              if (!this.selectedPermissions.find(id => Number(id) === Number(childId))) {
                this.selectedPermissions.push(childId);
              }

            }
          }
        }
      } else {
        if (index !== -1) {
          this.selectedPermissions.splice(index, 1);
        }

        // Kiểm tra có mục con không
        // Đếm số mục con được chọn hiện tại
        // Nếu tất cả các con đều được chọn thì bỏ chọn tất cả các con
        if (!item.checked && item.hasChildren) {
          const childrenIds = this.findChildrenIdsById(item.id.toString());

          let countChildChecker = 0;
          for (const childId of childrenIds) {
            if (this.selectedPermissions.find(id => Number(id) === Number(childId))) {
              countChildChecker++;
            }
          }

          if (countChildChecker === childrenIds.length) {
            for (const childId of childrenIds) {
              const childIndex = this.selectedPermissions.indexOf(childId);

              if (childIndex !== -1) {
                this.selectedPermissions.splice(childIndex, 1);
              }
            }
          }

        }
      }
    });
  }

  /**
   * Tìm kiếm tất cả các ID con của một ID mục nhất định trong cấu trúc phân quyền
   * @param targetId ID mục cần tìm kiếm
   * @returns Mảng chứa tất cả các ID con
   */
  private findChildrenIdsById(targetId: string): string[] {
    const result: string[] = [];

    const recursiveSearch = (nodes: any[]) => {
      for (const node of nodes) {
        if (node.id.toString() === targetId) {
          collectChildIds(node);
          break;
        }
        if (node.children) {
          recursiveSearch(node.children);
        }
      }
    };

    const collectChildIds = (node: any) => {
      if (node.children) {
        for (const child of node.children) {
          result.push(child.id.toString());
          collectChildIds(child);
        }
      }
    };

    // iterate each group in storePerData
    for (const group of Object.keys(this.permissionData.permission_data)) {
      const nodes = this.permissionData.permission_data[group].children;
      recursiveSearch(nodes);
    }

    return result;
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

        if (this.selectedRoleId) {
          this.loadRolePermission();
        }
      }
    });
  }
}
