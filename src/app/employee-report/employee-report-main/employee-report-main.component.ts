import {Component, OnInit, ViewChild} from '@angular/core';
import {ListComponentBase} from '../../shared/base';
import {animate, state, style, transition, trigger} from '@angular/animations';
import {ActivatedRoute} from '@angular/router';
import {MatDialog} from '@angular/material/dialog';
import {NotifierService} from 'angular-notifier';
import {FormBuilder, FormControl, FormGroup} from '@angular/forms';
import {MatTable} from '@angular/material/table';
import {MatPaginator} from '@angular/material/paginator';
import {MatSort} from '@angular/material/sort';
import {InvoiceService} from '../../invoice/invoice.service';
import {DateFilter} from '../../invoice/invoice.model';
import {DatetimeDefaultFilterDialogComponent} from '../../invoice/datetime-default-filter-dialog/datetime-default-filter-dialog.component';
import {DatetimeChooseFilterDialogComponent} from '../../invoice/datetime-choose-filter-dialog/datetime-choose-filter-dialog.component';
import {EmployeeReportService} from '../employee-report.service';
import {AuthService} from '../../authentication/auth.service';
import {EmployeeFilter} from '../../employee/employee.model';

@Component({
  selector: 'app-employee-report-main',
  templateUrl: './employee-report-main.component.html',
  styleUrls: ['./employee-report-main.component.css'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({height: '0px', minHeight: '0'})),
      state('expanded', style({height: '*'})),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ]
})
export class EmployeeReportMainComponent extends ListComponentBase implements OnInit {

  constructor(
    private service: EmployeeReportService,
    private route: ActivatedRoute,
    private dialog: MatDialog,
    private notifySer: NotifierService,
    private serviceInvoice: InvoiceService,
    private fb: FormBuilder,
    private authSer: AuthService,
  ) {
    super();
  }

  @ViewChild('profitTab') profitTab;
  @ViewChild('commissionTab') commissionTab;
  @ViewChild('revenueTab') revenueTab;
  @ViewChild('tabGroup', {static: true}) tabGroup;

  @ViewChild(MatTable, {static: true}) table: MatTable<any>;
  @ViewChild('selectColumn') selectColumn;

  apiFilter: EmployeeFilter;

  statusEmployeeFilter: FormGroup;


  timeFilter: FormGroup;
  currentDateFilter: DateFilter;

  titleTimeDefault = 'Tháng này';
  titleTimeChoose = 'Lựa chọn khác';

  reportType: FormGroup;

  timeExpireFilter: FormGroup;

  tabSelectedIndex = 0;

  dataSource: any[] = [];

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  isLoadingResults = true;
  isRateLimitReached = false;

  searchForm = new FormControl();
  tab: string = '';
  tabs = ['revenue', 'profit', 'commission'];

  public downloadLink = '';

  public timeSelected = 'next_3_month';
  public timeSelects = [
    'today',
    'this_week',
    'this_month',
    'next_30_day',
    'next_2_month',
    'next_3_month',
    'next_6_month',
    'next_year',
    'expired',
  ];
  public timeLabels = {
    'today': 'Hôm nay',
    'this_week': 'Tuần này',
    'this_month': 'Tháng này',
    'next_30_day': '30 ngày tới',
    'next_2_month': 'Trong 2 tháng',
    'next_3_month': 'Trong 3 tháng',
    'next_6_month': 'Trong 6 tháng',
    'next_year': 'Trong 1 năm',
    'expired': 'Đã hết hạn',
  };

  ngOnInit() {
    this.initDateFilter();
    this.tab = this.route.snapshot.paramMap.get('tab');
    this.tabSelectedIndex = this.tabs.indexOf(this.tab);

    this.buildFromTimeFilter();

    this.statusEmployeeFilter = this.fb.group({
      status: [
        [10, 9]
      ],
    });

    this.apiFilter = this.buildFilterFromParams();
    this.loadData();

    this.reportType.valueChanges.subscribe(res => {
      this.tab = res.type;
      this.tabSelectedIndex = this.tabs.indexOf(this.tab);
      this.loadData();
    });
  }

  buildFilterFromParams(): EmployeeFilter {
    function write<K extends keyof EmployeeFilter>(arg: EmployeeFilter, key: K, value: EmployeeFilter[K]): void {
      arg[key] = value;
    }

    const typeReport = this.reportType.controls['type'].value;
    const objDateFilter = this.serviceInvoice.getDateFilter();
    const filter = new EmployeeFilter();
    const objectKeys = Object.keys(filter) as Array<keyof EmployeeFilter>;

    for (const attr of objectKeys) {
      write(filter, attr, this.route.snapshot.queryParams['ProductSearch[' + attr + ']']);
    }
    filter.page = this.route.snapshot.queryParams['page'];
    filter.pageSize = this.route.snapshot.queryParams['pageSize'];
    filter.sort = this.route.snapshot.queryParams['sort'];
    // filter.expand = 'sl_ban,doanh_thu,tong_gia_von,sl_tra,gia_tri_tra,base_revenue';

    filter.search_string = this.searchForm.value;

    // filter.expand = 'returnsDetailsBranch';
    // filter.expand = 'medicine,productUnits,productPlacements,group,images,quantity';
    filter.date_from = objDateFilter.date_from;
    filter.date_to = objDateFilter.date_to;
    return filter;
  }

  loadData(summary = true): void {
    if (this.tabGroup.selectedIndex === 0) {
      this.revenueTab.loadData();
    } else if (this.tabGroup.selectedIndex === 1) {
      this.profitTab.loadData();
    } else if (this.tabGroup.selectedIndex === 2) {
      this.commissionTab.loadData();
    }
  }

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
      'typeReport': this.reportType.controls['type'].value
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

  initDateFilter() {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    const first = new Date(year, month, 1);
    const obj = new DateFilter();
    // tháng này

    obj.date_from = this.serviceInvoice.convertDateYYYYMMDD(first);
    obj.date_to = this.serviceInvoice.convertDateYYYYMMDD(today);

    const date_from = new Date(obj.date_from);
    const date_to = new Date(obj.date_to);
    this.titleTimeChoose = this.convertDate(date_from) + ' - ' + this.convertDate(date_to);

    this.currentDateFilter = obj;
    this.serviceInvoice.setDateFilter(obj);
  }

  buildFromTimeFilter() {
    this.timeFilter = this.fb.group({
      typeTime: [
        'default'
      ],
    });
    this.timeExpireFilter = this.fb.group({
      typeTime: [
        'next_3_month'
      ],
    });

    this.reportType = this.fb.group({
      type: [this.tab]
    });
  }


  /**
   * Tim kiem theo trang thai sản phẩm
   */
  statusEmployeeFilterChange() {
    this.apiFilter = this.buildFilterFromParams();
    this.loadData();
  }

  onTimeChange() {
    this.loadData(true);
  }

  canDo(permissionName: string): boolean {
    const allPermissions = this.authSer.getPermissionsFromLocalStorage();

    return allPermissions.indexOf(permissionName) !== -1;
  }
}
