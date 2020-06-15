import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from "@angular/material/paginator";
import { MatTable } from "@angular/material/table";
import { MatSort } from "@angular/material/sort";
import { PriceBookProduct, PriceBookProductFilter } from "../price-book-product.model";
import { ActivatedRoute } from "@angular/router";
import { PriceBookProductService } from "../price-book-product.service";
import { ListComponentBase } from "../../shared/base";
import { MatDialog } from "@angular/material/dialog";
import { NotifierService } from "angular-notifier";
import { animate, state, style, transition, trigger } from "@angular/animations";
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-price-book-list',
  templateUrl: './price-book-list.component.html',
  styleUrls: ['./price-book-list.component.css'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ]
})
export class PriceBookListComponent extends ListComponentBase implements OnInit {

  constructor(
    private service: PriceBookProductService,
    private route: ActivatedRoute,
    private dialog: MatDialog,
    private notifySer: NotifierService
  ) {
    super();
  }

  @ViewChild(MatTable, { static: true }) table: MatTable<any>;
  @ViewChild('selectColumn') selectColumn;

  apiFilter: PriceBookProductFilter;
  expandedElement: PriceBookProduct | null;
  key_work: string;
  columnsHeader = {
    '#': '#',
    'product_type': 'Phân loại',
    'product_no': 'Mã hàng',
    'product_name': 'Tên hàng',
    'original_price': 'Giá gốc',
    'sell_price': 'Giá bán',
  };

  productTypeLable = {
    'medicine': 'Thuốc',
    'merchandise': 'Hàng hóa',
  };

  displayedColumns: string[] = ['#', 'product_type', 'product_no', 'product_name', 'original_price', 'sell_price'];
  columnsToDisplay: string[] = ['#', 'product_type', 'product_no', 'product_name', 'original_price', 'sell_price'];
  dataSource: PriceBookProduct[] = [];

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  isLoadingResults = true;
  isRateLimitReached = false;


  buildFilterFromParams(): PriceBookProductFilter {
    function write<K extends keyof PriceBookProductFilter>(arg: PriceBookProductFilter, key: K, value: PriceBookProductFilter[K]): void {
      arg[key] = value;
    }

    const filter = new PriceBookProductFilter();
    const objectKeys = Object.keys(filter) as Array<keyof PriceBookProductFilter>;

    for (const attr of objectKeys) {
      write(filter, attr, this.route.snapshot.queryParams['ProductSearch[' + attr + ']']);
    }
    filter.page = this.route.snapshot.queryParams['page'];
    filter.pageSize = this.route.snapshot.queryParams['pageSize'];
    filter.sort = this.route.snapshot.queryParams['sort'];
    filter.expand = 'medicine,productPlacements,group,images';
    filter.product_name = this.key_work;
    filter.product_no = this.key_work;
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

    this.service.subscribeLoadProduct.subscribe(action => {
      if (action === true) {
        this.apiFilter = this.buildFilterFromParams();
        this.loadData();
        this.service.setLoadProduct(false);
      }
    });
  }

  inputSearch(event: any) {
    this.key_work = event.target.value;
    this.apiFilter = this.buildFilterFromParams();
    this.loadData();
  }

}
