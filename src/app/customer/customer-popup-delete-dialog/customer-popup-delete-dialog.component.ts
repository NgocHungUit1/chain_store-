import { Component, Optional, Inject, OnInit } from '@angular/core';
import { CustomerService } from '../customer.service';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from "@angular/material/dialog";
import { NotifierService } from "angular-notifier";

@Component({
  selector: 'app-customer-popup-delete-dialog',
  templateUrl: './customer-popup-delete-dialog.component.html',
  styleUrls: ['./customer-popup-delete-dialog.component.css']
})
export class CustomerPopupDeleteDialogComponent implements OnInit {

  action: string;
  title: string;
  local_data: any;
  customer_id: string;

  constructor(
    public dialogRef: MatDialogRef<CustomerPopupDeleteDialogComponent>,
    private customerSer: CustomerService,
    public notifySer: NotifierService,
    private dialog: MatDialog,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: Object) {
    this.local_data = { ...data };
    this.action = this.local_data.action;
    this.title = this.local_data.title;
    this.customer_id = this.local_data.customer_id;
  }

  ngOnInit(): void {
  }

  closeDialog() {
    this.dialogRef.close({ event: 'Cancel' });
  }

  delete() {
    this.customerSer.delete(this.customer_id).subscribe(customer => {
      this.notifySer.notify('success', 'Xóa khách hàng thành công!');
      this.dialogRef.close({ event: 'Delete' });
      this.customerSer.setLoadCustmer(true);
    });
  }

}
