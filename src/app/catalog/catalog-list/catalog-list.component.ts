import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource, MatTable } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import {CatalogFilter, Category} from "../catalog.model";
import {MatSort} from "@angular/material/sort";
import {ListComponentBase} from "../../shared/base";
import {CatalogService} from "../catalog.service";
import {ActivatedRoute} from "@angular/router";

@Component({
  templateUrl: './catalog-list.component.html',
  styleUrls: ['./catalog-list.component.css']
})
export class CatalogListComponent extends ListComponentBase implements OnInit {

  constructor(
    private service: CatalogService,
    private route: ActivatedRoute
  ) {
    super();
  }

  @ViewChild(MatTable, { static: true }) table: MatTable<any>;

  apiFilter: CatalogFilter;

  columnsHeader = {
    '#': '#',
    'medicine_no': 'Mã thuốc',
    'medicine_name': 'Tên thuốc',
    'registration_no': 'Số đăng ký',
    'main_active_substance': 'Hoạt chất chính',
    'content': 'Hàm lượng',
    'packing': 'Đóng gói',
    'manufacturer': 'Nhà sản xuất',
    'made_in': 'Nơi sản xuất',
    'unit': 'Đơn vị',
  };

  displayedColumns: string[] = ['#', 'medicine_no', 'medicine_name', 'registration_no', 'main_active_substance', 'manufacturer', 'made_in', 'unit'];
  columnsToDisplay: string[] = ['#', 'medicine_no', 'medicine_name', 'registration_no', 'main_active_substance', 'content', 'packing', 'manufacturer', 'made_in', 'unit'];
  dataSource = [];

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  resultsLength = 0;
  isLoadingResults = true;
  isRateLimitReached = false;

  buildFilterFromParams(): CatalogFilter {
    function write<K extends keyof CatalogFilter>(arg: CatalogFilter, key: K, value: CatalogFilter[K]): void {
      arg[key] = value;
    }

    const filter = new CatalogFilter();
    const objectKeys = Object.keys(filter) as Array<keyof CatalogFilter>;

    for (const attr of objectKeys) {
      write(filter, attr, this.route.snapshot.queryParams['MedicineCategorySearch[' + attr + ']']);
    }
    filter.page = this.route.snapshot.queryParams['page'];
    filter.pageSize = this.route.snapshot.queryParams['pageSize'];
    filter.sort = this.route.snapshot.queryParams['sort'];
    return filter;
  }

  loadData(): void {
    this.isLoadingResults = true;
    this.service.getList(this.apiFilter).subscribe(res => {
      this.dataSource = res.body;
      this.reloadFilter(res);
      const url = this.service.getStateUrl(this.apiFilter);
      this.isLoadingResults = false;
    });
  }

  ngOnInit() {
    this.apiFilter = this.buildFilterFromParams();
    this.loadData();
  }
}
