import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { StockCard, StockCardFilter } from '../stock-card.model';
import { NotifierService } from 'angular-notifier';
import { ActivatedRoute } from '@angular/router';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { StockCardService } from '../stock-card.service';
import { ListComponentBase } from '../../shared/base';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatDialog } from '@angular/material/dialog';
import { FormBuilder } from '@angular/forms';

@Component({
  selector: 'app-product-tab-stock-change',
  templateUrl: './product-tab-stock-change.component.html',
  styleUrls: ['./product-tab-stock-change.component.css'],
})
export class ProductTabStockChangeComponent extends ListComponentBase implements OnChanges {

  constructor(
    public notifySer: NotifierService,
    private route: ActivatedRoute,
    private stockCardService: StockCardService,
    private dialog: MatDialog,
    private fb: FormBuilder,
  ) {
    super();
  }

  @Input() product_id: string;
  @Input() expandedElement: boolean;
  @Output() reload: EventEmitter<any> = new EventEmitter();



  @ViewChild(MatTable, {static: true}) table: MatTable<any>;
  @ViewChild('selectColumn') selectColumn;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  displayedColumns: string[] = ['#', 'no', 'method', 'date', 'quantity', 'quantity_of_stock'];

  columnsHeader = {
    '#': '#',
    'no': 'Chứng từ',
    'method': 'Phương thức',
    'date': 'Thời gian',
    'quantity': 'Thay đổi',
    'quantity_of_stock': 'Tồn cuối'
  };

  methodLabels = {
    'import': 'Nhập hàng',
    'return': 'Trả hàng nhập',
    'stock-take': 'Kiểm kho',
    'sale': 'Bán hàng',
    'return-sale': 'Trả hàng bán',
  };

  apiFilter: StockCardFilter;
  isLoadingResults = false;
  isRateLimitReached = false;

  data: StockCard[] = [];
  stockCardDataSource = new MatTableDataSource<StockCard>([]);

  ngOnChanges(changes: SimpleChanges) {
    if (this.expandedElement) {
      this.apiFilter = this.buildFilterFromParams();
      this.loadData();
    }
  }


  buildFilterFromParams(): StockCardFilter {
    function write<K extends keyof StockCardFilter>(arg: StockCardFilter, key: K, value: StockCardFilter[K]): void {
      arg[key] = value;
    }

    const filter = new StockCardFilter();

    const objectKeys = Object.keys(filter) as Array<keyof StockCardFilter>;

    for (const attr of objectKeys) {
      write(filter, attr, this.route.snapshot.queryParams['StockCardSearch[' + attr + ']']);
    }

    filter.page = this.route.snapshot.queryParams['page'];
    filter.pageSize = this.route.snapshot.queryParams['pageSize'];
    filter.sort = this.route.snapshot.queryParams['sort'];
    filter.product_id = this.product_id;
    filter.expand = '';
    return filter;
  }

  loadData() {
    this.isLoadingResults = true;

    this.stockCardService.getList(this.apiFilter).subscribe(res => {
      this.data = res.body;
      // this.stockCardDataSource = new MatTableDataSource<StockCard>(this.data);
      this.isLoadingResults = false;
    });
  }
}
