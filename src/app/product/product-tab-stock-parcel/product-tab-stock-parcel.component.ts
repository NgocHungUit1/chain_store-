import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { element } from 'protractor';
import { Product, ProductUnit, Quantity } from '../product.model';
import { ProductService } from '../product.service';
import {WarehouseProductParcelService} from '../../warehouse-product-parcel/warehouse-product-parcel.service';
import {MatTableDataSource} from '@angular/material/table';
import {StockCard, StockCardFilter} from '../stock-card.model';
import {
  WarehouseProductParcel,
  WarehouseProductParcelFilter
} from '../../warehouse-product-parcel/warehouse-product-parcel.model';
import {ListComponentBase} from '../../shared/base';
import {ActivatedRoute} from '@angular/router';

@Component({
  selector: 'app-product-tab-stock-parcel',
  templateUrl: './product-tab-stock-parcel.component.html',
  styleUrls: ['./product-tab-stock-parcel.component.css']
})
export class ProductTabStockParcelComponent extends ListComponentBase implements OnChanges {

  @Input() product_id: string;
  @Input() expandedElement: boolean;
  @Output() reload: EventEmitter<any> = new EventEmitter();

  apiFilter: WarehouseProductParcelFilter;
  isLoadingResults = false;
  isRateLimitReached = false;
  displayedColumns: string[] = ['#', 'parcel_no', 'expiration_date', 'quantity_of_stock'];

  columnsHeader = {
    '#': '#',
    'parcel_no': 'Số lô',
    'quantity_of_stock': 'Tồn kho',
    'expiration_date': 'Hạn dùng',
  };

  data: WarehouseProductParcel[] = [];
  parcelDataSource = new MatTableDataSource<WarehouseProductParcel>([]);

  constructor(
    private productService: ProductService,
    private warehouseParcelService: WarehouseProductParcelService,
    private route: ActivatedRoute
  ) {
    super();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.expandedElement) {
      this.apiFilter = this.buildFilterFromParams();
      this.loadData();
    }
  }

  loadData() {
    this.isLoadingResults = true;

    this.warehouseParcelService.getList(this.apiFilter).subscribe(res => {
      this.data = res.body;
      // console.log(this.data);
      this.parcelDataSource = new MatTableDataSource<WarehouseProductParcel>(this.data);
      this.isLoadingResults = false;
      this.reloadFilter(res);
    });
  }

  buildFilterFromParams(): WarehouseProductParcelFilter {
    function write<K extends keyof WarehouseProductParcelFilter>(arg: WarehouseProductParcelFilter, key: K, value: WarehouseProductParcelFilter[K]): void {
      arg[key] = value;
    }

    const filter = new WarehouseProductParcelFilter();

    const objectKeys = Object.keys(filter) as Array<keyof WarehouseProductParcelFilter>;

    for (const attr of objectKeys) {
      write(filter, attr, this.route.snapshot.queryParams['WarehouseProductParcelSearch[' + attr + ']']);
    }

    filter.page = this.route.snapshot.queryParams['page'];
    filter.pageSize = this.route.snapshot.queryParams['pageSize'];
    filter.sort = this.route.snapshot.queryParams['sort'];
    filter.product_id = this.product_id;
    filter.hasStock = 1;
    filter.expand = '';
    return filter;
  }


}
