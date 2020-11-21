import { Component, OnInit, ViewChild } from '@angular/core';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { NotifierService } from 'angular-notifier';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MatTable } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { SamplePrescription, SamplePrescriptionFilter } from '../../sample-prescription/sample-prescription.model';
import { debounceTime } from 'rxjs/operators';
import { ListComponentBase } from '../../shared/base';
import { MoveService } from '../move.service';
import { Move, MoveFilter } from '../move.model';

@Component({
  selector: 'app-move-list',
  templateUrl: './move-list.component.html',
  styleUrls: ['./move-list.component.css'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({height: '0px', minHeight: '0'})),
      state('expanded', style({height: '*'})),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ]
})
export class MoveListComponent extends ListComponentBase implements OnInit {

  constructor(
    private service: MoveService,
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

  apiFilter: MoveFilter;
  expandedElement: Move | null;
  orderStatusFilter: FormGroup;

  searchSampleForm = new FormControl();


  columnsHeader = {
    '#': '#',
    'no': 'Mã phiếu chuyển',
    'branch_from': 'Từ chi nhánh',
    'branch_to': 'Đến chi nhánh',
    'status': 'Trạng thái',
  };

  displayedColumns: string[] = [
    '#', 'no', 'branch_from', 'branch_to', 'status'
  ];
  columnsToDisplay: string[] = [
    '#', 'no', 'branch_from', 'branch_to', 'status'
  ];

  statusFilterList = [
    {
      'value': '10',
      'name': 'Hoàn thành',
    },
    {
      'value': '9',
      'name': 'Khởi tạo',
    },
  ];

  statusList = {
    '10': 'Hoàn thành',
    '9': 'Khởi tạo'
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

  buildFilterFromParams(): MoveFilter {
    // tslint:disable-next-line:max-line-length
    function write<K extends keyof MoveFilter>(arg: MoveFilter, key: K, value: MoveFilter[K]): void {
      arg[key] = value;
    }

    const filter = new MoveFilter();
    const objectKeys = Object.keys(filter) as Array<keyof MoveFilter>;

    for (const attr of objectKeys) {
      write(filter, attr, this.route.snapshot.queryParams['MoveSearch[' + attr + ']']);
    }
    filter.page = this.route.snapshot.queryParams['page'];
    filter.pageSize = this.route.snapshot.queryParams['pageSize'];
    filter.sort = this.route.snapshot.queryParams['sort'];
    filter.expand = 'store,user,doneBy,branchFrom,branchTo';
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

        if (elementData.done_at !== 0) {
          const balance_date = new Date(1000 * elementData.done_at).toJSON().slice(0, 16);
          elementData.done_at = balance_date.slice(8, 10) + '/'
            + balance_date.slice(5, 7) + '/'
            + balance_date.slice(0, 4) + ' '
            + balance_date.slice(11, 16);
        } else {
          elementData.done_at = '';
        }
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
