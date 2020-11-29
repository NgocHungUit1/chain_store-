import {Component, Injectable, OnInit, ViewChild} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {ActivatedRoute} from '@angular/router';
import {NotifierService} from 'angular-notifier';
import {MatPaginator} from '@angular/material/paginator';
import {MatSort} from '@angular/material/sort';
import {TimesheetService} from '../timesheet.service';
import {ListComponentBase} from '../../shared/base';
import {TimesheetFormDialogComponent} from '../timesheet-form-dialog/timesheet-form-dialog.component';
import {ShiftsFormDialogComponent} from '../../shifts/shifts-form-dialog/shifts-form-dialog.component';
import {Clocking, ClockingFilter} from '../../clocking/clocking.model';
import {ClockingService} from '../../clocking/clocking.service';
import {ShiftsService} from '../../shifts/shifts.service';
import * as moment from 'moment';
import {MatCalendar} from '@angular/material/datepicker';
import {ClockingFormDialogComponent} from '../../clocking/clocking-form-dialog/clocking-form-dialog.component';
import {EmployeeService} from '../../employee/employee.service';
import {EmployeeFilter} from '../../employee/employee.model';
import {EmployeeFormDialogComponent} from '../../employee/employee-form-dialog/employee-form-dialog.component';

@Component({
  selector: 'app-timesheet-main',
  templateUrl: './timesheet-main.component.html',
  styleUrls: ['./timesheet-main.component.css']
})
export class TimesheetMainComponent extends ListComponentBase implements OnInit {

  constructor(
    private timesheetService: TimesheetService,
    private clockingService: ClockingService,
    private shiftsService: ShiftsService,
    private employeeService: EmployeeService,
    private dialog: MatDialog,
    private route: ActivatedRoute,
    private notifyService: NotifierService
  ) {
    super();
  }

  apiFilter: ClockingFilter;
  employeeFilter: EmployeeFilter = new EmployeeFilter();

  dataSource = [];
  shiftsList: any = [];
  employeeList: any = [];
  expandedElement: Clocking | null;
  arrShiftsSearch = [];
  arrEmployeeSearch = [];

  selectedStatusClocking = [];

  listTypeDate: any[] = [
    {
      'id': 'day',
      'name': 'Ngày'
    },
    {
      'id': 'week',
      'name': 'Tuần'
    },
    {
      'id': 'month',
      'name': 'Tháng'
    }
  ];

  statusClockingSelect = ['0', '1', '2', '3', '4'];
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

  listNameWeekday: any[] = [
    {
      'name_day_week': 'Chủ nhật',
      'name_month': 'CN',
    },
    {
      'name_day_week': 'Thứ 2',
      'name_month': 'T2',
    },
    {
      'name_day_week': 'Thứ 3',
      'name_month': 'T3',
    },
    {
      'name_day_week': 'Thứ 4',
      'name_month': 'T4',
    },
    {
      'name_day_week': 'Thứ 5',
      'name_month': 'T5',
    },
    {
      'name_day_week': 'Thứ 6',
      'name_month': 'T6',
    },
    {
      'name_day_week': 'Thứ 7',
      'name_month': 'T7',
    },
  ];

  typeDateTimeSheet = 'week';
  listDayTimeSheet = [];

