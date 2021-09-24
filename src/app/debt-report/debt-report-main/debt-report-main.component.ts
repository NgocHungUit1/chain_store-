import {Component, OnInit, ViewChild} from '@angular/core';
import {ListComponentBase} from '../../shared/base';
import {ActivatedRoute} from '@angular/router';
import {MatDialog} from '@angular/material/dialog';
import {NotifierService} from 'angular-notifier';
import {FormBuilder, FormGroup} from '@angular/forms';
import {DateFilter, Invoice, InvoiceFilter} from '../../invoice/invoice.model';
import {DatetimeChooseFilterDialogComponent} from '../../invoice/datetime-choose-filter-dialog/datetime-choose-filter-dialog.component';
import {DatetimeDefaultFilterDialogComponent} from '../../invoice/datetime-default-filter-dialog/datetime-default-filter-dialog.component';
import {PaymentService} from '../../payment/payment.service';
import {InvoiceService} from '../../invoice/invoice.service';

@Component({
  selector: 'app-debt-report-main',
  templateUrl: './debt-report-main.component.html',
  styleUrls: ['./debt-report-main.component.css']
})
export class DebtReportMainComponent extends ListComponentBase implements OnInit {

  constructor(
    private route: ActivatedRoute,
    private dialog: MatDialog,
    private notifySer: NotifierService,
    private paymentService: PaymentService,
    private invoiceService: InvoiceService,
    private fb: FormBuilder) {
    super();
  }


  expandedElement: null;

  isLoadingResults = true;
  isRateLimitReached = false;

  currentDateFilter: DateFilter;
  apiFilter: InvoiceFilter;
  timeFilter: FormGroup;
  reportType: FormGroup;

  titleTimeDefault = 'Tháng này';
  titleTimeChoose = 'Lựa chọn khác';

  columnsHeader = {
    '#': '#',
    'customer': 'Khách hàng',
    'debt_begin': 'Công nợ đầu kỳ',
    'debt_end': 'Công nợ cuối kỳ'
  };

  columnsToDisplay: string[] = [
    '#', 'customer', 'debt_begin', 'debt_end'
  ];

  dataSource: Invoice[] = [];

  ngOnInit(): void {
    this.initDateFilter();
    this.buildFromTimeFilter();
    this.apiFilter = this.buildFilterFromParams();
    this.loadData();
  }

  loadData(): void {
    const typeReport = this.reportType.controls['type'].value;
    if (typeReport === 'customers') {
      this.isLoadingResults = true;
      this.invoiceService.getReportDebtForCustomers(this.apiFilter).subscribe(res => {
        this.dataSource = res.body.data;
        let stt = 0;
        this.dataSource.forEach(elementData => {
          stt++;
          elementData.stt = stt;
        });
        this.reloadFilter(res);
        this.isLoadingResults = false;
      });
    }
  }

  initDateFilter() {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    const first = new Date(year, month, 1);
    const obj = new DateFilter();
    // tháng này

    obj.date_from = this.invoiceService.convertDateYYYYMMDD(first);
    obj.date_to = this.invoiceService.convertDateYYYYMMDD(today);

    const date_from = new Date(obj.date_from);
    const date_to = new Date(obj.date_to);
    this.titleTimeChoose = this.convertDate(date_from) + ' - ' + this.convertDate(date_to);

    this.currentDateFilter = obj;
    this.invoiceService.setDateFilter(obj);
  }

  buildFromTimeFilter() {
    this.timeFilter = this.fb.group({
      typeTime: [
        'default'
      ],
    });
    this.reportType = this.fb.group({
      type: ['customers']
    });
  }

  buildFilterFromParams(): InvoiceFilter {
    function write<K extends keyof InvoiceFilter>(arg: InvoiceFilter, key: K, value: InvoiceFilter[K]): void {
      arg[key] = value;
    }

    const typeReport = this.reportType.controls['type'].value;
    const objDateFilter = this.invoiceService.getDateFilter();
    const filter = new InvoiceFilter();

    const objectKeys = Object.keys(filter) as Array<keyof InvoiceFilter>;

    for (const attr of objectKeys) {
      write(filter, attr, this.route.snapshot.queryParams['InvoiceSearch[' + attr + ']']);
    }

    filter.page = this.route.snapshot.queryParams['page'];
    filter.pageSize = this.route.snapshot.queryParams['pageSize'];
    filter.sort = this.route.snapshot.queryParams['sort'];
    filter.date_from = objDateFilter.date_from;
    filter.date_to = objDateFilter.date_to;

    if (typeReport === 'customers') {
      filter.expand = 'customer,debtBegin,debtEnd';
    }

    return filter;
  }

  convertDate(date: Date) {
    const month = date.getMonth() + 1;
    return date.getDate() + '/' + month + '/' + date.getFullYear();
  }

  radioTimeChange(event: Event) {
    if (this.timeFilter.controls['typeTime'].value === 'choose') {
      const date = this.invoiceService.getDateFilter();
      const date_from = new Date(date.date_from);
      const date_to = new Date(date.date_to);
      this.titleTimeChoose = this.convertDate(date_from) + ' - ' + this.convertDate(date_to);
    } else {
      this.titleTimeChoose = 'Lựa chọn khác';
    }
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
      const date = this.invoiceService.getDateFilter();
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
      const date = this.invoiceService.getDateFilter();
      const date_from = new Date(date.date_from);
      const date_to = new Date(date.date_to);
      this.titleTimeChoose = this.convertDate(date_from) + ' - ' + this.convertDate(date_to);

      this.apiFilter = this.buildFilterFromParams();
      this.loadData();
    });
  }

}
