import { Component, Inject, OnInit, Optional } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Location } from '../../location/location.model';
import { Observable } from 'rxjs/Observable';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { NotifierService } from 'angular-notifier';
import { LocationService } from '../../location/location.service';
import { map, startWith } from 'rxjs/operators';
import * as moment from 'moment';
import {EmployeeService} from '../employee.service';
import {UserService} from '../../user/user.service';
import {UserFilter} from '../../user/user.model';
import {UserFormDialogComponent} from '../../user/user-form-dialog/user-form-dialog.component';
import {BranchService} from '../../branch/branch.service';
import {BranchFilter} from '../../branch/branch.model';
import {TimesheetService} from '../../timesheet/timesheet.service';

class ImageSnippet {
  pending = false;
  status = 'init';

  constructor(public src: string, public file: File) {
  }
}

class SalaryHolidayItem {
  moneyTypes: number;  // 1: VND, 2: % tổng lương
  type: number; // 1: ngay nghi, 2:ngay le tet
  value: number;
  sort?: number;
}

class MainSalaryItem {
  default: number;
  mainSalaryHolidays: SalaryHolidayItem[];
  rank: number;
  shifts_id: number;
}

@Component({
  selector: 'app-employee-form-dialog',
  templateUrl: './employee-form-dialog.component.html',
  styleUrls: ['./employee-form-dialog.component.css']
})
export class EmployeeFormDialogComponent implements OnInit {

  form: FormGroup;
  loading = false;
  provinces: Location[] = [];
  wards: Location[] = [];
  filteredProvinces: Observable<any[]>;
  filteredWards: Observable<any[]>;
  local_data: any;
  employee_id: string;

  userFilter: UserFilter = new UserFilter();
  branchFilter: BranchFilter = new BranchFilter();
  users: any;
  branchList: any;

  selectedFile: ImageSnippet;
  url = '';
  selectTab;

  sexItems: any[] = [
    {
      'id': 1,
      'title': 'Nam'
    },
    {
      'id': 0,
      'title': 'Nữ'
    }
  ];

  shiftsList: any;
  salaryDefault = null;
  payRate: any = {
    salary_period: 1,
    mainSalaryRuleValue: {
      type: -1,
      details: [],
    },
    // allowanceRuleValue: {
    //   details: null,
    // },
    // deductionRuleValue: {
    //   details: null,
    // },
    // pay_rate_template_id: null
  };

  salaryPeriods: any[] = [
    {
      'id': 1,
      'title': 'Hàng tháng'
    },
    // {
    //   'id': 2,
    //   'title': '2 lần 1 tháng'
    // },
    // {
    //   'id': 3,
    //   'title': 'Hàng tuần'
    // },
    // {
    //   'id': 4,
    //   'title': '2 tuần 1 lần'
    // },
    // {
    //   'id': 5,
    //   'title': '2 Tủy chọn'
    // }
  ];

  salaryTypes: any[] = [
    {
      'id': 1,
      'title': 'Theo ca làm việc'
    },
    // {
    //   'id': 2,
    //   'title': 'Theo giờ làm việc'
    // },
    {
      'id': 3,
      'title': 'Theo ngày làm việc'
    },
    {
      'id': 4,
      'title': 'Cố định'
    },
  ];

  listMoneyTypes: any[] = [
    {
      'id': 1,
      'title': 'VND'
    },
    {
      'id': 2,
      'title': '%'
    },
  ];


