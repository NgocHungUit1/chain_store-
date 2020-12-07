import { Component, OnInit } from '@angular/core';
import { SaleReportService } from '../sale-report.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { NotifierService } from 'angular-notifier';
import { InvoiceService } from '../../invoice/invoice.service';
import { DatetimeDefaultFilterDialogComponent } from '../../invoice/datetime-default-filter-dialog/datetime-default-filter-dialog.component';
import { DatetimeChooseFilterDialogComponent } from '../../invoice/datetime-choose-filter-dialog/datetime-choose-filter-dialog.component';
import { DateFilter } from '../../invoice/invoice.model';

@Component({
  selector: 'app-sale-report-main',
  templateUrl: './sale-report-main.component.html',
  styleUrls: ['./sale-report-main.component.css']
})
export class SaleReportMainComponent implements OnInit {

  public barChartData: any[] = [
    {data: [65, 59, 80, 81, 56, 55, 40], label: 'Bán hàng'},
    {data: [28, 48, 40, 19, 86, 27, 90], label: 'Nhập hàng'}
  ];

  public barChartColors: Array<any> = [
    {backgroundColor: '#1976d2'},
    {backgroundColor: '#26dad2'}
  ];

  public barChartLabels: string[] = [
    '2011',
    '2012',
    '2013',
    '2014',
    '2015',
    '2016',
    '2017'
  ];

  // This is line chart
  // bar chart
  public barChartOptions: any = {
    scaleShowVerticalLines: false,
    responsive: true,
    barThickness: 10
  };
  public barChartType = 'bar';
  public barChartLegend = true;

  timeFilter: FormGroup;
  currentDateFilter: DateFilter;

  titleTimeDefault = 'Tháng này';
  titleTimeChoose = 'Lựa chọn khác';

  isLoadingResults = true;
  isRateLimitReached = false;


  constructor(
    private serviceSaleReport: SaleReportService,
    private serviceInvoice: InvoiceService,
    private dialog: MatDialog,
    private notifySer: NotifierService,
    private fb: FormBuilder,
  ) {
  }


  buildFromTimeFilter() {
    this.timeFilter = this.fb.group({
      typeTime: [
        'default'
      ],
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

  buildView() {
    this.isLoadingResults = true;
    const objDateFilter = this.serviceInvoice.getDateFilter();
    const date_from = objDateFilter.date_from;
    const date_to = objDateFilter.date_to;
    this.serviceSaleReport.getDataBarChart(date_from, date_to).subscribe(res => {
      this.barChartData = [
        {data: res['BanHang'], label: 'Bán hàng'},
        {data: res['NhapHang'], label: 'Nhập hàng'}
      ];
      this.barChartLabels = res['date'];
    });
    this.isLoadingResults = false;

  }

  ngOnInit(): void {
    this.initDateFilter();
    this.buildFromTimeFilter();
    this.buildView();
  }

  // events
  public chartClicked(e: any): void {
    // console.log(e);
  }

  public chartHovered(e: any): void {
    // console.log(e);
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
      const date = this.serviceInvoice.getDateFilter();
      const date_from = new Date(date.date_from);
      const date_to = new Date(date.date_to);
      this.titleTimeChoose = this.convertDate(date_from) + ' - ' + this.convertDate(date_to);
      this.timeFilter.patchValue({
        typeTime: 'default',
      });

      this.buildView();
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

      this.buildView();
    });
  }

}
