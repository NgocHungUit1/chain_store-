import {Component, Inject, OnInit, Optional} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material/dialog';
import {CustomerService} from '../../customer/customer.service';
import {NotifierService} from 'angular-notifier';
import {UserService} from '../user.service';

@Component({
  selector: 'app-user-popup-delete-dialog',
  templateUrl: './user-popup-delete-dialog.component.html',
  styleUrls: ['./user-popup-delete-dialog.component.css']
})
export class UserPopupDeleteDialogComponent implements OnInit {

  action: string;
  title: string;
  local_data: any;
  user_id: string;

  constructor(
    public dialogRef: MatDialogRef<UserPopupDeleteDialogComponent>,
    private userService: UserService,
    public notifySer: NotifierService,
    private dialog: MatDialog,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: Object) {
    this.local_data = { ...data };
    this.action = this.local_data.action;
    this.title = this.local_data.title;
    this.user_id = this.local_data.user_id;
  }

  ngOnInit(): void {
  }

  closeDialog() {
    this.dialogRef.close({ event: 'Cancel' });
  }

  delete() {
    this.userService.delete(this.user_id).subscribe(user => {
      this.notifySer.notify('success', 'Xóa tài khoản thành công!');
      this.dialogRef.close({ event: 'Delete' });
      this.userService.setLoadUser(true);
    });
  }


}
