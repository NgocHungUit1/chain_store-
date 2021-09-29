import {Component, OnInit} from '@angular/core';
import {ListComponentBase} from '../../shared/base';
import {ActivatedRoute} from '@angular/router';
import {MatDialog} from '@angular/material/dialog';
import {NotifierService} from 'angular-notifier';
import {FormBuilder, FormGroup} from '@angular/forms';
import {CustomerService} from '../../customer/customer.service';
import {Customer, CustomerFilter, DateFilter} from '../../customer/customer.model';
import {DatetimeChooseFilterDialogComponent} from '../../customer/datetime-choose-filter-dialog/datetime-choose-filter-dialog.component';
import {DatetimeDefaultFilterDialogComponent} from '../../customer/datetime-default-filter-dialog/datetime-default-filter-dialog.component';

@Component({
  selector: 'app-report-main',
  templateUrl: './report-main.component.html',
  styleUrls: ['./report-main.component.css']
})
export class ReportMainComponent extends ListComponentBase implements OnInit {

  constructor(
    private route: ActivatedRoute,
    private dialog: MatDialog,
    private notifySer: NotifierService,
    private customerService: CustomerService,
    private fb: FormBuilder) {
    super();
  }

  expandedElement: null;

  isLoadingResults = true;
  isRateLimitReached = false;

  currentDateFilter: DateFilter;
  apiFilter: CustomerFilter;
  timeFilter: FormGroup;

  titleTimeDefault = 'Tháng này';
  titleTimeChoose = 'Lựa chọn khác';

  columnsHeader = {
    '#': '#',
    'customer': 'Tên khách hàng',
    'debt_begin': 'Công nợ đầu kỳ',
    'debt_increase': 'Công nợ tăng',
    'debt_decrease': 'Công nợ giảm',
    'debt_end': 'Công nợ cuối kỳ',
  };

  columnsToDisplay: string[] = [
    '#', 'customer', 'debt_begin', 'debt_increase', 'debt_decrease', 'debt_end'
  ];

  summaryRowDisplay: string[] = [
    'summaryRow_#', 'summaryRow_customer', 'summaryRow_debt_begin', 'summaryRow_debt_increase', 'summaryRow_debt_decrease', 'summaryRow_debt_end'
  ];

  dataSource: Customer[] = [];

  sumCongNoDauKy = 0;
  sumCongNoCuoiKy = 0;
  sumCongNoTang = 0;
  sumCongNoGiam = 0;

  ngOnInit(): void {
    this.initDateFilter();
    this.buildFromTimeFilter();
    this.apiFilter = this.buildFilterFromParams();
    this.loadData();
  }

  loadData(): void {
    this.isLoadingResults = true;
    this.customerService.getReportDebtForCustomers(this.apiFilter).subscribe(res => {
      this.dataSource = res.body.data;
      this.sumCongNoDauKy = res.body.sumCongNoDauKy;
      this.sumCongNoCuoiKy = res.body.sumCongNoCuoiKy;
      this.sumCongNoTang = res.body.sumCongNoTang;
      this.sumCongNoGiam = res.body.sumCongNoGiam;

      let stt = 0;
      this.dataSource.forEach(elementData => {
        stt++;
        elementData.stt = stt;
      });
      // this.reloadFilter(res);
      this.isLoadingResults = false;
    });
  }

  initDateFilter() {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    const first = new Date(year, month, 1);
    const obj = new DateFilter();
    // tháng này

    obj.date_from = this.customerService.convertDateYYYYMMDD(first);
    obj.date_to = this.customerService.convertDateYYYYMMDD(today);

    const date_from = new Date(obj.date_from);
    const date_to = new Date(obj.date_to);
    this.titleTimeChoose = this.convertDate(date_from) + ' - ' + this.convertDate(date_to);

    this.currentDateFilter = obj;
    this.customerService.setDateFilter(obj);
  }

  buildFromTimeFilter() {
    this.timeFilter = this.fb.group({
      typeTime: [
        'default'
      ],
    });
  }

  buildFilterFromParams(): CustomerFilter {
    function write<K extends keyof CustomerFilter>(arg: CustomerFilter, key: K, value: CustomerFilter[K]): void {
      arg[key] = value;
    }

    const objDateFilter = this.customerService.getDateFilter();
    const filter = new CustomerFilter();

    const objectKeys = Object.keys(filter) as Array<keyof CustomerFilter>;

    for (const attr of objectKeys) {
      write(filter, attr, this.route.snapshot.queryParams['CustomerSearch[' + attr + ']']);
    }

    filter.page = this.route.snapshot.queryParams['page'];
    filter.pageSize = this.route.snapshot.queryParams['pageSize'];
    filter.sort = this.route.snapshot.queryParams['sort'];
    filter.date_from = objDateFilter.date_from;
    filter.date_to = objDateFilter.date_to;
    filter.expand = 'congNo';

    return filter;
  }

  convertDate(date: Date) {
    const month = date.getMonth() + 1;
    return date.getDate() + '/' + month + '/' + date.getFullYear();
  }

  radioTimeChange(event: Event) {
    if (this.timeFilter.controls['typeTime'].value === 'choose') {
      const date = this.customerService.getDateFilter();
      const date_from = new Date(date.date_from);
      const date_to = new Date(date.date_to);
      this.titleTimeChoose = this.convertDate(date_from) + ' - ' + this.convertDate(date_to);
    } else {
      this.titleTimeChoose = 'Lựa chọn khác';
    }
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
      const date = this.customerService.getDateFilter();
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
      const date = this.customerService.getDateFilter();
      const date_from = new Date(date.date_from);
      const date_to = new Date(date.date_to);
      this.titleTimeChoose = this.convertDate(date_from) + ' - ' + this.convertDate(date_to);

      this.apiFilter = this.buildFilterFromParams();
      this.loadData();
    });
  }

}