  dateNowTimesheet = moment().format('YYYY-MM-DD');


  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatCalendar) calendar: MatCalendar<Date>;

  isLoadingResults = false;
  isRateLimitReached = false;

  buildFilterFromParams(): ClockingFilter {
    function write<K extends keyof ClockingFilter>(arg: ClockingFilter, key: K, value: ClockingFilter[K]): void {
      arg[key] = value;
    }

    const filter = new ClockingFilter();
    const objectKeys = Object.keys(filter) as Array<keyof ClockingFilter>;

    for (const attr of objectKeys) {
      write(filter, attr, this.route.snapshot.queryParams['ClockingSearch[' + attr + ']']);
    }
    filter.page = this.route.snapshot.queryParams['page'];
    filter.pageSize = this.route.snapshot.queryParams['pageSize'];
    filter.sort = this.route.snapshot.queryParams['sort'];
    return filter;
  }

  loadData(): void {
    this.isLoadingResults = true;
    this.apiFilter.status = this.statusClockingSelect;
    this.apiFilter.employee_ids = this.arrEmployeeSearch.toString();
    this.apiFilter.shifts_ids = this.arrShiftsSearch.toString();
    this.apiFilter.start_date = moment(this.dateNowTimesheet).startOf('month').format('YYYY-MM-DD');
    this.apiFilter.end_date = moment(this.dateNowTimesheet).endOf('month').add(1, 'days').format('YYYY-MM-DD');
    this.clockingService.getList(this.apiFilter).subscribe(res => {
      this.dataSource = res.body;
      this.reloadFilter(res);
      this.isLoadingResults = false;
    });
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if (params['employee_id']) {
        this.arrEmployeeSearch.push(params['employee_id']);
      }
    });
    this.apiFilter = this.buildFilterFromParams();
    this.loadData();

    this.getShiftsList();

    this.getListEmployee();

    this.changDateTypeTimeSheet();

    this.clockingService.subscribeLoadClocking.subscribe(action => {
      if (action === true) {
        this.apiFilter = this.buildFilterFromParams();
        this.loadData();
        this.clockingService.setLoadClocking(false);
      }
    });
  }

  openTimeSheetFormDialog(shiftsId = null, date = null, employeeId = null) {
    let dateFormat;
    if (date == null) {
      dateFormat = this.dateNowTimesheet;
    } else {
      dateFormat = moment(date).format('YYYY-MM-DD');
    }
    const dialogRef = this.dialog.open(TimesheetFormDialogComponent, {
      width: '60%',
      minHeight: '60%',
      data: {
        shifts_id: shiftsId,
        date: dateFormat,
        employee_id: employeeId,
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadData();
      }
    });
  }

  getShiftsList() {
    this.timesheetService.getShiftsList().subscribe(res => {
      this.shiftsList = res.body;
    });
  }

  getListEmployee() {
    this.employeeFilter.isNotPageSize = true;
    this.employeeService.getList(this.employeeFilter).subscribe(res => {
      this.employeeList = res.body;
    });
  }

  openShiftsFormDialog(shiftsId = null) {
    let dialogRef;
    if (shiftsId) {
       dialogRef = this.dialog.open(ShiftsFormDialogComponent, {
        width: '50%',
        minHeight: '50%',
        data :  {
          shifts_id: shiftsId
        }
      });
    } else {
      dialogRef = this.dialog.open(ShiftsFormDialogComponent, {
        width: '50%',
        minHeight: '50%'
      });

    }
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.getShiftsList();
      }
    });
  }

  getListEmployeeShifts(shiftsId) {
    let result;
    switch (this.typeDateTimeSheet) {
      case 'day':
        result = this.dataSource.filter(item => item.timesheet.shifts_id === shiftsId
          && moment(this.dateNowTimesheet).format('YYYY-MM-DD') === moment(item.start_time).format('YYYY-MM-DD'));
        break;
      case 'week':
        result = this.dataSource.filter(item => item.timesheet.shifts_id === shiftsId
          && moment(item.start_time).format('YYYY-MM-DD') >= moment(this.dateNowTimesheet).weekday(1).format('YYYY-MM-DD')
          && moment(item.end_time).format('YYYY-MM-DD') <= moment(this.dateNowTimesheet).weekday(7).format('YYYY-MM-DD'));
        break;
      case 'month':
        result = this.dataSource.filter(item => item.timesheet.shifts_id === shiftsId);
        break;
    }
    const data = [];
    result.forEach(function (item) {
      if (!data.find(x => x.id === item.timesheet.employee_id)) {
        data.push(item.timesheet.employee);
      }
    });
    return data;

  }

  changDateTypeTimeSheet() {
    this.listDayTimeSheet = [];
    if (this.typeDateTimeSheet === 'day') {
      this.listDayTimeSheet.push(moment(this.dateNowTimesheet));
    } else if (this.typeDateTimeSheet === 'week') {
      for (let i = 0; i < 7; i++) {
        this.listDayTimeSheet.push(moment(this.dateNowTimesheet).weekday(i + 1));
      }
    } else if (this.typeDateTimeSheet === 'month') {
      for (let i = 0; i < moment(this.dateNowTimesheet).daysInMonth(); i++) {
        this.listDayTimeSheet.push(moment(this.dateNowTimesheet).startOf('month').add(i, 'days'));
      }
    }

  }

  getNameWeekday(date) {
    if (this.typeDateTimeSheet !== 'month') {
      return this.listNameWeekday[date.weekday()].name_day_week;
    }
    return this.listNameWeekday[date.weekday()].name_month;
  }

  changeDateSelect(event) {
    let typeSub;
    switch (this.typeDateTimeSheet) {
      case 'day':
        typeSub = 'days';
        break;
      case 'week':
        typeSub = 'week';
        break;
      case 'month':
        typeSub = 'month';
        break;
    }

    if (event === 'next') {
      this.dateNowTimesheet = moment(this.dateNowTimesheet).add(1, typeSub).format('YYYY-MM-DD');
    } else {
      this.dateNowTimesheet = moment(this.dateNowTimesheet).subtract(1, typeSub).format('YYYY-MM-DD');
    }
    switch (this.typeDateTimeSheet) {
      case 'week':
        if (moment().weeks() === moment(this.dateNowTimesheet).weeks()) {
          this.dateNowTimesheet = moment().format('YYYY-MM-DD');
        } else {
          this.dateNowTimesheet = moment(this.dateNowTimesheet).weekday(1).format('YYYY-MM-DD');
        }
        this.loadData();
        break;
      case 'month':
        if (moment().month() === moment(this.dateNowTimesheet).month()) {
          this.dateNowTimesheet = moment().format('YYYY-MM-DD');
        } else {
          this.dateNowTimesheet = moment(this.dateNowTimesheet).startOf('month').format('YYYY-MM-DD');
        }
        this.loadData();
        break;
    }
    this.changDateTypeTimeSheet();
    this.calendar.activeDate =  moment(this.dateNowTimesheet).toDate();
  }

  clockingEmployeeDay(shiftsId, employeeId, date) {
    return this.dataSource.find(item => item.timesheet.shifts_id === shiftsId &&
      item.timesheet.employee_id === employeeId &&
      moment(date).format('YYYY-MM-DD') === moment(item.start_time).format('YYYY-MM-DD'));
  }

  backgroundClockingEmployeeDay(shiftsId, employeeId, date) {
    const clocking = this.dataSource.find(item => item.timesheet.shifts_id === shiftsId &&
      item.timesheet.employee_id === employeeId &&
      moment(date).format('YYYY-MM-DD') === moment(item.start_time).format('YYYY-MM-DD'));
    if (clocking) {
      return 'background-status-' + clocking.status;
    }
    return '';
  }


  openClockingFormDialog(clockingId) {
    const dialogRef = this.dialog.open(ClockingFormDialogComponent, {
      width: '60%',
      minHeight: '60%',
      data: {
        clocking_id: clockingId,
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadData();
      }
    });
  }

  onChangeSelectStatusSearch(event) {
    if (event.target.checked) {
      this.statusClockingSelect.push(event.target.value);
    } else {
      this.statusClockingSelect = this.statusClockingSelect.filter(value => value !== event.target.value);
    }
    this.loadData();
  }

  getShiftsListTimeSheet() {
    if (this.arrShiftsSearch && this.arrShiftsSearch.length > 0) {
      const self = this;
      const data = this.shiftsList.filter(function (item) {
         return self.arrShiftsSearch.indexOf(item.id) >= 0;
      });
      return data;
    }

    return this.shiftsList;
  }

  openEmployeeFormDialog() {
    const dialogRef = this.dialog.open(EmployeeFormDialogComponent, {
      width: '80%',
      minHeight: '80%',
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.getListEmployee();
      }
    });
  }
}
