import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTable } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { Product, ProductFilter } from '../product.model';
import { ActivatedRoute } from '@angular/router';
import { ProductService } from '../product.service';
import { ListComponentBase } from '../../shared/base';
import { ProductMedicineDialogComponent } from '../product-medicine-dialog/product-medicine-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { NotifierService } from 'angular-notifier';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { ProductMerchandiseFormDialogComponent } from '../product-merchandise-form-dialog/product-merchandise-form-dialog.component';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { catchError, debounceTime, map, startWith, switchMap } from 'rxjs/operators';
import { of } from 'rxjs/internal/observable/of';
import { ProductUploadDialogComponent } from '../product-upload-dialog/product-upload-dialog.component';


@Component({
  selector: 'app-product-list',
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.css'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({height: '0px', minHeight: '0'})),
      state('expanded', style({height: '*'})),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ]
})
export class ProductListComponent extends ListComponentBase implements OnInit {

  constructor(
    private service: ProductService,
    private route: ActivatedRoute,
    private dialog: MatDialog,
    private notifySer: NotifierService,
    private fb: FormBuilder,
  ) {
    super();
  }

  @ViewChild(MatTable, {static: true}) table: MatTable<any>;
  @ViewChild('selectColumn') selectColumn;

  apiFilter: ProductFilter;
  expandedElement: Product | null;

  typeProductFilter: FormGroup;

  typeProductFilterList = [
    {
      'value': 'medicine',
      'name': 'Thuốc',
    },
    {
      'value': 'merchandise',
      'name': 'Hàng hóa',
    },
  ];


  statusProductFilter: FormGroup;

  statusProductFilterList = [
    {
      'value': 10,
      'name': 'Kinh doanh',
    },
    {
      'value': 9,
      'name': 'Ngừng kinh doanh',
    },
  ];

  columnsHeader = {
    '#': '#',
    'product_type': 'Phân loại',
    'product_no': 'Mã hàng',
    'product_name': 'Tên hàng',
    'shortcut': 'Tên ngắn',
    'original_price': 'Giá vốn',
    'sell_price': 'Giá bán',
    'status': 'Trạng thái',
    // 'quantity_of_stock': 'Tồn kho'
  };

  productTypeLable = {
    'medicine': 'Thuốc',
    'merchandise': 'Hàng hóa',
  };

  displayedColumns: string[] = ['#', 'product_type', 'product_no', 'product_name', 'shortcut', 'original_price', 'sell_price', 'status'];
  columnsToDisplay: string[] = ['#', 'product_type', 'product_no', 'product_name', 'shortcut', 'original_price', 'sell_price', 'status'];
  dataSource: Product[] = [];

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  isLoadingResults = true;
  isRateLimitReached = false;

  searchProductForm = new FormControl();

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
    filter.expand = 'medicine,productUnits,productPlacements,group,images,quantity';
    filter.product_type = this.typeProductFilter.controls['status'].value;
    filter.status = this.statusProductFilter.controls['status'].value;
    return filter;
  }

  loadData(): void {
    this.isLoadingResults = true;
    this.service.getList(this.apiFilter).subscribe(res => {
      this.dataSource = res.body;
      let stt = 0;
      this.dataSource.forEach(elementData => {
        stt++;
        elementData.stt = stt;
      });
      this.reloadFilter(res);
      const url = this.service.getStateUrl(this.apiFilter);
      this.isLoadingResults = false;
    });
  }


  /**
   * Tim kiem theo phan loai sản phẩm
   */
  typeProductFilterChange() {
    this.apiFilter = this.buildFilterFromParams();
    this.loadData();
  }

  /**
   * Tim kiem theo trang thai sản phẩm
   */
  statusProductFilterChange() {
    this.apiFilter = this.buildFilterFromParams();
    this.loadData();
  }

  ngOnInit() {

    this.typeProductFilter = this.fb.group({
      status: [
        ['medicine', 'merchandise']
      ],
    });

    this.statusProductFilter = this.fb.group({
      status: [
        [10, 9]
      ],
    });

    this.apiFilter = this.buildFilterFromParams();
    this.loadData();

    this.service.subscribeLoadProduct.subscribe(action => {
      if (action === true) {
        this.apiFilter = this.buildFilterFromParams();
        this.loadData();
        this.service.setLoadProduct(false);
      }
    });

    this.searchProductForm.valueChanges.pipe(debounceTime(800)).subscribe(res => {
      if (res !== '') {
        this.apiFilter = this.buildFilterFromParams();
        this.apiFilter.keyword = res;
        this.loadData();
        this.service.setLoadProduct(false);
      } else {
        this.apiFilter = this.buildFilterFromParams();
        this.loadData();
        this.service.setLoadProduct(false);
      }
    });
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

  openUploadDialog() {
    const dialogRef = this.dialog.open(ProductUploadDialogComponent, {
      width: '30%',
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadData();
      }
    });
  }
}
