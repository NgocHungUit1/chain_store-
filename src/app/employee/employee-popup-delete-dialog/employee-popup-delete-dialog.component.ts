import {Component, Inject, OnInit, Optional} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material/dialog';
import {CustomerService} from '../../customer/customer.service';
import {NotifierService} from 'angular-notifier';
import {EmployeeService} from '../employee.service';

@Component({
  selector: 'app-employee-popup-delete-dialog',
  templateUrl: './employee-popup-delete-dialog.component.html',
  styleUrls: ['./employee-popup-delete-dialog.component.css']
})
export class EmployeePopupDeleteDialogComponent implements OnInit {

  action: string;
  title: string;
  local_data: any;
  employee_id: string;

  constructor(
    public dialogRef: MatDialogRef<EmployeePopupDeleteDialogComponent>,
    private employeeService: EmployeeService,
    public notifySer: NotifierService,
    private dialog: MatDialog,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: Object) {
    this.local_data = { ...data };
    this.action = this.local_data.action;
    this.title = this.local_data.title;
    this.employee_id = this.local_data.employee_id;
  }

  ngOnInit(): void {
  }

  closeDialog() {
    this.dialogRef.close({ event: 'Cancel' });
  }

  delete() {
    console.log(this.employee_id);
    this.employeeService.delete(this.employee_id).subscribe(res => {
      this.notifySer.notify('success', 'Xóa nhân viên thành công!');
      this.employeeService.setLoadEmployees(true);
      this.dialogRef.close({ event: 'Delete' });
    });
  }


}
