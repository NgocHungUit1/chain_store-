import { Component, Inject, OnInit, Optional, ViewChild } from '@angular/core';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { ListComponentBase } from '../../shared/base';
import { MedicineService } from '../../medicine/medicine.service';
import { ProductService } from '../../product/product.service';
import { ActivatedRoute } from '@angular/router';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { NotifierService } from 'angular-notifier';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { GroupService } from '../../product/group.service';
import { MatTable } from '@angular/material/table';
import { Product, ProductFilter } from '../../product/product.model';
import { Group, GroupFilter } from '../../product/group.model';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { debounceTime } from 'rxjs/operators';
import { ProductMedicineDialogComponent } from '../../product/product-medicine-dialog/product-medicine-dialog.component';
import {
  ProductMerchandiseFormDialogComponent
} from '../../product/product-merchandise-form-dialog/product-merchandise-form-dialog.component';
import { ProductUploadDialogComponent } from '../../product/product-upload-dialog/product-upload-dialog.component';

@Component({
  selector: 'app-search-product-dialog',
  templateUrl: './search-product-dialog.component.html',
  styleUrls: ['./search-product-dialog.component.css'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({height: '0px', minHeight: '0'})),
      state('expanded', style({height: '*'})),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ]
})
export class SearchProductDialogComponent extends ListComponentBase implements OnInit {

  constructor(
    private medicineService: MedicineService,
    private service: ProductService,
    private route: ActivatedRoute,
    private dialog: MatDialog,
    private notifySer: NotifierService,
    private fb: FormBuilder,
    private groupSer: GroupService,
    public dialogRef: MatDialogRef<SearchProductDialogComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: Object
  ) {
    super();
  }

  @ViewChild(MatTable, {static: true}) table: MatTable<any>;
  @ViewChild('selectColumn') selectColumn;

  apiFilter: ProductFilter;
  expandedElement: Product | null;

  productFilter: FormGroup;

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
  groupProductFilter: FormGroup;
  groups: Group[] = [];

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

  stockFilterList = [
    {
      'value': 'empty',
      'name': 'Hết hàng',
    },
    {
      'value': 'have',
      'name': 'Còn hàng',
    },
  ];

  columnsHeader = {
    '#': '#',
    // 'product_type': 'Phân loại',
    'product_no': 'Mã hàng',
    'product_name': 'Tên hàng',
    'base_unit': 'Đơn vị',
    'original_price': 'Giá vốn',
    'sell_price': 'Giá bán',
    'status': 'Trạng thái',
    'quantity': 'Tồn kho'
  };

  productTypeLable = {
    'medicine': 'Thuốc',
    'merchandise': 'Hàng hóa',
  };

  displayedColumns: string[] = ['#', 'product_no', 'product_name', 'base_unit', 'original_price', 'sell_price', 'quantity', 'status'];
  columnsToDisplay: string[] = ['#', 'product_no', 'product_name', 'base_unit', 'original_price', 'sell_price', 'quantity', 'status'];
  dataSource: Product[] = [];

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  isLoadingResults = true;
  isRateLimitReached = false;

  searchProductForm = new FormControl();
  codeSearch = null;

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
    filter.pageSize = 10;//this.route.snapshot.queryParams['pageSize'];
    filter.sort = this.route.snapshot.queryParams['sort'];
    // filter.expand = 'medicine,productUnits,productPlacements,group,images,quantity';
    filter.expand = 'quantity';
    filter.product_type = this.productFilter.controls['type'].value;
    filter.status = this.productFilter.controls['status'].value;
    filter.group_id = this.productFilter.controls['group'].value;
    filter.stock = this.productFilter.controls['stock'].value;
    return filter;
  }

  clickChoose(id) {
    this.dialogRef.close({
      event: 'Choose',
      product_id: id,
    });
  }

  loadData(): void {
    const code = this.route.snapshot.paramMap.get('code');
    if (code !== null && code !== undefined) {
      if (this.codeSearch == null) {
        this.apiFilter.product_no = code;
        this.codeSearch = code;
      } else {
        this.apiFilter.product_no = '';
      }
    }

    this.isLoadingResults = true;
    this.service.getList(this.apiFilter).subscribe(res => {
      this.dataSource = res.body;
      let stt = 0;
      if (this.dataSource.length === 1) {
        const arr = this.dataSource;
        this.expandedElement = arr[0];
      }
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

    this.productFilter = this.fb.group({
      type: [
        ['medicine', 'merchandise']
      ],
      status: [
        [10, 9]
      ],
      group: [null],
      stock: [
        ['empty', 'have']
      ],
    });

    const groupFilter = new GroupFilter();
    groupFilter.pageSize = 100;
    // groupFilter.store_id = 1;
    this.groupSer.getList(groupFilter).subscribe(res => {
      this.groups = res.body;
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
      minWidth: '750px',
      minHeight: '80%',
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result.event === 'Save' && result.connect === true) {
        this.service.getDetail(result.data.id).subscribe(product => {
          // @ts-ignore
          this.medicineService.connect(product.medicine_id).subscribe(res => {
            if (res['success']) {
              this.notifySer.notify('success', 'Liên thông thành công.');
            } else if (res['message'] !== undefined) {
              this.notifySer.notify('error', res['message']);
            }
            this.loadData();
          });
        });

      } else {
        if (result.event !== 'Cancel') {
          this.loadData();
        }
      }
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
      minWidth: '750px',
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

  exportExcel() {
    // debugger;
    this.apiFilter = this.buildFilterFromParams();
    this.service.exportExcel(this.apiFilter).subscribe(res => {
      window.location.href = this.service.downloadFileExcel();
    });
  }
}

