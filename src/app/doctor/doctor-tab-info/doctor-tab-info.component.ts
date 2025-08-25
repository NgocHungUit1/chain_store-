import { Component, Input, OnInit } from '@angular/core';
import { CustomerService } from '../../customer/customer.service';
import { MatDialog } from '@angular/material/dialog';
import { NotifierService } from 'angular-notifier';
import { CustomerFormDialogComponent } from '../../customer/customer-form-dialog/customer-form-dialog.component';
import { CustomerPopupDeleteDialogComponent } from '../../customer/customer-popup-delete-dialog/customer-popup-delete-dialog.component';
import { Doctor } from '../doctor.model';
import { DoctorService } from '../doctor.service';
import { DoctorFormDialogComponent } from '../doctor-form-dialog/doctor-form-dialog.component';

@Component({
  selector: 'app-doctor-tab-info',
  templateUrl: './doctor-tab-info.component.html',
  styleUrls: ['./doctor-tab-info.component.css']
})
export class DoctorTabInfoComponent implements OnInit {

  @Input() doctor: Doctor;

  sexHeader = {
    '1': 'Nam',
    '0': 'Nữ',
  };

  constructor(
    private doctorService: DoctorService,
    private dialog: MatDialog,
    private notifyService: NotifierService
  ) { }

  ngOnInit(): void {
  }

  loadDoctor(id) {
    this.doctorService.getDetail(id, 'province,ward').subscribe(res => {
      this.doctor = res;
    });
  }

  openCustomerFormDialog(id) {
    const obj = {
      action: 'Update',
      title: 'Cập nhật bác sĩ',
      doctor_id: id,
    };

    const dialogRef = this.dialog.open(DoctorFormDialogComponent, {
      data: obj,
      width: '60%',
      minHeight: '80%',
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadDoctor(result.id);
      }
    });
  }

  openDeleteCustomer(id) {

    // let obj = {
    //   action: 'Delete',
    //   title: 'Xóa khách hàng',
    //   customer_id: id,
    // };
    //
    // const dialogRef = this.dialog.open(CustomerPopupDeleteDialogComponent, {
    //   data: obj,
    //   width: '20%',
    //   minHeight: '80%',
    // });
    //
    // dialogRef.afterClosed().subscribe(result => {
    //
    // });
  }

  lock() {
    this.doctorService.lock(this.doctor.id).subscribe(x => {
      this.doctor.status = '9';
      this.notifyService.notify('success', 'Đã khóa thành công!');
    });
  }

  activate() {
    this.doctorService.activate(this.doctor.id).subscribe(x => {
      this.doctor.status = '10';
      this.notifyService.notify('success', 'Đã kích hoạt thành công!');
    });
  }

}
