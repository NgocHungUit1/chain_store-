import {Component, OnInit, ViewChild} from '@angular/core';
import {MatPaginator} from '@angular/material/paginator';
import {MatTable} from '@angular/material/table';
import {MatSort} from '@angular/material/sort';
import {Location} from '@angular/common';
import {Product, ProductFilter} from '../product.model';
import {ActivatedRoute} from '@angular/router';
import {ProductService} from '../product.service';
import {ListComponentBase} from '../../shared/base';
import {ProductMedicineDialogComponent} from '../product-medicine-dialog/product-medicine-dialog.component';
import {MatDialog} from '@angular/material/dialog';
import {NotifierService} from 'angular-notifier';
import {animate, state, style, transition, trigger} from '@angular/animations';
import {ProductMerchandiseFormDialogComponent} from '../product-merchandise-form-dialog/product-merchandise-form-dialog.component';
import {FormBuilder, FormControl, FormGroup} from '@angular/forms';
import {debounceTime} from 'rxjs/operators';
import {ProductUploadDialogComponent} from '../product-upload-dialog/product-upload-dialog.component';
import {MedicineService} from '../../medicine/medicine.service';
import {GroupService} from '../group.service';
import {Group, GroupFilter} from '../group.model';
import {SelectionModel} from '@angular/cdk/collections';
import {Warehouse} from '../../warehouse/warehouse.model';
import {PopupConfirmDialogComponent} from '../../common/popup-confirm-dialog/popup-confirm-dialog.component';
import {PrintMultipleProductDialogComponent} from '../print-multiple-product-dialog/print-multiple-product-dialog.component';
import {AuthService} from '../../authentication/auth.service';
import {ProductNationalScanDialogComponent} from '../product-national-scan-dialog/product-national-scan-dialog.component';
import {ProductNationalCompareDialogComponent} from '../product-national-compare-dialog/product-national-compare-dialog.component';


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
    private medicineService: MedicineService,
    private service: ProductService,
    private route: ActivatedRoute,
    private dialog: MatDialog,
    private notifySer: NotifierService,
    private fb: FormBuilder,
    private location: Location,
    private groupSer: GroupService,
    public authSer: AuthService
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

  quotaStockFilterList = [
    {
      'value': 'lower',
      'name': 'Thiếu định mức',
    },
    {
      'value': 'upper',
      'name': 'Vượt định mức',
    },
  ];

  nationalCheckFilterList = [
    {
      'value': 'ready',
      'name': 'Đã liên thông',
    },
    {
      'value': 'blocked',
      'name': 'Chưa liên thông',
    },
    {
      'value': 'not_required',
      'name': 'Không cần',
    },
    {
      'value': 'none',
      'name': 'Chưa quét',
    },
  ];

  batchTrackingFilterList = [
    {
      'value': 1,
      'name': 'Quản lý theo lô',
    },
    {
      'value': 0,
      'name': 'Không theo lô',
    },
  ];

  columnsHeader = {
    '#': '#',
    // 'product_type': 'Phân loại',
    'product_no': 'Mã hàng',
    'product_name': 'Tên hàng',
    'base_unit': 'Đơn vị',
    'original_price': 'Giá vốn',
    'avg_original_price': 'Giá vốn bình quân',
    'sell_price': 'Giá bán',
    'status': 'Trạng thái',
    'quantity': 'Tồn kho',
    'barcode': 'Mã vạch',
    'product_type': 'Loại hàng',
    'shortcut': 'Tên viết tắt',
    'using_id': 'Đường dùng',
    'group_id': 'Nhóm hàng',
    'placements': 'Vị trí',
    'weight': 'Trọng lượng',
    // Medicine
    'registration_no': 'Số đăng ký',
    'main_active_substance': 'Hoạt chất',
    'content': 'Hàm lượng',
    'packing': 'Quy cách đóng gói',
    'manufacturer': 'Hãng sản xuất',
    'made_in': 'Nước sản xuất',
    'unit_name': 'Tên đơn vị',
    'unit_value': 'Giá trị quy đổi',
    'unit_price': 'Giá bán',
    'unit_no': 'Mã đơn vị',
    'medicine_id': 'Thông tin thuốc',
    'min_quantity': 'Tồn tối thiểu',
    'max_quantity': 'Tồn tối đa',
    'comm_percent': 'Hoa hồng',
    'batch_tracking_enabled': 'Quản lý theo lô',
    'national_check': 'Liên thông DQG',
  };

  productTypeLable = {
    'medicine': 'Thuốc',
    'merchandise': 'Hàng hóa',
  };

  displayedColumns: string[] = ['select', '#', 'product_no', 'product_name', 'base_unit', 'original_price', 'sell_price', 'quantity', 'batch_tracking_enabled', 'national_check', 'status'];
  columnsToDisplay: string[] = ['select', '#', 'product_no', 'product_name', 'base_unit', 'original_price', 'sell_price', 'quantity', 'batch_tracking_enabled', 'national_check', 'status'];
  dataSource: Product[] = [];
  selection = new SelectionModel<Product>(true, []);
  toggleMore = false;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  isLoadingResults = true;
  isRateLimitReached = false;

  searchProductForm = new FormControl();
  codeSearch = null;

  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource?.length;
    return numSelected === numRows;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  toggleAllRows() {
    if (this.isAllSelected()) {
      this.selection.clear();
      return;
    }
    this.selection.select(...this.dataSource);
  }

  /** The label for the checkbox on the passed row */
  checkboxLabel(row?: Product): string {
    if (!row) {
      return `${this.isAllSelected() ? 'deselect' : 'select'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row?.id + 1}`;
  }

  lockSelect() {
    const obj = {
      action: 'Delete',
      title: 'Xác nhận tạm ngừng danh sách đã chọn .',
      content: '',
    };

    const dialogRef = this.dialog.open(PopupConfirmDialogComponent, {
      data: obj,
      width: '30%',
      minHeight: '60%',
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result?.event === 'confirm') {
        let itemsProcessed = 0;
        this.selection.selected.forEach((item, index, array) => {
          this.service.lock(item.id).subscribe(res => {
            // if (res?.success) {
            //
            // } else {
            //   this.notifySer.notify('warning', res?.message);
            // }
            itemsProcessed++;
            if (itemsProcessed === array.length) {
              this.refreshData();
            }
          });

        });
      }
    });
  }

  openPrintMultipleProduct(useQuality = true) {
    const data = this.selection.selected?.map((item) => ({
      ...item,
      ...(useQuality && { print_quantity: item.quantity?.number }),
      selected_unit: item['productUnit'],
    }));
    const dialogRef = this.dialog.open(PrintMultipleProductDialogComponent, {
      data: {
        selected: data,
        unitUpdate: true,
      },
      width: '50%',
      minHeight: '60%',
    });
    dialogRef.afterClosed().subscribe(result => {
    });
  }

  activateSelect() {
    const obj = {
      action: 'Delete',
      title: 'Xác nhận kích hoạt danh sách đã chọn .',
      content: '',
    };

    const dialogRef = this.dialog.open(PopupConfirmDialogComponent, {
      data: obj,
      width: '30%',
      minHeight: '60%',
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result?.event === 'confirm') {
        let itemsProcessed = 0;
        this.selection.selected.forEach((item, index, array) => {
          this.service.activate(item.id).subscribe(res => {
            // if (res?.success) {
            //
            // } else {
            //   this.notifySer.notify('warning', res?.message);
            // }
            itemsProcessed++;
            if (itemsProcessed === array.length) {
              this.refreshData();
            }
          });

        });
      }
    });
  }

  deleteSelect() {
    const obj = {
      action: 'Delete',
      title: 'Xác nhận xóa danh sách đã chọn .',
      content: '',
    };

    const dialogRef = this.dialog.open(PopupConfirmDialogComponent, {
      data: obj,
      width: '30%',
      minHeight: '60%',
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result?.event === 'confirm') {
        let itemsProcessed = 0;
        this.selection.selected.forEach((item, index, array) => {
          setTimeout(() => {
            this.service.delete(item.id).subscribe(res => {
              // if (res?.success) {
              //
              // } else {
              //   this.notifySer.notify('warning', res?.message);
              // }
              itemsProcessed++;
              if (itemsProcessed === array.length) {
                this.refreshData();
              }
            });
          }, this.timeOutSelect);
        });
      }
    });
  }

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
    // filter.expand = 'medicine,productUnits,productPlacements,group,images,quantity';
    filter.expand = 'quantity,productUnits';
    filter.product_type = this.productFilter.controls['type'].value;
    filter.status = this.productFilter.controls['status'].value;
    filter.group_id = this.productFilter.controls['group'].value;
    filter.stock = this.productFilter.controls['stock'].value;
    filter.quota_stock = this.productFilter.controls['quota_stock'].value;
    filter.batch_tracking_enabled = this.productFilter.controls['batch_tracking'].value;
    filter.national_check = this.productFilter.controls['national_check'].value;
    return filter;
  }

  buildExportFilterFromParams(): ProductFilter {
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
    filter.product_type = this.productFilter.controls['type'].value;
    filter.status = this.productFilter.controls['status'].value;
    filter.group_id = this.productFilter.controls['group'].value;
    filter.stock = this.productFilter.controls['stock'].value;
    return filter;
  }

  loadGroups(): void {
    const groupFilter = new GroupFilter();
    groupFilter.pageSize = 100;
    this.groupSer.getList(groupFilter).subscribe(res => {
      this.groups = res.body;
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

      let url = '/store/product';
      url += '?' + this.apiFilter.toFilterString();
      this.location.go(url);

      this.isLoadingResults = false;
    });
  }


  /**
   * Tim kiem theo phan loai sản phẩm
   */
  checkBoxFilterChange($event: any, value: any, field: string) {
    this.handleFilterCheckbox(this.productFilter, field, value);
    this.apiFilter = this.buildFilterFromParams();
    this.loadData();
  }
  typeProductFilterChange($event: any, value: any) {
    this.handleFilterCheckbox(this.productFilter, 'type', value);
    this.apiFilter = this.buildFilterFromParams();
    this.loadData();
  }

  /**
   * Tim kiem theo trang thai sản phẩm
   */
  deselectRadioGroup(event: MouseEvent, controlName: string, value: any) {
    if (this.productFilter.controls[controlName].value === value) {
      event.preventDefault();
      this.productFilter.controls[controlName].setValue(null);
      this.statusProductFilterChange();
    }
  }

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
      quota_stock: [[]],
      batch_tracking: [
        [1, 0]
      ],
      national_check: [[]],
    });

    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const code = urlParams.get('quota_stock');
    if (code !== undefined && code !== null && code.length > 0 ) {
      this.productFilter.patchValue({quota_stock: [code]});
    }

    this.loadGroups();

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

    this.selection.changed.subscribe(res => {
      if (this.selection.selected.length > 0) {
        this.toggleMore = true;
      } else {
        this.toggleMore = false;
      }
    });

    if (!this.canDo('Product.View-Original-Price')) {
      let index = this.displayedColumns.indexOf('original_price');
      if (index !== -1) {
        this.displayedColumns.splice(index, 1);
      }
      index = this.columnsToDisplay.indexOf('original_price');
      if (index !== -1) {
        this.columnsToDisplay.splice(index, 1);
      }
    }

  }

  refreshData() {
    this.apiFilter = this.buildFilterFromParams();
    this.loadData();
    this.selection.clear();
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
      if (result?.event === 'Save' && result?.connect === true) {
        this.service.getDetail(result.data.id).subscribe(product => {
          // @ts-ignore
          this.medicineService.connect(product.medicine_id).subscribe(res => {
            if (res['success']) {
              this.notifySer.notify('success', 'Liên thông thành công.');
            } else if (res['message'] !== undefined) {
              this.notifySer.notify('error', res['message']);
            }
            this.loadData();
            this.loadGroups();
          });
        });

      } else {
        if (result?.event !== 'Cancel') {
          this.loadData();
          this.loadGroups();
        }
      }
    });
  }

  /** Quét toàn bộ thuốc xem liên thông được lên CSDL Dược quốc gia chưa */
  openNationalScanDialog() {
    const dialogRef = this.dialog.open(ProductNationalScanDialogComponent, {
      width: '75%',
      minWidth: '750px',
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result?.changed) {
        this.loadData();
      }
    });
  }

  /** Bấm nhãn liên thông ở một dòng: mở hộp thoại so sánh với thuốc quốc gia */
  openNationalFix(element: Product, event: MouseEvent) {
    event.stopPropagation();
    const dialogRef = this.dialog.open(ProductNationalCompareDialogComponent, {
      data: {product_id: element.id},
      width: '90%',
      maxWidth: '1500px',
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result?.changed) {
        this.loadData();
      }
    });
  }

  /** Lý do chưa liên thông được, đã lưu sẵn trên sản phẩm từ lần quét gần nhất */
  nationalReasons(element: Product): string {
    return element['national_check_reason'] || '';
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
      this.loadGroups();
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

  onColumnSelectionChange(selected: string[]) {
    this.displayedColumns = ['select', ...this.columnsToDisplay.filter(c => c !== 'select' && selected.includes(c))];
  }

  exportExcel() {
    // debugger;
    this.apiFilter = this.buildFilterFromParams();
    this.isLoadingResults = true;
    this.service.exportExcel(this.apiFilter).subscribe(
      (response: any) => {
        // 1. Lấy nội dung file (Binary) từ body
        const blob = new Blob([response.body], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        });

        const a = document.createElement('a');
        const objectUrl = URL.createObjectURL(blob);

        a.href = objectUrl;
        a.download = 'Danh-muc-san-pham.xlsx';
        a.click();

        URL.revokeObjectURL(objectUrl);

        this.notifySer.notify('success', 'Xuất file thành công!');
        this.isLoadingResults = false;
      },
      (error) => {
        console.error('Lỗi tải file:', error);
        this.isLoadingResults = false;
        this.notifySer.notify('error', 'Xuất file không thành công!');
      }
    );
  }

  canDo(permissionName: string): boolean {
    const allPermissions = this.authSer.getPermissionsFromLocalStorage();

    return allPermissions.indexOf(permissionName) !== -1;
  }
}
