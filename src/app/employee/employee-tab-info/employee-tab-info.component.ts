import {Component, Input, OnInit} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {NotifierService} from 'angular-notifier';
import {Employee} from '../employee.model';
import {EmployeeService} from '../employee.service';
import {EmployeePopupDeleteDialogComponent} from '../employee-popup-delete-dialog/employee-popup-delete-dialog.component';
import {EmployeeFormDialogComponent} from '../employee-form-dialog/employee-form-dialog.component';

@Component({
  selector: 'app-employee-tab-info',
  templateUrl: './employee-tab-info.component.html',
  styleUrls: ['./employee-tab-info.component.css']
})
export class EmployeeTabInfoComponent implements OnInit {

  @Input() employee: Employee;

  sexHeader = {
    '1': 'Nam',
    '0': 'Nữ',
  };

  constructor(
    private employeeService: EmployeeService,
    private dialog: MatDialog,
    private notifyService: NotifierService
  ) {
  }

  ngOnInit(): void {
  }

  loadEmployee(id) {
    this.employeeService.getDetail(id).subscribe(res => {
      this.employee = res;
    });
  }

  openEmployeeFormDialog(id) {
    const obj = {
      action: 'Update',
      title: 'Cập nhật nhân viên',
      employee_id: id,
    };

    const dialogRef = this.dialog.open(EmployeeFormDialogComponent, {
      data: obj,
      width: '80%',
      minHeight: '80%',
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadEmployee(result.id);
      }
    });
  }

  openDeleteEmployee(id) {

    let obj = {
      action: 'Delete',
      title: 'Xóa nhân viên',
      employee_id: id,
    };

    const dialogRef = this.dialog.open(EmployeePopupDeleteDialogComponent, {
      data: obj,
      width: '20%',
      minHeight: '80%',
    });

    dialogRef.afterClosed().subscribe(result => {

    });
  }
}
