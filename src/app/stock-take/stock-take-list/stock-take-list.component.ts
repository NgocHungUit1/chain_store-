import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { NotifierService } from 'angular-notifier';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MatTable } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { DateFilter, Invoice, InvoiceFilter } from '../../invoice/invoice.model';
import { debounceTime } from 'rxjs/operators';
import { ListComponentBase } from '../../shared/base';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { StockTakeService } from '../stock-take.service';
import { StockTake, StockTakeFilter } from '../stock-take.model';
import { DatetimeChooseFilterDialogComponent } from '../datetime-choose-filter-dialog/datetime-choose-filter-dialog.component';
import { DatetimeDefaultFilterDialogComponent } from '../datetime-default-filter-dialog/datetime-default-filter-dialog.component';

@Component({
  selector: 'app-stock-take-list',
  templateUrl: './stock-take-list.component.html',
  styleUrls: ['./stock-take-list.component.css'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({height: '0px', minHeight: '0'})),
      state('expanded', style({height: '*'})),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ]
})
export class StockTakeListComponent extends ListComponentBase implements OnInit {

  constructor(
    private service: StockTakeService,
    private route: ActivatedRoute,
    private dialog: MatDialog,
    private notifySer: NotifierService,
    private fb: FormBuilder,
    private router: Router
  ) {
    super();
  }

  @ViewChild(MatTable, {static: true}) table: MatTable<any>;
  @ViewChild('selectColumn') selectColumn;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  isLoadingResults = true;
  isRateLimitReached = false;

  apiFilter: StockTakeFilter;
  expandedElement: StockTake | null;
  timeFilter: FormGroup;
  currentDateFilter: DateFilter;

  searchInvoiceForm = new FormControl();

  //
  titleTimeDefault = 'Tháng này';
  titleTimeChoose = 'Lựa chọn khác';

  columnsHeader = {
    '#': '#',
    'no': 'Mã kiểm kho',
    'created_at': 'Thời gian',
    'balance_at': 'Ngày cân bằng',
    'note': 'Ghi chú',
    'deviation_price_sum': 'Tổng giá chênh lệch',
    'total_price': 'Tổng thực tế',
    'balance_status': 'Trạng thái',
  };

  displayedColumns: string[] = [
    '#', 'no', 'created_at', 'balance_at', 'note', 'deviation_price_sum', 'total_price', 'balance_status'
  ];
  columnsToDisplay: string[] = [
    '#', 'no', 'created_at', 'balance_at', 'note', 'deviation_price_sum', 'total_price', 'balance_status'
  ];
  dataSource: StockTake[] = [];


  statusItems: any[] = [
    {
      'id': 'default',
      'title': 'Mặc định'
    },
    {
      'id': 'choose',
      'title': 'Lựa chọn khác'
    }
  ];
  balanceStatusFilter: FormGroup;

  balanceStatuses: object = {
    draft: 'Lưu tạm',
    done: 'Hoàn thành',
    cancel: 'Hủy bỏ',
  };

  balanceStatusesColor: object = {
    draft: 'label label-warning',
    done: 'label label-success',
    cancel: 'label label-danger',
  };

  balanceStatusFilterList = [
    {
      'value': 'draft',
      'name': 'Lưu tạm',
    },
    {
      'value': 'done',
      'name': 'Hoàn thành',
    },
    {
      'value': 'cancel',
      'name': 'Hủy bỏ',
    },
  ];
  codeSearch = null;


  buildFilterFromParams(): StockTakeFilter {
    function write<K extends keyof StockTakeFilter>(arg: StockTakeFilter, key: K, value: StockTakeFilter[K]): void {
      arg[key] = value;
    }

    const objDateFilter = this.service.getDateFilter();
    const filter = new StockTakeFilter();
    const objectKeys = Object.keys(filter) as Array<keyof StockTakeFilter>;

    for (const attr of objectKeys) {
      write(filter, attr, this.route.snapshot.queryParams['StockTakeSearch[' + attr + ']']);
    }
    filter.page = this.route.snapshot.queryParams['page'];
    filter.pageSize = this.route.snapshot.queryParams['pageSize'];
    filter.sort = this.route.snapshot.queryParams['sort'];
    filter.expand = 'store,user,balanceBy,deviationPriceSum,totalPrice';
    filter.date_from = objDateFilter.date_from;
    filter.date_to = objDateFilter.date_to;
    filter.balance_status = this.balanceStatusFilter.controls['status'].value;

    return filter;
  }

  buildFrom() {
    this.timeFilter = this.fb.group({
      typeTime: [
        'default'
      ],
    });

    this.balanceStatusFilter = this.fb.group({
      status: [
        ['draft', 'done', 'cancel']
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

    obj.date_from = this.service.convertDateYYYYMMDD(first);
    obj.date_to = this.service.convertDateYYYYMMDD(today);

    const date_from = new Date(obj.date_from);
    const date_to = new Date(obj.date_to);
    this.titleTimeChoose = this.convertDate(date_from) + ' - ' + this.convertDate(date_to);

    this.currentDateFilter = obj;
    this.service.setDateFilter(obj);
  }

  loadData(): void {
    const code = this.route.snapshot.paramMap.get('code');
    if (code !== null && code !== undefined) {
      if (this.codeSearch == null) {
        this.apiFilter.no = code;
        this.codeSearch = code;
      } else {
        this.apiFilter.no = '';
      }
    }

    this.isLoadingResults = true;
    this.service.getList(this.apiFilter).subscribe(res => {
      let data = res.body;
      let stt = 0;
      data.forEach(elementData => {
        stt++;
        elementData.stt = stt; // tinh STT

        //
        //
        // if (elementData.balance_at !== 0) {
        //   const balance_date = new Date(1000 * elementData.balance_at).toJSON().slice(0, 16);
        //   elementData.balance_at = balance_date.slice(8, 10) + '/'
        //     + balance_date.slice(5, 7) + '/'
        //     + balance_date.slice(0, 4) + ' '
        //     + balance_date.slice(11, 16);
        // } else {
        //   elementData.balance_at = '';
        // }


      });
      this.dataSource = data;

      this.reloadFilter(res);
      this.isLoadingResults = false;
    });

  }

  ngOnInit(): void {
    this.initDateFilter();
    this.buildFrom();
    this.apiFilter = this.buildFilterFromParams();
    this.loadData();

    this.service.subscribeDateFilter.subscribe(obj => {
      if (JSON.stringify(this.currentDateFilter) !== JSON.stringify(obj)) {
        this.currentDateFilter = obj;
        this.apiFilter = this.buildFilterFromParams();
        this.loadData();
      }
    });

    this.searchInvoiceForm.valueChanges.pipe(debounceTime(800)).subscribe(res => {
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

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.apiFilter = this.buildFilterFromParams();
    // this.apiFilter.invoice_no = filterValue;
    this.loadData();
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

  goToCartPage() {
    this.router.navigate(['/sale']);
  }

  /**
   * Tim kiem theo trang thai don hang
   */
  orderStatusFilterChange() {
    this.apiFilter = this.buildFilterFromParams();
    this.loadData();
  }

}
