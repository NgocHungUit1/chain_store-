import {Component, Inject, OnInit, Optional} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material/dialog';
import {NotifierService} from 'angular-notifier';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {TimesheetService} from '../timesheet.service';
import {EmployeeService} from '../../employee/employee.service';
import {Employee, EmployeeFilter} from '../../employee/employee.model';
import {Observable} from 'rxjs/Observable';
import * as moment from 'moment';
import {map, startWith} from 'rxjs/operators';
import {TimesheetConfirmDeleteClockingDialogComponent} from '../timesheet-confirm-delete-clocking-dialog/timesheet-confirm-delete-clocking-dialog.component';

@Component({
  selector: 'app-timesheet-form-delete-clocking-dialog',
  templateUrl: './timesheet-form-delete-clocking-dialog.component.html',
  styleUrls: ['./timesheet-form-delete-clocking-dialog.component.css']
})
export class TimesheetFormDeleteClockingDialogComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<TimesheetFormDeleteClockingDialogComponent>,
    public notifySer: NotifierService,
    private fb: FormBuilder,
    private timesheetService: TimesheetService,
    private employeeService: EmployeeService,
    private dialog: MatDialog,
  ) {}

  form: FormGroup;
  loading = false;
  employee_id: string;
  shiftsList: any;

  employeeFilter: EmployeeFilter = new EmployeeFilter();
  filteredEmployee: Observable<any[]>;
  dataSelectEmployee: Employee[];


  columnsHeader = {
    'name': 'Tên nhân viên',
    'user_name': 'Tên tài khoản',
    'phone_number': 'Số điện thoại',
    'email': 'Email',
    'actions': '',
  };

  displayColumns: string[] = [
    'name',
    'user_name',
    'phone_number',
    'email',
    'actions'
  ];

  statusClockingList = [
    {
      'value': '1',
      'name': 'Chưa vào - Chưa ra',

    },
    {
      'value': '2',
      'name': 'Chưa vào - Đã ra',
    },
    {
      'value': '3',
      'name': 'Đã vào - Chưa ra',
    },
    {
      'value': '4',
      'name': 'Đã vào - Đã ra',
    },
    {
      'value': '0',
      'name': 'Nghỉ',
    },
  ];


  employees: any = [];


  onNoClick(): void {
    this.dialogRef.close();
  }

  initForm() {
    this.form = this.fb.group({
      shifts_id: [''],
      from_date: [moment().startOf('month').format('YYYY-MM-DD'), Validators.required],
      to_date: [moment().endOf('month').format('YYYY-MM-DD'), Validators.required],
      status: [null],
      employee_ids: [null],
      employee: [null, null],
    });
  }

  ngOnInit(): void {

    this.initForm();

    this.getShiftsList();

    this.getListEmployee();
    this.filteredEmployee = this.form.controls['employee'].valueChanges
      .pipe(
        startWith(''),
        map(value => typeof value === 'string' ? value : value?.name),
        map(name => name ? this._filteredEmployee(name) : this.employees.slice())
      );


  }

  _filteredEmployee(name: string) {
    if (typeof name === 'string') {
      return this.employees.filter(
        employee => employee.name.toLowerCase().indexOf(name.toLowerCase()) >= 0
      );
    }
  }

  submit() {
    if (this.form.valid) {
      const data = this.form.getRawValue();
      data['from_date'] = moment(data['from_date']).format('YYYY-MM-DD');
      data['to_date'] = moment(data['to_date']).format('YYYY-MM-DD');

      this.timesheetService.deleteClocking(data).subscribe(res => {
        this.notifySer.notify('success', 'Xóa chi tiết ca làm việc thành công!');
        this.dialogRef.close(res);
      }, (error) => {
        if (error.status === 422) {
          this.ajaxValidate(error);
        }
      });
    }
  }

  public ajaxValidate(error) {
    if (error.error) {
      if (this.form instanceof FormGroup) {
        const _fields = this.form.controls;
        Object.keys(_fields).forEach(key => {
          const errorField = error.error.find(x => x.field === key);
          if (errorField) {
            this.form.controls[key].setErrors({
              ajaxValidator: {
                value: errorField.message,
              }
            });
          }
        });
      }
    }
  }

  getShiftsList() {
    this.timesheetService.getShiftsList().subscribe(res => {
      this.shiftsList = res.body;
    });
  }

  getListEmployee() {
    this.employeeFilter.isNotPageSize = true;
    this.employeeService.getList(this.employeeFilter).subscribe(res => {
      this.employees = res.body;
      const arrEmployeeId = this.form.controls['employee_ids'].value;
      if (arrEmployeeId) {
        const self = this;
        arrEmployeeId.forEach(function (id) {
          const employee = res.body.find(x => x.id === id);
          if (employee) {
            self.addEmployee(employee);
          }
        });
      }
    });
  }

  displayEmployee(employee?: Employee): string | undefined {
    return employee ? employee.name : undefined;
  }


  public addEmployee(employee) {

    if (!this.dataSelectEmployee) {
      this.dataSelectEmployee = [];
    }
    if (!this.form.controls['employee_ids'].value) {
      this.form.controls['employee_ids'].setValue([]);
    }

    const checkExitEmployee =  this.dataSelectEmployee.find(x => x.id === employee.id);
    if (!checkExitEmployee) {
      this.dataSelectEmployee.push(employee);
      this.dataSelectEmployee = [...this.dataSelectEmployee];

      const arrId = this.form.controls['employee_ids'].value;
      if (!arrId.find(id => id === employee.id)) {
        arrId.push(employee.id);
      }

      this.form.controls['employee_ids'].setValue(arrId);
      console.log(this.form.getRawValue());
    }
  }

  removeEmployee(employee) {
    this.dataSelectEmployee =  this.dataSelectEmployee.filter(e => e.id !== employee.id);
    const arrId = this.form.controls['employee_ids'].value.filter(id => id !== employee.id);
    this.form.controls['employee_ids'].setValue(arrId);
  }

  openDialogConfirm() {
    const obj = {
      title: 'Xác nhận',
      desc: 'Bạn có chắc chắn muốn hủy các Chi tiết ca làm việc này của nhân viên?',
    };

    const dialogRef = this.dialog.open(TimesheetConfirmDeleteClockingDialogComponent, {
      data: obj,
      width: '30%',
      minHeight: '80%',
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result.event === 'Delete') {
        this.submit();
      }
    });
  }

}
