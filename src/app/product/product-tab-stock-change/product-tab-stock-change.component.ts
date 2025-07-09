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
import { ProductStockChangeDialogComponent } from '../product-stock-change-dialog/product-stock-change-dialog.component';

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

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  displayedColumns: string[] = ['#', 'no', 'date', 'method', 'parcel_no', 'created_date', 'quantity', 'quantity_of_stock'];

  columnsHeader = {
    '#': '#',
    'no': 'Chứng từ',
    'method': 'Phương thức',
    'date': 'Ngày chứng từ',
    'created_date': 'Ngày hệ thống',
    'parcel_no': 'Số lô',
    'quantity': 'Thay đổi',
    'quantity_of_stock': 'Tồn cuối'
  };

  methodLabels = {
    'import': 'Nhập hàng',
    'delete-import': 'Xóa đơn nhập hàng',
    'return': 'Trả hàng nhập',
    'delete-return': 'Xoá đơn trả hàng nhập',
    'stock-take': 'Kiểm kho',
    'sale': 'Bán hàng',
    'delete-sale': 'Hủy bỏ phiếu bán hàng',
    'return-sale': 'Trả hàng bán',
    'move-from': 'Chuyển hàng đi',
    'move-to': 'Chuyển hàng đến',
  };

  methodLinks = {
    'import': '/transaction/warehouse/code/',
    'return': '/transaction/returns/code/',
    'stock-take': '/store/stock-take/code/',
    'sale': '/transaction/invoice/',
    'return-sale': '#',
    'move-from': '/transaction/move/code/',
    'move-to': '/transaction/move/code/',
  };

  downloadLink = null;


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
    this.downloadLink = this.stockCardService.getDownloadLink(this.apiFilter);

    this.stockCardService.getList(this.apiFilter).subscribe(res => {
      this.data = res.body;
      // console.log(this.data);
      this.stockCardDataSource = new MatTableDataSource<StockCard>(this.data);
      this.isLoadingResults = false;
      this.reloadFilter(res);
    });
  }

  openProductStockChangeDialog() {
    const obj = {
      // action: copy_product_id !== null ? 'Copy' : 'Update',
      // title: copy_product_id !== null ? 'Sao chép hàng hóa' : 'Cập nhật hàng hóa',
      product_id: this.product_id,
      // copy_product_id: copy_product_id
    };

    const dialogRef = this.dialog.open(ProductStockChangeDialogComponent, {
      data: obj,
      width: '80%',
      minHeight: '80%',
      // maxHeight: '500px'
    });

    dialogRef.afterClosed().subscribe(result => {
      // if (result.event !== 'Cancel') {
      //   // this.loadProduct(result.data.id);
      // }
    });
  }
}
