import {Component, Inject, OnInit, Optional} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {NotifierService} from 'angular-notifier';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import * as moment from 'moment';
import {TimesheetService} from '../timesheet.service';
import {Employee, EmployeeFilter} from '../../employee/employee.model';
import {EmployeeService} from '../../employee/employee.service';
import {Observable} from 'rxjs/Observable';
import {map, startWith} from 'rxjs/operators';

@Component({
  selector: 'app-timesheet-form-dialog',
  templateUrl: './timesheet-form-dialog.component.html',
  styleUrls: ['./timesheet-form-dialog.component.css'],
})

export class TimesheetFormDialogComponent implements OnInit {


  constructor(
    public dialogRef: MatDialogRef<TimesheetFormDialogComponent>,
    public notifySer: NotifierService,
    private fb: FormBuilder,
    private timesheetService: TimesheetService,
    private employeeService: EmployeeService,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: Object
  ) {

    this.local_data = {...data};
    if (this.local_data.timesheet_id) {
      this.timesheet_id = this.local_data.timesheet_id;
    } else {
      this.timesheet_id = null;
    }
    this.employee_id = this.local_data.employee_id;
    this.isCreateInEmployee = !!this.employee_id;
  }
  isCreateInEmployee: boolean;

  form: FormGroup;
  loading = false;
  local_data: any;
  timesheet_id: string;
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

  employees: any = [];

  showAllOption = false;

  statusItems: any[] = [
    // {
    //   'id': 9,
    //   'title': 'Tạm khóa'
    // },
    {
      'id': 10,
      'title': 'Đang hoạt động'
    }
  ];

  isRepeatTypeWeek = false;

  repeatEachList = [
    {'value': 1},
    {'value': 2},
    {'value': 3},
    {'value': 4},
    {'value': 5},
    {'value': 6},
    {'value': 7},
    {'value': 8},
    {'value': 9},
    {'value': 10},
  ];

  repeatTypes: any[] = [
    {
      'id': 'day',
      'name': 'Ngày'
    },
    {
      'id': 'week',
      'name': 'Tuần'
    }
  ];

  repeatDaysOfWeek = ['1', '2', '3', '4', '5', '6', '7']; // thứ 2 -> CN

  onNoClick(): void {
    this.dialogRef.close();
  }

  initForm() {
    this.form = this.fb.group({
      shifts_id: [this.local_data.shifts_id ? this.local_data.shifts_id : null, Validators.required],
      from_date: [this.local_data.date ? this.local_data.date :
        moment().format('YYYY-MM-DD'), Validators.required],
      to_date: [this.local_data.date ? this.local_data.date :
        moment().format('YYYY-MM-DD'), Validators.required],
      is_repeat: [false, Validators.required],
      repeat_type: [this.repeatTypes[0].id],
      repeat_each: [this.repeatEachList[0].value],
      repeat_days_of_week: [this.repeatDaysOfWeek],
      note: [null],
      status: [10, Validators.required],
      employee_ids: [this.employee_id ? [this.employee_id] : null, Validators.required],
      employee: [null, null],
      is_create_holiday: [false, null],
    });
  }

  ngOnInit(): void {

    this.initForm();

    this.getShiftsList();

    if (this.timesheet_id !== null && this.timesheet_id !== undefined) {
      this.loadTimesheet(this.timesheet_id);
    }

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

  loadTimesheet(id) {
    this.timesheetService.getDetail(id).subscribe(timesheet => {
      this.form.patchValue({
        shifts_id: timesheet['shifts_id'],
        from_date: timesheet['from_date'],
        to_date: timesheet['to_date'],
        is_repeat: timesheet['is_repeat'],
        repeat_type: timesheet['repeat_type'],
        repeat_each: timesheet['repeat_each'],
        repeat_days_of_week: timesheet['repeat_days_of_week'],
        note: timesheet['note'],
        status: timesheet['status'],
        is_create_holiday: timesheet['is_create_holiday'],
      });
      this.showTimesheetToDate();
    });
  }

  submit() {
    if (this.form.valid) {
      const data = this.form.getRawValue();
      data['from_date'] = moment(data['from_date']).format('YYYY-MM-DD');
      data['to_date'] = moment(data['to_date']).format('YYYY-MM-DD');
      if (data['to_date'] <  data['from_date']) {
        this.notifySer.notify('error', 'Ngày kết thúc không hợp lệ');
        return;
      }

      if (!data['is_repeat']) {
        data['to_date'] = data['from_date'];
        data['repeat_type'] = null;
        data['repeat_each'] = null;
        data['repeat_days_of_week'] = null;
        data['is_create_holiday'] = null;
        data['is_repeat'] = '0';
      }  else {
        if (data['repeat_type'] === this.repeatTypes[0].id) {
          data['repeat_days_of_week'] = null;
        }
        data['is_repeat'] = 1;
        data['is_create_holiday'] = data['is_create_holiday'] ? 1 : 0;
      }
      data['employee'] = null;


      if (data['employee_ids'] && data['employee_ids'].length === 0) {
        this.notifySer.notify('eror', 'Nhân viên không được bỏ trống!');
        return;
      }

      if (this.timesheet_id !== null && this.timesheet_id !== undefined) {
        this.timesheetService.update(this.timesheet_id, data).subscribe(res => {
          this.notifySer.notify('success', 'Cập nhật lich làm việc thành công!');
          this.dialogRef.close(res);
        }, (error) => {
          if (error.status === 422) {
            this.ajaxValidate(error);
          }
        });
      } else {
        if (this.isCreateInEmployee) {
          data['employee_id'] = data['employee_ids'][0];
          this.timesheetService.create(data).subscribe(res => {
            this.notifySer.notify('success', 'Thêm lịch làm việc thành công!');
            this.dialogRef.close(res);
          }, (error) => {
            if (error.status === 422) {
              this.ajaxValidate(error);
            }
          });
        } else {
          this.timesheetService.createMultipleEmployee(data).subscribe(res => {
            this.notifySer.notify('success', 'Thêm lịch làm việc thành công!');
            this.dialogRef.close(res);
          }, (error) => {
            if (error.status === 422) {
              this.ajaxValidate(error);
            }
          });
        }
      }
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

  showTimesheetToDate() {
    if (this.form.controls['is_repeat'].value) {
      this.showAllOption = true;
    } else {
      this.showAllOption = false;
    }
  }

  showWeekSelect(value) {
    if (value === this.repeatTypes[1].id) {
      this.isRepeatTypeWeek = true;
    } else {
      this.isRepeatTypeWeek = false;
    }
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

}
