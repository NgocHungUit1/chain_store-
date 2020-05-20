import {Component, OnInit, ViewChild} from '@angular/core';
import {MatPaginator} from "@angular/material/paginator";
import {MatTable} from "@angular/material/table";
import {MatSort} from "@angular/material/sort";
import {ProductFilter} from "../product.model";
import {ActivatedRoute} from "@angular/router";
import {ProductService} from "../product.service";
import {ListComponentBase} from "../../shared/base";
import {ProductMedicineDialogComponent} from "../product-medicine-dialog/product-medicine-dialog.component";
import {MatDialog} from "@angular/material/dialog";
import {NotifierService} from "angular-notifier";

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.css']
})
export class ProductListComponent extends ListComponentBase implements OnInit {

  constructor(
    private service: ProductService,
    private route: ActivatedRoute,
    private dialog: MatDialog,
    private notifySer: NotifierService
  ) {
    super();
  }

  @ViewChild(MatTable, { static: true }) table: MatTable<any>;
  @ViewChild('selectColumn') selectColumn;

  apiFilter: ProductFilter;

  columnsHeader = {
    '#': '#',
    'product_no': 'Mã hàng',
    'product_name': 'Tên hàng',
    'shortcut': 'Tên ngắn',
    'original_price': 'Giá gốc',
    'sell_price': 'Giá bán',
    'quantity_of_stock': 'Tồn kho'
  };

  displayedColumns: string[] = ['#', 'product_no', 'product_name', 'shortcut', 'original_price', 'sell_price', 'quantity_of_stock'];
  columnsToDisplay: string[] = ['#', 'product_no', 'product_name', 'shortcut', 'original_price', 'sell_price', 'quantity_of_stock'];
  dataSource = [];

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  isLoadingResults = true;
  isRateLimitReached = false;

  buildFilterFromParams(): ProductFilter {
    function write<K extends keyof ProductFilter>(arg: ProductFilter, key: K, value: ProductFilter[K]): void {
      arg[key] = value;
    }

    const filter = new ProductFilter();
    const objectKeys = Object.keys(filter) as Array<keyof ProductFilter>;

    for (const attr of objectKeys) {
      write(filter, attr, this.route.snapshot.queryParams['ProductSearch[' + attr + ']']);
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

  openProductMedicineDialog(action, obj) {
    obj.action = action;
    obj.title = 'Thêm thuốc';
    const dialogRef = this.dialog.open(ProductMedicineDialogComponent, {
      data: obj,
      width: '50%',
      minHeight: '80%',
    });

    dialogRef.afterClosed().subscribe(result => {
      this.loadData();
    });
  }

}
