import {Component, OnInit, ViewChild} from '@angular/core';
import {ListComponentBase} from '../../shared/base';
import {MatDialog} from '@angular/material/dialog';
import {ActivatedRoute} from '@angular/router';
import {NotifierService} from 'angular-notifier';
import {MatTable} from '@angular/material/table';
import {MatPaginator} from '@angular/material/paginator';
import {MatSort} from '@angular/material/sort';
import {EmployeeService} from '../employee.service';
import {Employee, EmployeeFilter} from '../employee.model';
import {animate, state, style, transition, trigger} from '@angular/animations';
import {EmployeeFormDialogComponent} from '../employee-form-dialog/employee-form-dialog.component';

@Component({
  selector: 'app-employees-list',
  templateUrl: './employee-list.component.html',
  styleUrls: ['./employee-list.component.css'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ]
})
export class EmployeeListComponent  extends ListComponentBase implements OnInit {

  constructor(
    private service: EmployeeService,
    private dialog: MatDialog,
    private route: ActivatedRoute,
    private notifyService: NotifierService
  ) {
    super();
  }

  @ViewChild(MatTable, { static: true }) table: MatTable<any>;

  apiFilter: EmployeeFilter;

  columnsHeader = {
    '#': '#',
    'name': 'Tên nhân viên',
    'user_name': 'Tên tài khoản',
    'phone_number': 'Số điện thoại',
    'email': 'Email',
    'id_card': 'Số CMND/CCCD',
  };

  displayedColumns: string[] = [
    '#',
    'name',
    'user_name',
    'phone_number',
    'email',
    'id_card',
  ];
  columnsToDisplay: string[] = [
    '#',
    'name',
    'user_name',
    'phone_number',
    'email',
    'id_card',
  ];

  dataSource = [];
  expandedElement: Employee | null;


  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  isLoadingResults = true;
  isRateLimitReached = false;

  buildFilterFromParams(): EmployeeFilter {
    function write<K extends keyof EmployeeFilter>(arg: EmployeeFilter, key: K, value: EmployeeFilter[K]): void {
      arg[key] = value;
    }

    const filter = new EmployeeFilter();
    const objectKeys = Object.keys(filter) as Array<keyof EmployeeFilter>;

    for (const attr of objectKeys) {
      write(filter, attr, this.route.snapshot.queryParams['EmployeeSearch[' + attr + ']']);
    }
    filter.page = this.route.snapshot.queryParams['page'];
    filter.pageSize = this.route.snapshot.queryParams['pageSize'];
    filter.sort = this.route.snapshot.queryParams['sort'];
    // filter.expand = 'province,district,ward,user,payRate';
    return filter;
  }

  loadData(): void {
    this.isLoadingResults = true;
    this.service.getList(this.apiFilter).subscribe(res => {
      this.dataSource = res.body;
      this.reloadFilter(res);
      this.isLoadingResults = false;
    });
  }

  ngOnInit(): void {
    this.apiFilter = this.buildFilterFromParams();
    this.loadData();

    this.service.subscribeLoadEmployees.subscribe(action => {
      if (action === true) {
        this.apiFilter = this.buildFilterFromParams();
        this.loadData();
        this.service.setLoadEmployees(false);
      }
    });
  }

  openEmployeesFormDialog() {
    const dialogRef = this.dialog.open(EmployeeFormDialogComponent, {
      width: '80%',
      minHeight: '80%',
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadData();
      }
    });
  }

}
