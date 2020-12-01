import {Component, Input, OnInit, ViewChild} from '@angular/core';
import {Employee, EmployeeFilter} from '../employee.model';
import {MatDialog} from '@angular/material/dialog';
import {ActivatedRoute} from '@angular/router';
import {NotifierService} from 'angular-notifier';
import {MatTable} from '@angular/material/table';
import {MatPaginator} from '@angular/material/paginator';
import {MatSort} from '@angular/material/sort';
import {ListComponentBase} from '../../shared/base';
import {TimesheetService} from '../../timesheet/timesheet.service';
import {TimesheetFilter} from '../../timesheet/timesheet.model';
import {EmployeeTimesheetPopupDeleteDialogComponent} from '../employee-timesheet-popup-delete-dialog/employee-timesheet-popup-delete-dialog.component';
import * as moment from 'moment';
import {TimesheetFormDialogComponent} from '../../timesheet/timesheet-form-dialog/timesheet-form-dialog.component';

@Component({
  selector: 'app-employee-time-sheet-list',
  templateUrl: './employee-time-sheet-list.component.html',
  styleUrls: ['./employee-time-sheet-list.component.css']
})
export class EmployeeTimeSheetListComponent  extends ListComponentBase implements OnInit {

  @Input() employee: Employee;

  constructor(
    private service: TimesheetService,
    private dialog: MatDialog,
    private route: ActivatedRoute,
    private notifyService: NotifierService
  ) {
    super();
  }

  @ViewChild(MatTable, { static: true }) table: MatTable<any>;

  apiFilter: TimesheetFilter;

  columnsHeader = {
    '#': '#',
    'from_date': 'Từ ngày',
    'to_date': 'Đến ngày',
    'shifts': 'Khung giờ làm',
    'note': 'Ghi chú',
    'actions': 'Hành động',
  };

  displayedColumns: string[] = [
    '#',
    'from_date',
    'to_date',
    'shifts',
    'note',
    'actions',
  ];

  dataSource = [];
  expandedElement: Employee | null;


  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  isLoadingResults = true;
  isRateLimitReached = false;

  buildFilterFromParams(): TimesheetFilter {
    function write<K extends keyof TimesheetFilter>(arg: TimesheetFilter, key: K, value: TimesheetFilter[K]): void {
      arg[key] = value;
    }

    const filter = new TimesheetFilter();
    const objectKeys = Object.keys(filter) as Array<keyof TimesheetFilter>;

    for (const attr of objectKeys) {
      write(filter, attr, this.route.snapshot.queryParams['TimesheetSearch[' + attr + ']']);
    }
    filter.page = this.route.snapshot.queryParams['page'];
    filter.pageSize = this.route.snapshot.queryParams['pageSize'] ? this.route.snapshot.queryParams['pageSize'] : 5;
    filter.sort = this.route.snapshot.queryParams['sort'];
    return filter;
  }

  loadData(): void {
    this.isLoadingResults = true;
    this.apiFilter.employee_id = this.employee.id;
    this.service.getList(this.apiFilter).subscribe(res => {
      this.dataSource = res.body;
      this.reloadFilter(res);
      this.isLoadingResults = false;
    });
  }

  ngOnInit(): void {
    this.apiFilter = this.buildFilterFromParams();
    this.loadData();

    this.service.subscribeLoadTimesheet.subscribe(action => {
      if (action === true) {
        this.apiFilter = this.buildFilterFromParams();
        this.loadData();
        this.service.setLoadTimesheet(false);
      }
    });
  }

  openDeleteTimesheet(id) {

    let obj = {
      action: 'Delete',
      title: 'Xóa lịch làm việc ',
      desc: 'Hệ thống sẽ giữ lại các Chi tiết ca làm việc đã được chấm công và hủy các Chi tiết ' +
        'ca làm việc chưa chấm công. Bạn có chắc chắn hủy lịch làm việc?',
      timesheet_id: id,

    };

    const dialogRef = this.dialog.open(EmployeeTimesheetPopupDeleteDialogComponent, {
      data: obj,
      width: '30%',
      minHeight: '80%',
    });
    dialogRef.afterClosed().subscribe(result => {
    });
  }


  openTimeSheetFormDialog(timesheetId = null) {
    const dateFormat = moment().format('YYYY-MM-DD');
    const dialogRef = this.dialog.open(TimesheetFormDialogComponent, {
      width: '60%',
      minHeight: '60%',
      data: {
        date: dateFormat,
        employee_id: this.employee.id,
        timesheet_id: timesheetId,
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.service.setLoadTimesheet(true);
      }
    });
  }



}
