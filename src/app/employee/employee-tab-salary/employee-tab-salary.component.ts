import {Component, Input, OnInit} from '@angular/core';
import {Employee} from '../employee.model';
import {EmployeeFormDialogComponent} from '../employee-form-dialog/employee-form-dialog.component';
import {EmployeeService} from '../employee.service';
import {MatDialog} from '@angular/material/dialog';
import {NotifierService} from 'angular-notifier';
import {TimesheetService} from '../../timesheet/timesheet.service';

@Component({
  selector: 'app-employee-tab-salary',
  templateUrl: './employee-tab-salary.component.html',
  styleUrls: ['./employee-tab-salary.component.css']
})
export class EmployeeTabSalaryComponent implements OnInit {

  @Input() employee: Employee;

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
  shiftsList: any = [];
  mainSalaryRuleValue: any;

  constructor(
    private employeeService: EmployeeService,
    private dialog: MatDialog,
    private notifyService: NotifierService,
    private timesheetService: TimesheetService,
  ) {
  }

  ngOnInit(): void {
    this.getShiftsList();
    if (this.employee.payRateItem) {
      const self = this;
      if (this.employee.payRateItem['listPayRateDetail'].length > 0) {
        this.employee.payRateItem['listPayRateDetail'].forEach(function (item) {
          if (item['rule_type'] === 'main_salary_rule') {
            self.mainSalaryRuleValue = JSON.parse(item['rule_value']);
          }
        });
      }
    }
  }

  loadEmployee(id) {
    this.employeeService.getDetail(id).subscribe(res => {
      if (res.payRateItem) {
        const self = this;
        if (res.payRateItem['listPayRateDetail'].length > 0) {
          res.payRateItem['listPayRateDetail'].forEach(function (item) {
            if (item['rule_type'] === 'main_salary_rule') {
              self.mainSalaryRuleValue = JSON.parse(item['rule_value']);
            }
          });
        }
      }
    });
  }

  openEmployeeFormDialog(id) {
    const obj = {
      action: 'Update',
      title: 'Cập nhật nhân viên',
      employee_id: id,
      is_salary: true
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

  getNameSalaryPeriod(id) {
    if (!id) {
      return  '';
    }
    const item = this.salaryPeriods.find( item => item.id === id);
    if (item) {
      return item.title;
    }
    return '';
  }

  getNameSalaryType(id) {
    if (!id) {
      return  '';
    }
    const item = this.salaryTypes.find(item => item.id === id);
    if (item) {
      return item.title;
    }
    return '';
  }

  getShiftsList() {
    this.timesheetService.getShiftsList().subscribe(res => {
      this.shiftsList = res.body;
    });
  }

  getNameShifts(id) {
    if (!id) {
      return  '';
    }
    // tslint:disable-next-line:no-shadowed-variable
    const item = this.shiftsList.find( item => item.id === id);
    if (item) {
      return item.name;
    }
    return '';
  }

}
