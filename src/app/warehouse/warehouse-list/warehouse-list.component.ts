import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTable } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import {MatSort} from '@angular/material/sort';
import {ListComponentBase} from '../../shared/base';
import {ActivatedRoute} from '@angular/router';
import {MatDialog} from '@angular/material/dialog';
import {animate, state, style, transition, trigger} from '@angular/animations';
import {NotifierService} from 'angular-notifier';
import {WarehouseService} from '../warehouse.service';
import {Warehouse, WarehouseFilter} from '../warehouse.model';

@Component({
  templateUrl: './warehouse-list.component.html',
  styleUrls: ['./warehouse-list.component.css'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ]
})
export class WarehouseListComponent extends ListComponentBase implements OnInit {

  constructor(
    private mainService: WarehouseService,
    private dialog: MatDialog,
    private route: ActivatedRoute,
    private notifyService: NotifierService
  ) {
    super();
  }

  @ViewChild(MatTable, { static: true }) table: MatTable<any>;

  apiFilter: WarehouseFilter;

  columnsHeader = {
    '#': '#',
    'date': 'Ngày nhập',
    'supplier_id': 'Tên đối tác',
    'total_amount': 'Tổng tiền',
    'discount_amount': 'Giảm giá',
    'paid_amount': 'Đã trả',
    'remain_amount': 'Còn lại',
    'status': 'Trạng thái',
  };

  displayedColumns: string[] = [
    '#',
    'date',
    'supplier_id',
    'total_amount',
    'discount_amount',
    'paid_amount',
    'remain_amount',
    'status'
  ];
  columnsToDisplay: string[] = [
    '#',
    'date',
    'supplier_id',
    'total_amount',
    'discount_amount',
    'paid_amount',
    'remain_amount',
    'status'
  ];
  dataSource = [];
  expandedElement: Warehouse | null;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  isLoadingResults = true;
  isRateLimitReached = false;

  buildFilterFromParams(): WarehouseFilter {
    function write<K extends keyof WarehouseFilter>(arg: WarehouseFilter, key: K, value: WarehouseFilter[K]): void {
      arg[key] = value;
    }

    const filter = new WarehouseFilter();
    const objectKeys = Object.keys(filter) as Array<keyof WarehouseFilter>;

    for (const attr of objectKeys) {
      write(filter, attr, this.route.snapshot.queryParams['WarehouseSearch[' + attr + ']']);
    }
    filter.page = this.route.snapshot.queryParams['page'];
    filter.pageSize = this.route.snapshot.queryParams['pageSize'];
    filter.sort = this.route.snapshot.queryParams['sort'];
    filter.expand = 'supplier,created_user,product_count,total_quantity';
    filter.type = 'import';
    return filter;
  }

  loadData(): void {
    this.isLoadingResults = true;
    this.mainService.getList(this.apiFilter).subscribe(res => {
      this.dataSource = res.body;
      this.reloadFilter(res);
      this.isLoadingResults = false;
    });
  }

  ngOnInit() {
    this.apiFilter = this.buildFilterFromParams();
    this.loadData();
  }
}
