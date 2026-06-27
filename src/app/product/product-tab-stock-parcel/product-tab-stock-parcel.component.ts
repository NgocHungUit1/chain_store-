import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { ProductService } from '../product.service';
import {WarehouseProductParcelService} from '../../warehouse-product-parcel/warehouse-product-parcel.service';
import {MatTableDataSource} from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import {
  WarehouseProductParcel,
  WarehouseProductParcelFilter
} from '../../warehouse-product-parcel/warehouse-product-parcel.model';
import {ListComponentBase} from '../../shared/base';
import {ActivatedRoute} from '@angular/router';
import {AuthService} from '../../authentication/auth.service';
import {NotifierService} from 'angular-notifier';
import {GroupFormDialogComponent} from '../../group/group-form-dialog/group-form-dialog.component';
import {
  WarehouseProductParcelChangeStockFormDialogComponent
} from '../../warehouse-product-parcel/warehouse-product-parcel-change-stock-form-dialog/warehouse-product-parcel-change-stock-form-dialog.component';

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
  displayedColumns: string[] = ['#', 'parcel_no', 'expiration_date', 'quantity_of_stock', 'unit_cost', 'actions'];

  columnsHeader = {
    '#': '#',
    'parcel_no': 'Số lô',
    'quantity_of_stock': 'Tồn kho',
    'expiration_date': 'Hạn sử dụng',
    'unit_cost': 'Đơn giá nhập',
  };

  data: WarehouseProductParcel[] = [];
  parcelDataSource = new MatTableDataSource<WarehouseProductParcel>([]);

  constructor(
    private productService: ProductService,
    private warehouseParcelService: WarehouseProductParcelService,
    private route: ActivatedRoute,
    private authSer: AuthService,
    private dialog: MatDialog,
    private notifySer: NotifierService,
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

  canDo(permissionName: string): boolean {
    const allPermissions = this.authSer.getPermissionsFromLocalStorage();

    return allPermissions.indexOf(permissionName) !== -1;
  }

  openChangeWarehouseProductStockFormDialog(id) {
    const dialogRef = this.dialog.open(WarehouseProductParcelChangeStockFormDialogComponent, {
      data: {productParcelId: id},
      width: '600px',
      minHeight: '60%',
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadData();
      }
    });
  }

  // ----- Sửa hạn dùng của lô (inline) -----
  startEditExp(element) {
    element._newExp = element.expiration_date ? new Date(element.expiration_date) : null;
    element._editingExp = true;
  }

  cancelEditExp(element) {
    element._editingExp = false;
  }

  saveExp(element) {
    if (!element._newExp) {
      this.notifySer.notify('warning', 'Vui lòng chọn hạn sử dụng.');
      return;
    }
    const d = new Date(element._newExp);
    const dateStr = d.getFullYear() + '-'
      + ('0' + (d.getMonth() + 1)).slice(-2) + '-'
      + ('0' + d.getDate()).slice(-2);

    this.warehouseParcelService.updateExpiration(element.id, dateStr).subscribe(res => {
      if (res && res.success) {
        this.notifySer.notify('success', 'Cập nhật hạn dùng thành công!');
        element._editingExp = false;
        this.loadData();
      } else {
        this.notifySer.notify('error', (res && res.message) ? res.message : 'Cập nhật thất bại');
      }
    }, () => {
      this.notifySer.notify('error', 'Có lỗi xảy ra, vui lòng thử lại.');
    });
  }

}
