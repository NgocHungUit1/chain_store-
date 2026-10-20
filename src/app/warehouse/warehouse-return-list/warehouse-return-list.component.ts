import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTable } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import {MatSort} from '@angular/material/sort';
import {ListComponentBase} from '../../shared/base';
import {ActivatedRoute} from '@angular/router';
import {MatDialog} from '@angular/material/dialog';
import {animate, state, style, transition, trigger} from '@angular/animations';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms';
import {WarehouseService} from '../warehouse.service';
import {Warehouse, WarehouseFilter} from '../warehouse.model';
import {Store} from '../../store/store.model';
import {StoreService} from '../../store/store.service';
import {catchError, debounceTime, map, startWith, switchMap} from 'rxjs/operators';

@Component({
  templateUrl: './warehouse-return-list.component.html',
  styleUrls: ['./warehouse-return-list.component.css'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ]
})
export class WarehouseReturnListComponent extends ListComponentBase implements OnInit {

  constructor(
    private mainService: WarehouseService,
    private dialog: MatDialog,
    private route: ActivatedRoute,
    private storeSer: StoreService
  ) {
    super();
  }

  @ViewChild(MatTable, { static: true }) table: MatTable<any>;

  apiFilter: WarehouseFilter;
  /** Màn dùng chung cho Trả hàng nhập và Xuất huỷ (route data mode = 'destroy') */
  isDestroy = this.route.snapshot.data?.mode === 'destroy';
  basePath = this.isDestroy ? '/transaction/warehouse-destroy' : '/transaction/warehouse-return';
  destroyReasons = {expired: 'Hết hạn dùng', damaged: 'Hư hỏng, vỡ, biến chất', recall: 'Thu hồi theo quyết định', other: 'Lý do khác'};

  columnsHeader = {
    '#': '#',
    'date': 'Ngày trả',
    'supplier_id': 'Tên đối tác',
    'total_price': 'Tổng tiền hàng trả',
    'total_amount': 'NCC cần trả',
    'discount_amount': 'Giảm giá',
    'paid_amount': 'NCC đã trả',
    'remain_amount': 'Còn lại',
    'status': 'Trạng thái',
  };

  displayedColumns: string[] = [];
  columnsToDisplay: string[] = [
    '#',
    'date',
    'supplier_id',
    'total_price',
    'discount_amount',
    'total_amount',
    'paid_amount',
    'remain_amount',
    'status'
  ];
  dataSource = [];
  expandedElement: Warehouse | null;
  store: Store = null;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  isLoadingResults = true;
  isRateLimitReached = false;

  searchForm = new FormControl();

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
    filter.expand = 'supplier,created_user,product_count,total_quantity,nationalPharmacyV2';
    filter.type = this.isDestroy ? 'destroy' : 'return';
    return filter;
  }

  loadData(): void {
    this.displayedColumns = this.columnsToDisplay;
    this.isLoadingResults = true;
    this.mainService.getList(this.apiFilter).subscribe(res => {
      this.dataSource = res.body;
      this.reloadFilter(res);
      this.isLoadingResults = false;
    });
  }

  ngOnInit() {
    if (this.isDestroy) {
      this.columnsHeader['date'] = 'Ngày huỷ';
      this.columnsHeader['destroy_reason'] = 'Lý do huỷ';
      this.columnsToDisplay = ['#', 'date', 'destroy_reason', 'status'];
    }
    this.apiFilter = this.buildFilterFromParams();
    this.loadData();

    this.storeSer.getDetail().subscribe(res => {
      this.store = res;
    });

    this.searchForm.valueChanges.pipe(debounceTime(800)).subscribe(res => {
      if (res !== '') {
        this.apiFilter = this.buildFilterFromParams();
        this.apiFilter.keyword = res;
        this.loadData();
        // this.service.setLoadProduct(false);
      } else {
        this.apiFilter = this.buildFilterFromParams();
        this.loadData();
        // this.service.setLoadProduct(false);
      }
    });
  }
}
