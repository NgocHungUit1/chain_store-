import {Component, OnInit, ViewChild} from '@angular/core';
import {MatPaginator} from "@angular/material/paginator";
import {MatTable} from "@angular/material/table";
import {MatSort} from "@angular/material/sort";
import {Product, ProductFilter} from "../product.model";
import {ActivatedRoute} from "@angular/router";
import {ProductService} from "../product.service";
import {ListComponentBase} from "../../shared/base";
import {ProductMedicineDialogComponent} from "../product-medicine-dialog/product-medicine-dialog.component";
import {MatDialog} from "@angular/material/dialog";
import {NotifierService} from "angular-notifier";
import {animate, state, style, transition, trigger} from "@angular/animations";
import { ProductMerchandiseFormDialogComponent } from '../product-merchandise-form-dialog/product-merchandise-form-dialog.component';

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.css'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ]
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
  expandedElement: Product | null;

  columnsHeader = {
    '#': '#',
    'product_type': 'Phân loại',
    'product_no': 'Mã hàng',
    'product_name': 'Tên hàng',
    'shortcut': 'Tên ngắn',
    'original_price': 'Giá gốc',
    'sell_price': 'Giá bán',
    'quantity_of_stock': 'Tồn kho'
  };

  productTypeLable = {
    'medicine': 'Thuốc',
    'merchandise': 'Hàng hóa',
  };

  displayedColumns: string[] = ['#','product_type', 'product_no', 'product_name', 'shortcut', 'original_price', 'sell_price', 'quantity_of_stock'];
  columnsToDisplay: string[] = ['#','product_type', 'product_no', 'product_name', 'shortcut', 'original_price', 'sell_price', 'quantity_of_stock'];
  dataSource: Product[] = [];

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
    filter.expand = 'medicine,productPlacements,group,images';
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
    obj.product_id = null;
    obj.copy_product_id = null;
    const dialogRef = this.dialog.open(ProductMedicineDialogComponent, {
      data: obj,
      width: '60%',
      minHeight: '80%',
    });

    dialogRef.afterClosed().subscribe(result => {
      this.loadData();
    });
  }

  openProductMerchandiseFormDialog(action, obj) {
      obj.action = action;
      obj.title = 'Thêm hàng hóa';
      obj.product_id = null;
      obj.copy_product_id = null;
    const dialogRef = this.dialog.open(ProductMerchandiseFormDialogComponent, {
        data: obj,
        width: '60%',
        minHeight: '80%',
    });

    dialogRef.afterClosed().subscribe(result => {
      this.loadData();
    });
  }

}
