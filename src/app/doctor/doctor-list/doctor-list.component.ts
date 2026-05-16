import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { ListComponentBase } from '../../shared/base';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { NotifierService } from 'angular-notifier';
import { DoctorService } from '../doctor.service';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { Doctor, DoctorFilter } from '../doctor.model';
import { DoctorFormDialogComponent } from '../doctor-form-dialog/doctor-form-dialog.component';
import {debounceTime} from 'rxjs/operators';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { DateFilter } from '../../invoice/invoice.model';
import {
  DatetimeDefaultFilterDialogComponent
} from '../datetime-default-filter-dialog/datetime-default-filter-dialog.component';
import { DatetimeChooseFilterDialogComponent } from '../datetime-choose-filter-dialog/datetime-choose-filter-dialog.component';

@Component({
  selector: 'app-doctor-list',
  templateUrl: './doctor-list.component.html',
  styleUrls: ['./doctor-list.component.css'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({height: '0px', minHeight: '0'})),
      state('expanded', style({height: '*'})),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ]
})
export class DoctorListComponent extends ListComponentBase implements OnInit {

  constructor(
    private service: DoctorService,
    private dialog: MatDialog,
    private route: ActivatedRoute,
    private notifyService: NotifierService,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef
  ) {
    super();
  }

  @ViewChild(MatTable, {static: true}) table: MatTable<any>;

  apiFilter: DoctorFilter;

  columnsHeader = {
    '#': '#',
    'name': 'Tên bác sĩ',
    'phone': 'Số điện thoại',
    'status': 'Trạng thái',
  };

  displayedColumns: string[] = [
    '#',
    'name',
    'phone',
    'status'
  ];
  columnsToDisplay: string[] = [
    '#',
    'name',
    'phone',
    'status'
  ];

  data: Doctor[] = [];
  itemDataSource = new MatTableDataSource<Doctor>([]);
  expandedElement: Doctor | null;


  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  isLoadingResults = true;
  isRateLimitReached = false;


  searchForm = new FormControl();
  timeFilter: FormGroup;
  titleTimeDefault = 'Tháng này';
  titleTimeChoose = 'Lựa chọn khác';
  currentDateFilter: DateFilter;

  statusFilter: FormGroup;
  statusFilterList = [
    {
      'value': '10',
      'name': 'Hoạt động',
    },
    {
      'value': '9',
      'name': 'Ngưng hoạt động',
    },
  ];


  buildFilterFromParams(): DoctorFilter {
    function write<K extends keyof DoctorFilter>(arg: DoctorFilter, key: K, value: DoctorFilter[K]): void {
      arg[key] = value;
    }

    const filter = new DoctorFilter();
    const objectKeys = Object.keys(filter) as Array<keyof DoctorFilter>;

    for (const attr of objectKeys) {
      write(filter, attr, this.route.snapshot.queryParams['DoctorSearch[' + attr + ']']);
    }
    filter.page = this.route.snapshot.queryParams['page'];
    filter.pageSize = this.route.snapshot.queryParams['pageSize'];
    filter.sort = this.route.snapshot.queryParams['sort'];
    filter.expand = 'province,ward';
    filter.status = this.statusFilter.controls['status'].value;
    return filter;
  }

  loadData(): void {
    this.isLoadingResults = true;
    this.service.getList(this.apiFilter).subscribe(res => {
      this.data = [...res.body];
      if (!this.itemDataSource) {
        this.itemDataSource = new MatTableDataSource<Doctor>(this.data);
      } else {
        this.itemDataSource.data = [...this.data];
        this.cdr.detectChanges();

      }
      this.reloadFilter(res);
      this.isLoadingResults = false;
    });
  }

  ngOnInit(): void {
    this.initDateFilter();
    this.buildFrom();
    this.apiFilter = this.buildFilterFromParams();
    this.loadData();

    this.searchForm.valueChanges.pipe(debounceTime(800)).subscribe(res => {
      if (res !== '') {
        this.apiFilter = this.buildFilterFromParams();
        this.apiFilter.keyword = res;
        this.loadData();
      } else {
        this.apiFilter = this.buildFilterFromParams();
        this.loadData();
      }
    });
  }

  buildFrom() {
    this.timeFilter = this.fb.group({
      typeTime: [
        'default'
      ],
    });

    this.statusFilter = this.fb.group({
      status: [
        ['10', '9']
      ],
    });
  }

  openDoctorFormDialog() {
    const dialogRef = this.dialog.open(DoctorFormDialogComponent, {
      width: '70%',
      minWidth: '600px',
      minHeight: '80%',
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadData();
      }
    });
  }
  openTimeDefault() {
    const obj = {};
    const dialogRef = this.dialog.open(DatetimeDefaultFilterDialogComponent, {
      data: obj,
      width: '40%',
      minHeight: '80%',
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result?.title !== undefined) {
        this.titleTimeDefault = result?.title;
      }
      const date = this.service.getDateFilter();
      const date_from = new Date(date.date_from);
      const date_to = new Date(date.date_to);
      this.titleTimeChoose = this.convertDate(date_from) + ' - ' + this.convertDate(date_to);
      this.timeFilter.patchValue({
        typeTime: 'default',
      });
    });
  }

  openTimeChoose() {
    const obj = {};
    const dialogRef = this.dialog.open(DatetimeChooseFilterDialogComponent, {
      data: obj,
      width: '40%',
      minHeight: '80%',
    });

    dialogRef.afterClosed().subscribe(result => {

      this.timeFilter.patchValue({
        typeTime: 'choose',
      });
      const date = this.service.getDateFilter();
      const date_from = new Date(date.date_from);
      const date_to = new Date(date.date_to);
      this.titleTimeChoose = this.convertDate(date_from) + ' - ' + this.convertDate(date_to);
    });
  }

  radioTimeChange(event: Event) {
    if (this.timeFilter.controls['typeTime'].value === 'choose') {
      const date = this.service.getDateFilter();
      const date_from = new Date(date.date_from);
      const date_to = new Date(date.date_to);
      this.titleTimeChoose = this.convertDate(date_from) + ' - ' + this.convertDate(date_to);
    } else {
      this.titleTimeChoose = 'Lựa chọn khác';
    }
  }

  convertDate(date: Date) {
    const month = date.getMonth() + 1;
    return date.getDate() + '/' + month + '/' + date.getFullYear();
  }


  initDateFilter() {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    const first = new Date(year, month, 1);
    const obj = new DateFilter();
    // tháng này

    obj.date_from = this.service.convertDateYYYYMMDD(first);
    obj.date_to = this.service.convertDateYYYYMMDD(today);

    const date_from = new Date(obj.date_from);
    const date_to = new Date(obj.date_to);
    this.titleTimeChoose = this.convertDate(date_from) + ' - ' + this.convertDate(date_to);

    this.currentDateFilter = obj;
    this.service.setDateFilter(obj);
  }

  checkBoxFilterChange($event: any, value: any, field: string) {
    this.handleFilterCheckbox(this.statusFilter, field, value);
    this.apiFilter = this.buildFilterFromParams();
    this.loadData();
  }

  reloadTableData(): void {
    console.log('reloadTableData');
    this.loadData();
  }
}
