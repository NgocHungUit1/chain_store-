import {Component, Input, OnInit} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {NotifierService} from 'angular-notifier';
import {User} from '../user.model';
import {UserService} from '../user.service';
import {UserFormDialogComponent} from '../user-form-dialog/user-form-dialog.component';
import {UserPopupDeleteDialogComponent} from '../user-popup-delete-dialog/user-popup-delete-dialog.component';

@Component({
  selector: 'app-user-tab-info',
  templateUrl: './user-tab-info.component.html',
  styleUrls: ['./user-tab-info.component.css']
})
export class UserTabInfoComponent implements OnInit {


  @Input() user: User;

  sexHeader = {
    '1': 'Nam',
    '0': 'Nữ',
  };

  constructor(
    private userService: UserService,
    private dialog: MatDialog,
    private notifyService: NotifierService
  ) { }

  ngOnInit(): void {
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

  lock() {
    this.userService.lock(this.user.id).subscribe(x => {
      this.user.status = '9';
      this.notifyService.notify('success', 'Đã khóa thành công!');
    });
  }

  activate() {
    this.userService.activate(this.user.id).subscribe(x => {
      this.user.status = '10';
      this.notifyService.notify('success', 'Đã kích hoạt thành công!');
    });
  }

}
