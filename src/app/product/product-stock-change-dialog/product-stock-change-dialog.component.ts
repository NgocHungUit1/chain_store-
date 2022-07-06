import { Component, Inject, OnChanges, OnInit, Optional, SimpleChanges, ViewChild } from '@angular/core';
import { NotifierService } from 'angular-notifier';
import { ActivatedRoute } from '@angular/router';
import { StockCardService } from '../stock-card.service';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder } from '@angular/forms';
import { ListComponentBase } from '../../shared/base';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { StockCard, StockCardFilter } from '../stock-card.model';

@Component({
  selector: 'app-product-stock-change-dialog',
  templateUrl: './product-stock-change-dialog.component.html',
  styleUrls: ['./product-stock-change-dialog.component.css']
})
export class ProductStockChangeDialogComponent extends ListComponentBase implements OnInit {

  local_data: any;
  product_id: string;

  constructor(
    public notifySer: NotifierService,
    private route: ActivatedRoute,
    private stockCardService: StockCardService,
    private dialog: MatDialog,
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<ProductStockChangeDialogComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: Object
  ) {
    super();
    this.local_data = {...data};
    this.product_id = this.local_data.product_id;
  }
  @ViewChild(MatTable, {static: true}) table: MatTable<any>;
  @ViewChild('selectColumn') selectColumn;

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
    'delete-import': 'Xóa đơn nhập hàng',
    'return': 'Trả hàng nhập',
    'stock-take': 'Kiểm kho',
    'sale': 'Bán hàng',
    'return-sale': 'Trả hàng bán',
    'move-from': 'Chuyển hàng đi',
    'move-to': 'Chuyển hàng đến',
  };

  apiFilter: StockCardFilter;
  isLoadingResults = false;
  isRateLimitReached = false;

  dataSet: StockCard[] = [];
  stockCardDataSource = new MatTableDataSource<StockCard>([]);

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;


  ngOnInit(): void {
    // if (this.expandedElement) {
    //
    // }
    this.apiFilter = this.buildFilterFromParams();
    this.loadData();
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
    filter.pageSize = 10; //this.route.snapshot.queryParams['pageSize'];
    filter.sort = this.route.snapshot.queryParams['sort'];
    filter.product_id = this.product_id;
    filter.expand = '';
    return filter;
  }

  loadData() {
    this.isLoadingResults = true;

    this.stockCardService.getList(this.apiFilter).subscribe(res => {
      this.dataSet = res.body;
      this.stockCardDataSource = new MatTableDataSource<StockCard>(this.dataSet);
      this.reloadFilter(res);
      this.isLoadingResults = false;
    });
  }

  closeDialog() {
    this.dialogRef.close({event: 'Cancel'});
  }

}
