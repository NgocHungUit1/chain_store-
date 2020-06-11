import { Component, OnInit, Input } from '@angular/core';
import { Customer } from '../customer.model';
import { CustomerService } from '../customer.service';
import { MatDialog } from '@angular/material/dialog';
import { NotifierService } from 'angular-notifier';
import { CustomerFormDialogComponent } from '../customer-form-dialog/customer-form-dialog.component';
import { CustomerPopupDeleteDialogComponent } from '../customer-popup-delete-dialog/customer-popup-delete-dialog.component';

@Component({
  selector: 'app-customer-tab-info',
  templateUrl: './customer-tab-info.component.html',
  styleUrls: ['./customer-tab-info.component.css']
})
export class CustomerTabInfoComponent implements OnInit {

  @Input() customer: Customer;

  sexHeader = {
    '1': 'Nam',
    '0': 'Nữ',
  };

  constructor(
    private customerSer: CustomerService,
    private dialog: MatDialog,
    private notifyService: NotifierService
  ) { }

  ngOnInit(): void {
  }

  loadCustomer(id) {
    this.customerSer.getDetail(id, 'province,district,ward').subscribe(res => {
      this.customer = res;
    });
  }

  openCustomerFormDialog(id) {
    const obj = {
      action: 'Update',
      title: 'Cập nhật khách hàng',
      customer_id: id,
    };

    const dialogRef = this.dialog.open(CustomerFormDialogComponent, {
      data: obj,
      width: '60%',
      minHeight: '80%',
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadCustomer(result.id);
      }
    });
  }

  openDeleteCustomer(id) {

    let obj = {
      action: 'Delete',
      title: 'Xóa khách hàng',
      customer_id: id,
    };

    const dialogRef = this.dialog.open(CustomerPopupDeleteDialogComponent, {
      data: obj,
      width: '20%',
      minHeight: '80%',
    });

    dialogRef.afterClosed().subscribe(result => {

    });
  }

  lock() {
    this.customerSer.lock(this.customer.id).subscribe(x => {
      this.customer.status = '10';
      this.notifyService.notify('success', 'Đã khóa thành công!');
    });
  }

  activate() {
    this.customerSer.activate(this.customer.id).subscribe(x => {
      this.customer.status = '1';
      this.notifyService.notify('success', 'Đã kích hoạt thành công!');
    });
  }



}
