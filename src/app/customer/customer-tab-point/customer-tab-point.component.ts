import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { Point, PointFilter } from '../../point/point.model';
import { ActivatedRoute } from '@angular/router';
import { MatTable } from '@angular/material/table';
import { PointService } from '../../point/point.service';
import { ListComponentBase } from '../../shared/base';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';

@Component({
  selector: 'app-customer-tab-point',
  templateUrl: './customer-tab-point.component.html',
  styleUrls: ['./customer-tab-point.component.css'],
})
export class CustomerTabPointComponent extends ListComponentBase implements OnInit {

  constructor(
    private route: ActivatedRoute,
    private pointService: PointService,
  ) {
    super();
  }

  @Input() customerId: string;
  @Output() reload: EventEmitter<any> = new EventEmitter();

  @ViewChild(MatTable, { static: true }) table: MatTable<any>;
  @ViewChild('selectColumn') selectColumn;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  displayedColumns: string[] = ['invoice_no', 'total_price', 'point', 'new_total_point', 'created_at'];
  columnsHeader = {
    'invoice_no': 'Mã hóa đơn',
    'total_price': 'Trị giá',
    'point': 'Điểm GD',
    'new_total_point': 'Điểm sau GD',
    'created_at': 'Thời gian',
  };

  apiFilter: PointFilter;
  isLoadingResults = false;
  isRateLimitReached = false;

  data: Point[] = [];

  ngOnInit(): void {
      this.apiFilter = this.buildFilterFromParams();
      this.loadData();
  }

  buildFilterFromParams(): PointFilter {
    function write<K extends keyof PointFilter>(arg: PointFilter, key: K, value: PointFilter[K]): void {
      arg[key] = value;
    }

    const filter = new PointFilter();
    const objectKeys = Object.keys(filter) as Array<keyof PointFilter>;
    for (const attr of objectKeys) {
      write(filter, attr, this.route.snapshot.queryParams['PointSearch[' + attr + ']']);
    }

    filter.page = this.route.snapshot.queryParams['page'];
    filter.pageSize = this.route.snapshot.queryParams['pageSize'];
    filter.sort = this.route.snapshot.queryParams['sort'];
    filter.customer_id = this.customerId;
    filter.expand = 'invoice';
    return filter;
  }

  loadData() {
    this.isLoadingResults = true;
    this.pointService.getList(this.apiFilter).subscribe(res => {
      this.data = res.body;
      this.isLoadingResults = false;
      this.reloadFilter(res);
    });
  }
}
