import { Component, Inject, OnInit, Optional, ViewChild } from '@angular/core';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { ListComponentBase } from '../../shared/base';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { NotifierService } from 'angular-notifier';
import { MatTable } from '@angular/material/table';
import { FormControl } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { debounceTime } from 'rxjs/operators';
import { CustomerFormDialogComponent } from '../../customer/customer-form-dialog/customer-form-dialog.component';
import { Warehouse } from '../../warehouse/warehouse.model';
import * as moment from 'moment/moment';
import {InvoiceReportService} from '../../invoice-report/invoice-report.service';
import {InvoiceFilter} from '../../invoice/invoice.model';

@Component({
  selector: 'app-employee-report-invoice-list-dialog',
  templateUrl: './employee-report-invoice-list-dialog.component.html',
  styleUrls: ['./employee-report-invoice-list-dialog.component.css'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({height: '0px', minHeight: '0'})),
      state('expanded', style({height: '*'})),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ]
})
export class EmployeeReportInvoiceListDialogComponent extends ListComponentBase implements OnInit {

  local_data: any;
  created_by: any;
  filterData: any;
  valueColumns: any;
  isShowCommission = false;
  title = 'Hóa Đơn bán cần thanh toán';

  constructor(
      private service: InvoiceReportService,
      private dialog: MatDialog,
      private route: ActivatedRoute,
      private notifyService: NotifierService,
      public dialogRef: MatDialogRef<EmployeeReportInvoiceListDialogComponent>,
      @Optional() @Inject(MAT_DIALOG_DATA) public data: Object
  ) {
    super();
    this.local_data = {...data};
    this.created_by = this.local_data?.created_by;
    this.filterData = this.local_data?.filterData;
    this.valueColumns = this.local_data?.valueColumns;
    if (this.local_data.title !== undefined) {
      this.title = this.local_data.title;
    }
    if (this.local_data.isShowCommission !== undefined) {
      this.isShowCommission = this.local_data.isShowCommission;
    }
  }

  @ViewChild(MatTable, {static: true}) table: MatTable<any>;

  apiFilter: InvoiceFilter;
  searchKeyWord = new FormControl();

  columnsHeader = {
    '#': '#',
    'no': 'Số HĐ',
    'date': 'Ngày HĐ',
    'total_sale': 'Bán hàng',
    'total_return': 'Trả hàng',
    'total_revenue': 'Doanh thu thuần',
    'total_original_price': 'Giá vốn',
    'total_profit': 'Lợi nhuận',
    'comm_percent': '% HH',
    'comm_amount': 'HH theo HĐ',
    'comm_amount_product': 'HH theo SP',
  };

  displayedColumns: string[] = [
    '#',
    'no',
    'date',
  ];
  sumColumnsToDisplay: string[] = [
  ];

  dataSource = [];
  expandedElement: Warehouse | null;


  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  isLoadingResults = true;
  isRateLimitReached = false;

  sumData: any;

  buildFilterFromParams(): InvoiceFilter {
    function write<K extends keyof InvoiceFilter>(arg: InvoiceFilter, key: K, value: InvoiceFilter[K]): void {
      arg[key] = value;
    }

    const filter = new InvoiceFilter();
    const objectKeys = Object.keys(filter) as Array<keyof InvoiceFilter>;

    for (const attr of objectKeys) {
      write(filter, attr, this.route.snapshot.queryParams['InvoiceSearch[' + attr + ']']);
    }
    filter.page = this.route.snapshot.queryParams['page'];
    filter.pageSize = this.route.snapshot.queryParams['pageSize'];
    filter.sort = this.route.snapshot.queryParams['sort'];
    filter.expand = 'province,ward,employee';
    if (this.created_by) {
      filter.created_by = this.created_by;
    }
    if (this.filterData) {
      filter.status = this.filterData['status'];
      filter.date_from = (this.filterData['date_from']) ? moment(this.filterData['date_from']).format('YYYY-MM-DD') : '';
      filter.date_to = (this.filterData['date_to']) ? moment(this.filterData['date_to']).format('YYYY-MM-DD') : '';
    }
    return filter;
  }

  loadData(): void {
    this.isLoadingResults = true;
    this.service.getListReportProfit(this.apiFilter).subscribe(res => {
      this.dataSource = res.body;
      let stt = 0;
      if (this.dataSource.length === 1) {
        const arr = this.dataSource;
        this.expandedElement = arr[0];
      }
      this.dataSource.forEach(elementData => {
        stt++;
        elementData.stt = this.pageSize * (this.page - 1) + stt;
      });
      this.reloadFilter(res);

      this.service.getSummaryReportProfit(this.apiFilter).subscribe(res => {
        this.sumData = res.body;

        this.isLoadingResults = false;
      });
    });
  }

  ngOnInit(): void {
    this.refreshData();
    this.searchKeyWord.valueChanges.pipe(debounceTime(800)).subscribe(res => {
      if (res !== '') {
        this.apiFilter = this.buildFilterFromParams();
        this.apiFilter.keyword = res;
        this.loadData();
      } else {
        this.refreshData();
      }
    });

    this.valueColumns.forEach(item => {
      this.displayedColumns.push(item);
      this.sumColumnsToDisplay.push('sum_' + item);
    });
  }

  refreshData() {
    this.apiFilter = this.buildFilterFromParams();
    this.loadData();
  }

}

