import { Component, OnInit, ViewChild } from '@angular/core';
import {ChangeDetectionStrategy, ChangeDetectorRef} from '@angular/core';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { NotifierService } from 'angular-notifier';
import { CashFlow, CashFlowFilter } from '../cash-flow.model';
import { CashFlowService } from '../cash-flow.service';
import { ListComponentBase } from '../../shared/base';
import { MatTable } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import { MatSort } from '@angular/material/sort';
import * as moment from 'moment';
import { CashFlowPaymentDialogComponent } from '../cash-flow-payment-dialog/cash-flow-payment-dialog.component';
import { CashFlowReceiptDialogComponent } from '../cash-flow-receipt-dialog/cash-flow-receipt-dialog.component';
import {DateFilter} from '../../invoice/invoice.model';
import {DatetimeDefaultFilterDialogComponent} from '../../invoice/datetime-default-filter-dialog/datetime-default-filter-dialog.component';
import {DatetimeChooseFilterDialogComponent} from '../../invoice/datetime-choose-filter-dialog/datetime-choose-filter-dialog.component';
import {InvoiceService} from '../../invoice/invoice.service';

@Component({
  selector: 'app-cash-flow-list',
  templateUrl: './cash-flow-list.component.html',
  styleUrls: ['./cash-flow-list.component.css'],
  changeDetection: ChangeDetectionStrategy.Default,
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({height: '0px', minHeight: '0'})),
      state('expanded', style({height: '*'})),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ]
})
export class CashFlowListComponent extends ListComponentBase implements OnInit {

  typeHeader = {
    'receipt': 'Phiếu thu',
    'payment': 'Phiếu chi',
  };

  sumData = {
    start_amount: 0,
    payment_amount: 0,
    receipt_amount: 0,
    end_amount: 0,
  };

  constructor(
    private service: CashFlowService,
    private dialog: MatDialog,
    private route: ActivatedRoute,
    private ref: ChangeDetectorRef,
    private fb: FormBuilder,
    private serviceInvoice: InvoiceService,
    private notifyService: NotifierService
  ) {
    super();
  }

  @ViewChild(MatTable, {static: true}) table: MatTable<any>;

  apiFilter: CashFlowFilter;

  columnsHeader = {
    '#': '#',
    'no': 'Mã Phiếu',
    'created_at': 'Thời gian',
    'type': 'Loại phiếu',
    'value': 'Giá trị',
  };

  displayedColumns: string[] = [
    '#',
    'no',
    'created_at',
    'type',
    'value',
  ];
  columnsToDisplay: string[] = [
    '#',
    'no',
    'created_at',
    'type',
    'value',
  ];

  dataSource = [];
  expandedElement: CashFlow | null;


  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  isLoadingResults = true;
  isRateLimitReached = false;

  currentDateFilter: DateFilter;

  titleTimeDefault = 'Tháng này';
  titleTimeChoose = 'Lựa chọn khác';

  timeFilter: FormGroup;
  typeFilterForm: FormGroup;

  typeFilterList = [
    {
      'value': 'receipt',
      'name': 'Phiếu thu',
    },
    {
      'value': 'payment',
      'name': 'Phiếu chi',
    },
  ];

  buildFilterFromParams(): CashFlowFilter {
    function write<K extends keyof CashFlowFilter>(arg: CashFlowFilter, key: K, value: CashFlowFilter[K]): void {
      arg[key] = value;
    }

    const objDateFilter = this.serviceInvoice.getDateFilter();
    const filter = new CashFlowFilter();
    const objectKeys = Object.keys(filter) as Array<keyof CashFlowFilter>;

    for (const attr of objectKeys) {
      write(filter, attr, this.route.snapshot.queryParams['CashFlowFilterSearch[' + attr + ']']);
    }
    filter.date_from = objDateFilter.date_from;
    filter.date_to = objDateFilter.date_to;
    filter.page = this.route.snapshot.queryParams['page'];
    filter.pageSize = this.route.snapshot.queryParams['pageSize'];
    filter.sort = this.route.snapshot.queryParams['sort'];
    filter.type = this.typeFilterForm.controls['type'].value;
    filter.expand = 'createdFormat,code';
    return filter;
  }

  loadData(): void {
    this.isLoadingResults = true;
    this.service.getList(this.apiFilter).subscribe(res => {
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

      this.service.getSummary(this.apiFilter).subscribe(res => {
        this.isLoadingResults = false;
        this.sumData = res.body;
      });
    });


  }

  ngOnInit(): void {
    this.initDateFilter();
    this.buildForm();
    this.apiFilter = this.buildFilterFromParams();
    this.loadData();

    // this.service.subscribeLoadBranch.subscribe(action => {
    //   if (action === true) {
    //     this.apiFilter = this.buildFilterFromParams();
    //     this.loadData();
    //     this.service.setLoadBranch(false);
    //   }
    // });

    this.serviceInvoice.subscribeDateFilter.subscribe(obj => {
      if (JSON.stringify(this.currentDateFilter) !== JSON.stringify(obj)) {
        this.currentDateFilter = obj;
        this.apiFilter = this.buildFilterFromParams();
        this.loadData();
      }
    });
  }

  buildForm() {
    this.timeFilter = this.fb.group({
      typeTime: [
        'default'
      ],
    });
    this.typeFilterForm = this.fb.group({
      type: [
        ['payment', 'receipt']
      ],
    });
  }

  checkBoxFilterChange($event: any, value: any, field: string, form: FormGroup) {
    this.handleFilterCheckbox(form, field, value);
    this.apiFilter = this.buildFilterFromParams();
    this.loadData();
  }

  initDateFilter() {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    const first = new Date(year, month, 1);
    const obj = new DateFilter();
    // tháng này

    obj.date_to = moment().endOf('month').format("YYYY-MM-DD");
    obj.date_from = moment().startOf('month').format("YYYY-MM-DD");
    // obj.date_from = this.service.convertDateYYYYMMDD(first);
    // obj.date_to = this.service.convertDateYYYYMMDD(today);

    const date_from = new Date(obj.date_from);
    const date_to = new Date(obj.date_to);
    this.titleTimeChoose = this.convertDate(date_from) + ' - ' + this.convertDate(date_to);

    this.currentDateFilter = obj;
    this.serviceInvoice.setDateFilter(obj);
  }

  convertDate(date: Date) {
    const month = date.getMonth() + 1;
    return date.getDate() + '/' + month + '/' + date.getFullYear();
  }

  onCashFlowPaymentDialog() {
    const dialogRef = this.dialog.open(CashFlowPaymentDialogComponent, {
      width: '60%',
      minHeight: '70%',
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadData();
      }
    });
  }

  onCashFlowReceiptDialog() {
    const dialogRef = this.dialog.open(CashFlowReceiptDialogComponent, {
      width: '60%',
      minHeight: '70%',
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
      const date = this.serviceInvoice.getDateFilter();
      const date_from = new Date(date.date_from);
      const date_to = new Date(date.date_to);
      this.titleTimeChoose = this.convertDate(date_from) + ' - ' + this.convertDate(date_to);
      this.timeFilter.patchValue({
        typeTime: 'default',
      });

      this.apiFilter = this.buildFilterFromParams();
      this.ref.detectChanges();
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
      this.ref.detectChanges();
      this.loadData();
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

}
