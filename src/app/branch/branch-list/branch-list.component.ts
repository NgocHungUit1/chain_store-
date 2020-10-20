import {Component, OnInit, ViewChild} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {ActivatedRoute} from '@angular/router';
import {NotifierService} from 'angular-notifier';
import {MatTable} from '@angular/material/table';
import {MatPaginator} from '@angular/material/paginator';
import {MatSort} from '@angular/material/sort';
import {ListComponentBase} from '../../shared/base';
import {animate, state, style, transition, trigger} from '@angular/animations';
import {Branch, BranchFilter} from '../branch.model';
import {BranchService} from '../branch.service';
import {BranchFormDialogComponent} from '../branch-form-dialog/branch-form-dialog.component';


@Component({
  selector: 'app-branch-list',
  templateUrl: './branch-list.component.html',
  styleUrls: ['./branch-list.component.css'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ]
})
export class BranchListComponent extends ListComponentBase implements OnInit {

  constructor(
    private service: BranchService,
    private dialog: MatDialog,
    private route: ActivatedRoute,
    private notifyService: NotifierService
  ) {
    super();
  }

  @ViewChild(MatTable, { static: true }) table: MatTable<any>;

  apiFilter: BranchFilter;

  columnsHeader = {
    '#': '#',
    'name': 'Tên chi nhánh',
    'address': 'Địa chỉ',
    'phone_number': 'Điện thoại',
    'total_employee' : 'Số lượng người dùng',
    'status': 'Trạng thái',
  };

  displayedColumns: string[] = [
    '#',
    'name',
    'address',
    'phone_number',
    'total_employee',
    'status',
  ];
  columnsToDisplay: string[] = [
    '#',
    'name',
    'address',
    'phone_number',
    'total_employee',
    'status',
  ];

  dataSource = [];
  expandedElement: Branch | null;


  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  isLoadingResults = true;
  isRateLimitReached = false;

  buildFilterFromParams(): BranchFilter {
    function write<K extends keyof BranchFilter>(arg: BranchFilter, key: K, value: BranchFilter[K]): void {
      arg[key] = value;
    }

    const filter = new BranchFilter();
    const objectKeys = Object.keys(filter) as Array<keyof BranchFilter>;

    for (const attr of objectKeys) {
      write(filter, attr, this.route.snapshot.queryParams['BranchFilterSearch[' + attr + ']']);
    }
    filter.page = this.route.snapshot.queryParams['page'];
    filter.pageSize = this.route.snapshot.queryParams['pageSize'];
    filter.sort = this.route.snapshot.queryParams['sort'];
    filter.expand = 'province,district,ward,user';
    return filter;
  }

  loadData(): void {
    this.isLoadingResults = true;
    this.service.getList(this.apiFilter).subscribe(res => {
      this.dataSource = res.body;
      this.reloadFilter(res);
      this.isLoadingResults = false;
    });
  }

  ngOnInit(): void {
    this.apiFilter = this.buildFilterFromParams();
    this.loadData();

    this.service.subscribeLoadBranch.subscribe(action => {
      if (action === true) {
        this.apiFilter = this.buildFilterFromParams();
        this.loadData();
        this.service.setLoadBranch(false);
      }
    });
  }

  openBranchFormDialog() {
    const dialogRef = this.dialog.open(BranchFormDialogComponent, {
      width: '80%',
      minHeight: '80%',
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadData();
      }
    });
  }


}