  constructor(
    public dialogRef: MatDialogRef<EmployeeFormDialogComponent>,
    public notifySer: NotifierService,
    public locationSer: LocationService,
    private fb: FormBuilder,
    private employeeService: EmployeeService,
    private userService: UserService,
    private branchService: BranchService,
    private dialog: MatDialog,
    private timesheetService: TimesheetService,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: Object
  ) {

    this.local_data = {...data};
    this.employee_id = this.local_data.employee_id;
    this.selectTab = this.local_data.is_salary ? 1 : 0;

  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  initForm() {
    this.form = this.fb.group({
      name: [null, Validators.compose([
        Validators.required,
        Validators.maxLength(32)
      ])],
      image_url: [null, Validators.compose([
        Validators.maxLength(255)
      ])],
      id_card: [null, Validators.compose([
        Validators.maxLength(20)
      ])],
      birth_date: [null],
      user_id: [null, Validators.compose([
        Validators.required,
        Validators.maxLength(40)
      ])],
      phone_number: [null, Validators.compose([
        Validators.maxLength(20)
      ])],
      email: [null, Validators.compose([
        Validators.maxLength(60)
      ])],
      facebook: [null, Validators.compose([
        Validators.maxLength(60)
      ])],
      address: [null, Validators.compose([
        Validators.maxLength(100)
      ])],
      ward: [null],
      province: [null],
      note: [null],
      sex: [null],
      branches: [null, Validators.required],
    });
  }

  ngOnInit(): void {

    this.initForm();

    this.getListUser();

    this.getListBranch();

    this.getShiftsList();

    this.locationSer.autocomplete('', 'province').subscribe(locations => {
      this.provinces = locations;
    });

    this.filteredProvinces = this.form.controls['province'].valueChanges.pipe(
      startWith(''),
      map(province => (province ? this.filterProvince(province) : this.provinces.slice()))
    );

    this.filteredWards = this.form.controls['ward'].valueChanges.pipe(
      startWith(''),
      map(ward => (ward ? this.filterWard(ward) : this.wards.slice()))
    );

    if (this.employee_id !== null && this.employee_id !== undefined) {
      this.loadEmployee(this.employee_id);
    }

  }

  getListUser() {
    if (this.employee_id !== null && this.employee_id !== undefined) {
      this.userFilter.employee_id = this.employee_id;
    }
    this.userFilter.pageSize = 100;
    this.userFilter.not_employee = 1;
    this.userService.getList(this.userFilter).subscribe(res => {
      this.users = res.body;
    });
  }

  getListBranch() {
    this.branchFilter.pageSize = 100;
    this.branchService.getList(this.branchFilter).subscribe(res => {
      this.branchList = res.body;
    });
  }

  updateForm(id) {
    const user = this.users.find(x => x.id === id);
    if (user) {
      this.form.controls['phone_number'].setValue(user.phone_number);
      this.form.controls['email'].setValue(user.email);
      console.log(this.form.getRawValue());
    }
  }

  loadEmployee(id) {
    this.employeeService.getDetail(id).subscribe(employee => {
      let birthDate = null;
      if (employee['birth_date'] !== null) {
        birthDate = new Date(employee['birth_date']).toISOString();
      }
      this.form.patchValue({
        user_id: employee['user_id'],
        name: employee['name'],
        phone_number: employee['phone_number'],
        email: employee['email'],
        id_card: employee['id_card'],
        image_url: employee['image_url'],
        address: employee['address'],
        ward: employee['ward'],
        province: employee['province'],
        note: employee['note'],
        facebook: employee['facebook'],
        birth_date: birthDate,
        sex: employee['sex'],
        branches: employee['branchList']['array'],
      });
      const resPayRate = employee['payRateItem'];
      const self = this;
      if (resPayRate) {
        this.payRate.salary_period = resPayRate['salary_period'];
        // this.payRate.pay_rate_template_id = resPayRate['pay_rate_template_id'];
        if (resPayRate['listPayRateDetail'].length > 0 ) {
          resPayRate['listPayRateDetail'].forEach(function (item) {
           if (item['rule_type'] === 'main_salary_rule') {
             self.payRate.mainSalaryRuleValue = JSON.parse(item['rule_value']);
             self.salaryDefault = self.payRate.mainSalaryRuleValue.details[0].default;
           }
           // else if (item['rule_type'] === 'deduction_rule') {
           //   self.payRate.deductionRuleValue = JSON.parse(item['rule_value']);
           // } else if (item['rule_type'] === 'allowance_rule') {
           //   self.payRate.allowanceRuleValue = JSON.parse(item['rule_value']);
           // }
          });
        }
      }

      if (employee['province_id'] !== null) {
        this.locationSer.autocomplete('', 'ward', employee['province_id']).subscribe(locations => {
          this.wards = locations;
        });
      }

    });
  }

  filterProvince(name: string) {
    if (typeof name === 'string') {
      return this.provinces.filter(
        province => province.name.toLowerCase().indexOf(name.toLowerCase()) >= 0
      );
    }
  }

  filterWard(name: string) {
    if (typeof name === 'string') {
      return this.wards.filter(
        ward => ward.name.toLowerCase().indexOf(name.toLowerCase()) >= 0
      );
    }
  }

  displayLocation(location?: Location): string | undefined {
    return location ? location.name : undefined;
  }

  submit() {
    if (this.form.valid) {
      const data = this.form.getRawValue();

      if (data['birth_date'] !== null) {
        const momentDate = new Date(data['birth_date']); // Replace event.value with your date value
        data['birth_date'] = moment(momentDate).format('YYYY-MM-DD');
      }

      if (data['province'] !== null) {
        data['province_id'] = data['province'].id;
      }
      if (data['ward'] !== null) {
        data['ward_id'] = data['ward'].id;
      }

      for ( let i = 0; i < this.payRate.mainSalaryRuleValue.details.length; i++) {
        if (this.payRate.mainSalaryRuleValue.type === 1
          && this.payRate.mainSalaryRuleValue.details[i].rank !== 0
          && this.payRate.mainSalaryRuleValue.details[i].shifts_id == null) {
          this.notifySer.notify('error', 'Vui lòng chọn ca làm việc');
          return;
        }
        if (this.payRate.mainSalaryRuleValue.details[i].default == 0 ||
          this.payRate.mainSalaryRuleValue.details[i].default == null) {
          this.notifySer.notify('error', 'Vui lòng nhập tiền lương');
          return;
        }
      }
      data['payRate'] = this.payRate;

      if (this.employee_id !== null && this.employee_id !== undefined) {
        this.employeeService.update(this.employee_id, data).subscribe(res => {
          this.notifySer.notify('success', 'Cập nhật nhân viên thành công!');
          this.dialogRef.close(res);
        }, (error) => {
          if (error.status === 422) {
            this.ajaxValidate(error);
          }
        });
      } else {
        this.employeeService.create(data).subscribe(res => {
          this.notifySer.notify('success', 'Thêm nhân viên thành công!');
          this.dialogRef.close(res);
        }, (error) => {
          if (error.status === 422) {
            this.ajaxValidate(error);
          }
        });
      }
    }
  }

  onProvinceChange(province) {
    this.form.controls['province'].setValue(province);
    this.form.patchValue({
      ward: null
    });
    this.wards = [];
    if (province !== null) {
      this.locationSer.autocomplete('', 'ward', province.id).subscribe(locations => {
        this.wards = locations;
      });
    }
  }

  openUserFormDialog() {
    const dialogRef = this.dialog.open(UserFormDialogComponent, {
      width: '50%',
      minHeight: '80%',
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.getListUser();
        this.form.controls['user_id'].setValue(result.id);
        this.form.controls['phone_number'].setValue(result.phone_number);
        this.form.controls['email'].setValue(result.email);
      }
    });
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


  onSuccess() {
    this.selectedFile.pending = false;
    this.selectedFile.status = 'ok';
  }

  onError() {
    this.selectedFile.pending = false;
    this.selectedFile.status = 'fail';
    this.selectedFile.src = '';
  }

  processFile(imageInput: any) {
    const file: File = imageInput.files[0];
    const reader = new FileReader();

    reader.addEventListener('load', (event: any) => {
      this.selectedFile = new ImageSnippet(event.target.result, file);
      this.onSuccess();
      this.url = event.target.result;
      // this.selectedFile.pending = true;
      // this.imageService.uploadImage(this.selectedFile.file).subscribe(
      //   (res) => {
      //     this.onSuccess();
      //   },
      //   (err) => {
      //     this.onError();
      //   })
    });
    if (file) {
      reader.readAsDataURL(file);
    }
  }

  getShiftsList() {
    this.timesheetService.getShiftsList().subscribe(res => {
      this.shiftsList = res.body;
    });
  }

  changeTypeSalary(value) {
    this.payRate.mainSalaryRuleValue.details = [];
    const item = new MainSalaryItem();
    item.default = null;
    if (value === 1) {
      item.mainSalaryHolidays = [
        {value: 100, moneyTypes: 2, sort: 0, type: 1}, // ngay nghi
        {value: 100, moneyTypes: 2, sort: 1, type: 2}, // ngay le
      ];

    } else {
      item.mainSalaryHolidays = null;

    }
    item.rank = 0;
    item.shifts_id = null;
    this.payRate.mainSalaryRuleValue.details.push(item);
  }

  updateSalaryAdvanced(value) {
    console.log(value);
    this.payRate.mainSalaryRuleValue.details[0].default = value;
  }

  addMainSalary() {
    const item = new MainSalaryItem();
    item.default = null;
    item.mainSalaryHolidays = [
      {value: 100, moneyTypes: 2, sort: 0, type: 1}, // ngay nghi
      {value: 100, moneyTypes: 2, sort: 0, type: 2}, // ngay le
    ];
    item.rank = this.payRate.mainSalaryRuleValue.details.length !== 0 ? Math.max(...this.payRate.mainSalaryRuleValue.details.map(a => a.rank)) + 1 : 0;
    item.shifts_id = null;
    this.payRate.mainSalaryRuleValue.details.push(item);
    this.payRate.mainSalaryRuleValue.details = [...this.payRate.mainSalaryRuleValue.details];
  }

  deleteMainSalary(rank) {
    this.payRate.mainSalaryRuleValue.details = this.payRate.mainSalaryRuleValue.details.filter(item => item.rank !== rank);
  }

  changeShiftSalary(shifts_id, rank) {
    const data = this.payRate.mainSalaryRuleValue.details.filter(item => item.shifts_id === shifts_id);
    if (data.length > 1) {
      this.deleteMainSalary(rank);
      this.notifySer.notify('error', 'Ca làm việc này đã được chọn trước đó');
    }

  }

}
