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
import { debounceTime } from 'rxjs/operators';

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

  searchSampleForm = new FormControl();


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

  statusFilterList = [
    {
      'value': '10',
      'name': 'Áp dụng',
    },
    {
      'value': '9',
      'name': 'Chưa áp dụng',
    },
  ];

  statusList = {
    '10': 'Áp dụng',
    '9': 'Chưa áp dụng'
  };

  statusesColor: object = {
    '9': 'label label-warning',
    '10': 'label label-success',
  };

  ngOnInit(): void {
    this.buildFrom();
    this.apiFilter = this.buildFilterFromParams();
    this.loadData();

    this.searchSampleForm.valueChanges.pipe(debounceTime(800)).subscribe(res => {
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
    filter.status = this.orderStatusFilter.controls['status'].value;

    return filter;
  }

  buildFrom() {
    this.orderStatusFilter = this.fb.group({
      status: [
        ['10', '9']
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


  checkBoxFilterChange($event: any, value: any, field: string) {
    this.handleFilterCheckbox(this.orderStatusFilter, field, value);
    this.apiFilter = this.buildFilterFromParams();
    this.loadData();
  }

  /**
   * Tim kiem theo trang thai don hang
   */
  orderStatusFilterChange() {
    this.apiFilter = this.buildFilterFromParams();
    this.loadData();
  }

}
