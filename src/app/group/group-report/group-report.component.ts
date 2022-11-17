import { GroupFormDialogComponent } from '../group-form-dialog/group-form-dialog.component';
import { Component, OnInit, ViewChild } from '@angular/core';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { NotifierService } from 'angular-notifier';
import { MatTable } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { debounceTime } from 'rxjs/operators';
import { ListComponentBase } from '../../shared/base';
import { GroupService } from '../../product/group.service';
import { UserService } from '../../user/user.service';
import { GroupFilter } from '../../product/group.model';
import { Group } from '../group.model';
import { DateFilter } from '../../invoice/invoice.model';
import { InvoiceService } from '../../invoice/invoice.service';
import { DatetimeChooseFilterDialogComponent } from '../../invoice/datetime-choose-filter-dialog/datetime-choose-filter-dialog.component';
import { DatetimeDefaultFilterDialogComponent } from '../../invoice/datetime-default-filter-dialog/datetime-default-filter-dialog.component';


@Component({
  selector: 'app-group-report',
  templateUrl: './group-report.component.html',
  styleUrls: ['./group-report.component.css'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ]
})
export class GroupReportComponent extends ListComponentBase implements OnInit {

  constructor(
      private service: GroupService,
      private dialog: MatDialog,
      private route: ActivatedRoute,
      private notifyService: NotifierService,
      private userService: UserService,
      private serviceInvoice: InvoiceService,
      private fb: FormBuilder,
  ) {
    super();
  }

  @ViewChild(MatTable, {static: true}) table: MatTable<any>;

  apiFilter: GroupFilter;
  searchKeyWord = new FormControl();

  columnsHeader = {
    '#': '#',
    'name': 'Tên nhóm hàng',
    'sl_ban': 'Số lượng bán',
    'doanh_thu': 'Doanh thu',
    'sl_tra': 'SL trả',
    'gia_tri_tra': 'Gía trị trả',
    'tong_gia_von': 'Tổng giá vốn',
  };


  displayedColumns: string[] = [
    '#',
    'name',
    'sl_ban',
    'doanh_thu',
    'sl_tra',
    'gia_tri_tra',
    'tong_gia_von',
  ];
  columnsToDisplay: string[] = [
    '#',
    'name',
    'sl_ban',
    'doanh_thu',
    'sl_tra',
    'gia_tri_tra',
    'tong_gia_von',
  ];


  dataSource = [];

  timeFilter: FormGroup;
  currentDateFilter: DateFilter;

  titleTimeDefault = 'Tháng này';
  titleTimeChoose = 'Lựa chọn khác';

  expandedElement: Group | null;


  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  isLoadingResults = true;
  isRateLimitReached = false;


  radioTimeChange(event: Event) {
    if (this.timeFilter.controls['typeTime'].value === 'choose') {
      const date = this.serviceInvoice.getDateFilter();
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

  openTimeDefault() {
    const obj = {

    };
    const dialogRef = this.dialog.open(DatetimeDefaultFilterDialogComponent, {
      data: obj,
      width: '40%',
      minHeight: '80%',
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result?.title !== undefined) {
        this.titleTimeDefault = result?.title;
      }
      const date = this.serviceInvoice.getDateFilter();
      const date_from = new Date(date.date_from);
      const date_to = new Date(date.date_to);
      if (!date.date_from && !date.date_to) {
        this.titleTimeChoose = this.convertDate(new Date()) + ' - ' + this.convertDate(new Date());

      } else {
        this.titleTimeChoose = this.convertDate(date_from) + ' - ' + this.convertDate(date_to);
      }
      this.timeFilter.patchValue({
        typeTime: 'default',
      });

      this.apiFilter = this.buildFilterFromParams();
      this.loadData();
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
      const date = this.serviceInvoice.getDateFilter();
      const date_from = new Date(date.date_from);
      const date_to = new Date(date.date_to);
      this.titleTimeChoose = this.convertDate(date_from) + ' - ' + this.convertDate(date_to);

      this.apiFilter = this.buildFilterFromParams();
      this.loadData();
    });
  }

  buildFilterFromParams(): GroupFilter {
    function write<K extends keyof GroupFilter>(arg: GroupFilter, key: K, value: GroupFilter[K]): void {
      arg[key] = value;
    }

    const filter = new GroupFilter();
    const objectKeys = Object.keys(filter) as Array<keyof GroupFilter>;
    // const objDateFilter = this.serviceInvoice.getDateFilter();

    for (const attr of objectKeys) {
      write(filter, attr, this.route.snapshot.queryParams['GroupFilterSearch[' + attr + ']']);
    }
    filter.page = this.route.snapshot.queryParams['page'];
    filter.pageSize = this.route.snapshot.queryParams['pageSize'];
    filter.sort = this.route.snapshot.queryParams['sort'];
    filter.expand = 'branch';


    filter.date_from = '2021-1-11';
    filter.date_to = '2022-12-11';

    return filter;
  }

  loadData(): void {
    this.isLoadingResults = true;
    this.service.getReportList(this.apiFilter).subscribe(res => {
      this.dataSource = res.body;
      let stt = 0;
      this.dataSource.forEach(elementData => {
        stt++;
        elementData.stt = this.pageSize * (this.page - 1) + stt;
      });
      this.reloadFilter(res);
      this.isLoadingResults = false;
    });
  }

  ngOnInit(): void {
    this.refreshData();

    this.timeFilter = this.fb.group({
      typeTime: [
        'default'
      ],
    });

    this.searchKeyWord.valueChanges.pipe(debounceTime(800)).subscribe(res => {
      if (res !== '') {
        this.apiFilter = this.buildFilterFromParams();
        this.apiFilter.keyword = res;
        this.loadData();
      } else {
        this.refreshData();
      }
    });
  }

  refreshData() {
    this.apiFilter = this.buildFilterFromParams();
    this.loadData();
  }

  openGroupFormDialog() {
    const dialogRef = this.dialog.open(GroupFormDialogComponent, {
      width: '600px',
      minHeight: '80%',
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadData();
      }
    });
  }

}
