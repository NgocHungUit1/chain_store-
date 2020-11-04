import { Component, OnInit, ViewChild } from '@angular/core';
import { ListComponentBase } from '../../shared/base';
import { MatTable } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { NotifierService } from 'angular-notifier';
import { SamplePrescriptionService } from '../sample-prescription.service';
import { SamplePrescription, SamplePrescriptionFilter } from '../sample-prescription.model';

@Component({
  selector: 'app-sample-prescription-list',
  templateUrl: './sample-prescription-list.component.html',
  styleUrls: ['./sample-prescription-list.component.css'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({height: '0px', minHeight: '0'})),
      state('expanded', style({height: '*'})),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ]
})
export class SamplePrescriptionListComponent extends ListComponentBase implements OnInit {

  constructor(
    private service: SamplePrescriptionService,
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

  apiFilter: SamplePrescriptionFilter;
  expandedElement: SamplePrescription | null;
  orderStatusFilter: FormGroup;

  searchInvoiceForm = new FormControl();


  columnsHeader = {
    '#': '#',
    'no': 'Mã đơn thuốc',
    'name': 'Tên đơn thuốc',
    'status': 'Trạng thái',
  };

  displayedColumns: string[] = [
    '#', 'no', 'name', 'status'
  ];
  columnsToDisplay: string[] = [
    '#', 'no', 'name', 'status'
  ];

  orderStatusFilterList = [
    {
      'value': 'pending',
      'name': 'Đang xử lý',
    },
    {
      'value': 'done',
      'name': 'Hoàn thành',
    },
  ];

  ngOnInit(): void {
    this.buildFrom();
    this.apiFilter = this.buildFilterFromParams();
    this.loadData();
  }

  buildFilterFromParams(): SamplePrescriptionFilter {
    // tslint:disable-next-line:max-line-length
    function write<K extends keyof SamplePrescriptionFilter>(arg: SamplePrescriptionFilter, key: K, value: SamplePrescriptionFilter[K]): void {
      arg[key] = value;
    }

    const filter = new SamplePrescriptionFilter();

    const objectKeys = Object.keys(filter) as Array<keyof SamplePrescriptionFilter>;

    for (const attr of objectKeys) {
      write(filter, attr, this.route.snapshot.queryParams['SamplePrescriptionSearch[' + attr + ']']);
    }
    filter.page = this.route.snapshot.queryParams['page'];
    filter.pageSize = this.route.snapshot.queryParams['pageSize'];
    filter.sort = this.route.snapshot.queryParams['sort'];
    filter.expand = 'store,user';
    // filter.date_from = objDateFilter.date_from;
    // filter.date_to = objDateFilter.date_to;
    // filter.order_status = this.orderStatusFilter.controls['status'].value;

    return filter;
  }

  buildFrom() {
    this.orderStatusFilter = this.fb.group({
      status: [
        ['pending', 'done']
      ],
    });
  }

  loadData(): void {
    this.isLoadingResults = true;
    this.service.getList(this.apiFilter).subscribe(res => {
      let data = res.body;
      let stt = 0;
      data.forEach(elementData => {
        stt++;
        elementData.stt = stt; // tinh STT
      });
      this.dataSource = data;
      this.reloadFilter(res);
      this.isLoadingResults = false;
    });

  }

  /**
   * Tim kiem theo trang thai don hang
   */
  orderStatusFilterChange() {
    this.apiFilter = this.buildFilterFromParams();
    this.loadData();
  }

}
