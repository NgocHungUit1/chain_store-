import {Component, OnInit, ViewChild} from '@angular/core';
import {animate, state, style, transition, trigger} from '@angular/animations';
import {MatDialog} from '@angular/material/dialog';
import {ActivatedRoute} from '@angular/router';
import {NotifierService} from 'angular-notifier';
import {InvoiceService} from '../../invoice/invoice.service';
import {FormBuilder, FormControl, FormGroup} from '@angular/forms';
import {MatTable} from '@angular/material/table';
import {DateFilter} from '../../invoice/invoice.model';
import {MatPaginator} from '@angular/material/paginator';
import {MatSort} from '@angular/material/sort';
import {debounceTime} from 'rxjs/operators';
import {ListComponentBase} from '../../shared/base';
import {PaySheetService} from '../pay-sheet.service';
import {PaySheet, PaySheetFilter} from '../pay-sheet.model';
import {PaySheetFormComponent} from '../pay-sheet-form/pay-sheet-form.component';

@Component({
  selector: 'app-pay-sheet-list',
  templateUrl: './pay-sheet-list.component.html',
  styleUrls: ['./pay-sheet-list.component.css'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({height: '0px', minHeight: '0'})),
      state('expanded', style({height: '*'})),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ]
})
export class PaySheetListComponent extends ListComponentBase implements OnInit {

  constructor(
    private mainService: PaySheetService,
    private dialog: MatDialog,
    private route: ActivatedRoute,
    private notifyService: NotifierService,
    private service: InvoiceService,
    private fb: FormBuilder,
  ) {
    super();
  }

  @ViewChild(MatTable, {static: true}) table: MatTable<any>;

  apiFilter: PaySheetFilter;

  searchProductForm = new FormControl();
  orderStatusFilter: FormGroup;

  timeFilter: FormGroup;

  currentDateFilter: DateFilter;

  columnsHeader = {
    '#': '#',
    'name': 'Tên',
    'salary_period': 'Kỳ hạn trả',
    'salary_period_name': 'Kỳ làm việc',
    'total_amount': 'Tổng lương',
    'paid_amount': 'Tông đã trả nhân viên',
    'remaining_paid_amount': 'Còn lại cần trả',
    'status': 'Trạng thái',
  };

  displayedColumns: string[] = [
    '#',
    'name',
    'salary_period',
    'salary_period_name',
    'total_amount',
    'paid_amount',
    'remaining_paid_amount',
    'status',
  ];
  columnsToDisplay: string[] = [
    '#',
    'name',
    'salary_period',
    'salary_period_name',
    'total_amount',
    'paid_amount',
    'remaining_paid_amount',
    'status',
  ];

  statusFilterList = [
    {
      'value': '10',
      'name': 'Hoàn thành',
    },
    {
      'value': '9',
      'name': 'Lưu tạm',
    },
    {
      'value': '0',
      'name': 'Đã hủy',
    },
  ];

  salaryPeriods: any[] = [
    {
      'id': 1,
      'title': 'Hàng tháng'
    },
    // {
    //   'id': 2,
    //   'title': '2 lần 1 tháng'
    // },
    // {
    //   'id': 3,
    //   'title': 'Hàng tuần'
    // },
    // {
    //   'id': 4,
    //   'title': '2 tuần 1 lần'
    // },
    // {
    //   'id': 5,
    //   'title': '2 Tủy chọn'
    // }
  ];

  dataSource = [];
  expandedElement: PaySheet | null;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  isLoadingResults = true;
  isRateLimitReached = false;
  codeSearch = null;


  buildFilterFromParams(): PaySheetFilter {
    function write<K extends keyof PaySheetFilter>(arg: PaySheetFilter, key: K, value: PaySheetFilter[K]): void {
      arg[key] = value;
    }

    const filter = new PaySheetFilter();
    const objectKeys = Object.keys(filter) as Array<keyof PaySheetFilter>;
    const objDateFilter = this.service.getDateFilter();

    for (const attr of objectKeys) {
      write(filter, attr, this.route.snapshot.queryParams['WarehouseSearch[' + attr + ']']);
    }
    filter.page = this.route.snapshot.queryParams['page'];
    filter.pageSize = this.route.snapshot.queryParams['pageSize'];
    filter.sort = this.route.snapshot.queryParams['sort'];
    filter.expand = 'supplier,created_user,product_count,total_quantity';
    filter.status = this.orderStatusFilter.controls['status'].value;
    return filter;
  }

  // initDateFilter() {
  //   const today = new Date();
  //   const year = today.getFullYear();
  //   const month = today.getMonth();
  //   const first = new Date(year, month, 1);
  //   const obj = new DateFilter();
  //   // tháng này
  //
  //   obj.date_from = this.service.convertDateYYYYMMDD(first);
  //   obj.date_to = this.service.convertDateYYYYMMDD(today);
  //
  //   const date_from = new Date(obj.date_from);
  //   const date_to = new Date(obj.date_to);
  //
  //   this.currentDateFilter = obj;
  //   this.service.setDateFilter(obj);
  // }

  loadData(): void {
    this.isLoadingResults = true;
    this.mainService.getList(this.apiFilter).subscribe(res => {
      this.dataSource = res.body;
      this.reloadFilter(res);
      this.isLoadingResults = false;
    });
  }

  ngOnInit() {

    // this.initDateFilter();

    this.orderStatusFilter = this.fb.group({
      status: [
        ['10', '9', '0']
      ],
    });

    this.timeFilter = this.fb.group({
      typeTime: [
        'default'
      ],
    });

    this.apiFilter = this.buildFilterFromParams();
    this.loadData();

    this.service.subscribeDateFilter.subscribe(obj => {
      if (JSON.stringify(this.currentDateFilter) !== JSON.stringify(obj)) {
        this.currentDateFilter = obj;
        this.apiFilter = this.buildFilterFromParams();
        this.loadData();
      }
    });

    this.searchProductForm.valueChanges.pipe(debounceTime(800)).subscribe(res => {
      if (res !== '') {
        this.apiFilter = this.buildFilterFromParams();
        this.loadData();
      } else {
        this.apiFilter = this.buildFilterFromParams();
        this.loadData();
      }
    });
  }

  orderStatusFilterChange() {
    this.apiFilter = this.buildFilterFromParams();
    this.loadData();
  }

  openPaySheetFormDialog() {
    const obj = {};
    const dialogRef = this.dialog.open(PaySheetFormComponent, {
      data: obj,
      width: '40%',
      minHeight: '80%',
    });

    dialogRef.afterClosed().subscribe(result => {
      this.loadData();
    });
  }

  getNameSalaryPeriod(id) {
    return this.salaryPeriods.find(item => item.id === id)?.title;
  }

}
