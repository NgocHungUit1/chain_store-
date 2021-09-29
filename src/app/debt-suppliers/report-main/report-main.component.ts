import {Component, OnInit} from '@angular/core';
import {ListComponentBase} from '../../shared/base';
import {ActivatedRoute} from '@angular/router';
import {MatDialog} from '@angular/material/dialog';
import {NotifierService} from 'angular-notifier';
import {FormBuilder, FormGroup} from '@angular/forms';
import {SupplierService} from '../../supplier/supplier.service';
import {DateFilter, Supplier, SupplierFilter} from '../../supplier/supplier.model';
import {DatetimeDefaultFilterDialogComponent} from '../datetime-default-filter-dialog/datetime-default-filter-dialog.component';
import {DatetimeChooseFilterDialogComponent} from '../datetime-choose-filter-dialog/datetime-choose-filter-dialog.component';

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
    private supplierSer: SupplierService,
    private fb: FormBuilder
  ) {
    super();
  }

  expandedElement: null;

  isLoadingResults = true;
  isRateLimitReached = false;

  currentDateFilter: DateFilter;
  apiFilter: SupplierFilter;
  timeFilter: FormGroup;

  titleTimeDefault = 'Tháng này';
  titleTimeChoose = 'Lựa chọn khác';

  columnsHeader = {
    '#': '#',
    'supplier': 'Tên nhà cung cấp',
    'debt_begin': 'Công nợ đầu kỳ',
    'debt_increase': 'Công nợ tăng',
    'debt_decrease': 'Công nợ giảm',
    'debt_end': 'Công nợ cuối kỳ',
  };

  columnsToDisplay: string[] = [
    '#', 'supplier', 'debt_begin', 'debt_increase', 'debt_decrease', 'debt_end'
  ];

  summaryRowDisplay: string[] = [
    'summaryRow_#', 'summaryRow_supplier', 'summaryRow_debt_begin', 'summaryRow_debt_increase', 'summaryRow_debt_decrease', 'summaryRow_debt_end'
  ];

  dataSource: Supplier[] = [];

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
    this.supplierSer.getReportDebtForSuppliers(this.apiFilter).subscribe(res => {
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
      this.reloadFilter(res);
      this.isLoadingResults = false;
    });
  }

  initDateFilter() {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    const first = new Date(year, month, 1);
    const obj = new DateFilter();

    obj.date_from = this.supplierSer.convertDateYYYYMMDD(first);
    obj.date_to = this.supplierSer.convertDateYYYYMMDD(today);

    const date_from = new Date(obj.date_from);
    const date_to = new Date(obj.date_to);
    this.titleTimeChoose = this.convertDate(date_from) + ' - ' + this.convertDate(date_to);

    this.currentDateFilter = obj;
    this.supplierSer.setDateFilter(obj);
  }

  buildFromTimeFilter() {
    this.timeFilter = this.fb.group({
      typeTime: [
        'default'
      ],
    });
  }

  buildFilterFromParams(): SupplierFilter {
    function write<K extends keyof SupplierFilter>(arg: SupplierFilter, key: K, value: SupplierFilter[K]): void {
      arg[key] = value;
    }

    const objDateFilter = this.supplierSer.getDateFilter();
    const filter = new SupplierFilter();

    const objectKeys = Object.keys(filter) as Array<keyof SupplierFilter>;

    for (const attr of objectKeys) {
      write(filter, attr, this.route.snapshot.queryParams['SupplierSearch[' + attr + ']']);
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
      const date = this.supplierSer.getDateFilter();
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
      const date = this.supplierSer.getDateFilter();
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
      const date = this.supplierSer.getDateFilter();
      const date_from = new Date(date.date_from);
      const date_to = new Date(date.date_to);
      this.titleTimeChoose = this.convertDate(date_from) + ' - ' + this.convertDate(date_to);

      this.apiFilter = this.buildFilterFromParams();
      this.loadData();
    });
  }
}
