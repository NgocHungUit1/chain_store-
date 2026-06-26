import { Component, OnInit, ViewChild } from '@angular/core';
import { WarehouseService } from '../../warehouse/warehouse.service';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ProductService } from '../../product/product.service';
import { NotifierService } from 'angular-notifier';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { Observable } from 'rxjs';
import { Product } from '../../product/product.model';
import { catchError, debounceTime, map, startWith, switchMap } from 'rxjs/operators';
import { of } from 'rxjs/internal/observable/of';
import { ListComponentBase } from '../../shared/base';
import { StockTakeService } from '../stock-take.service';
import { StockTake, StockTakeItem, StockTakeItemFilter } from '../stock-take.model';
import { StockTakeItemService } from '../stock-take-item.service';
import { StockTakeBalanceDialogComponent } from '../stock-take-balance-dialog/stock-take-balance-dialog.component';
import { element } from 'protractor';
import { SearchProductDialogComponent } from '../../common/search-product-dialog/search-product-dialog.component';
import {
  ProductMerchandiseFormDialogComponent
} from '../../product/product-merchandise-form-dialog/product-merchandise-form-dialog.component';
import { ProductMedicineDialogComponent } from '../../product/product-medicine-dialog/product-medicine-dialog.component';

@Component({
  selector: 'app-stock-take-create',
  templateUrl: './stock-take-create.component.html',
  styleUrls: ['./stock-take-create.component.css']
})
export class StockTakeCreateComponent extends ListComponentBase implements OnInit {

  constructor(
    private mainService: WarehouseService,
    private stockTakeService: StockTakeService,
    private stockTakeItemService: StockTakeItemService,
    private dialog: MatDialog,
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private productSer: ProductService,
    private notifySer: NotifierService
  ) {
    super();
  }

  @ViewChild(MatTable, {static: true}) table: MatTable<any>;
  @ViewChild('selectColumn') selectColumn;

  selectProduct = new FormControl();

  apiFilter: StockTakeItemFilter;
  updateModelId = null;
  model: StockTake = null;

  statuses = [
    {
      id: 'draft',
      name: 'Lưu nháp'
    },
    {
      id: 'done',
      name: 'Hoàn thành'
    },
    {
      id: 'cancel',
      name: 'Hủy bỏ'
    },
  ];

  columnsHeader = {
    '#': '#',
    'product_no': 'Mã hàng',
    'product_name': 'Tên hàng',
    'product_unit_id': 'Đơn vị',
    'quantity_of_stock': 'Tồn kho',
    'actual_number': 'Thực tế',
    'deviation_number': 'Số lệch',
    'deviation_price': 'Giá trị lệch',
    'action': 'Hành động',
  };

  displayedColumns: string[] = [
    'actions',
    '#',
    'product_name',
    'product_unit_id',
    'quantity_of_stock',
    'actual_number',
    'deviation_number',
    'deviation_price',
  ];
  columnsToDisplay: string[] = [
    'actions',
    '#',
    'product_name',
    'product_unit_id',
    'quantity_of_stock',
    'actual_number',
    'deviation_number',
    'deviation_price',
  ];
  data: StockTakeItem[] = [];
  productDataSource = new MatTableDataSource<StockTakeItem>([]);

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  isLoadingResults = false;
  isRateLimitReached = false;

  form: FormGroup;

  filteredProducts: Observable<Product[]>;

  ngOnInit() {
    const date = new FormControl(new Date());
    this.form = this.fb.group({
      date: date,
      no: [null],
      balance_status: ['draft'],
      note: [null],
      total_price: [0],
      actual_number: [0],
    });

    this.displayedColumns = this.columnsToDisplay;


    this.filteredProducts = this.selectProduct.valueChanges.pipe(
      startWith(''),
      // delay emits
      debounceTime(300),
      // use switch map so as to cancel previous subscribed events, before creating new once
      switchMap(value => {
        if (value !== '') {
          // lookup from github
          return this.lookupProduct(value);
        } else {
          // if no value is present, return null
          return of(null);
        }
      })
    );

    const id = this.route.snapshot.paramMap.get('id');
    if (id !== null && id !== undefined) {
      this.updateModelId = id;
      this.stockTakeService.getDetail(this.updateModelId, '').subscribe(res => {
        let dateStr = null;
        if (res['date'] !== null) {
          dateStr = new Date(res['date']).toISOString();
        }
        this.model = res;

        this.form.patchValue({
          date: dateStr,
          no: res['no'],
          balance_status: res['balance_status'],
          total_price: res['total_price'],
          actual_number: res['actual_number'],
          note: res['note'],
        });


        this.form.controls['date'].disable();
        // this.form.controls['no'].disable();
        this.loadData();
      });
    } else {
      this.stockTakeService.getRenderStockTakeNo().subscribe(res => {
        this.form.patchValue({
          no: 'KK0' + res,
          balance_status: 'draft',
        });
      });
      this.form.controls['date'].disable();
      // this.form.controls['no'].disable();
    }

    const product_id = localStorage.getItem('product_id');
    if (product_id !== null) {
      this.handleAddProductToList(product_id);
      localStorage.removeItem('product_id');
    }

  }

  lookupProduct(value: string): Observable<Product[]> {
    return this.productSer.autocomplete(value).pipe(
      // map the item property of the github results as our return object
      map(results => results),
      // catch errors
      catchError(_ => {
        return of(null);
      })
    );
  }

  loadData(): void {
    this.isLoadingResults = true;
    this.apiFilter = this.buildFilterFromParams();
    this.stockTakeItemService.getList(this.apiFilter).subscribe(res => {
      const newData = [];
      res.body.forEach(item => {
        const stockTakeItem = new StockTakeItem();
        if (this.updateModelId !== null) {
          stockTakeItem.id = item.id;
        }
        stockTakeItem.stock_take_id = item.stockTake;
        stockTakeItem.product_id = item.product_id;
        stockTakeItem.product = item.product;
        stockTakeItem.product_unit_id = item.product_unit_id;
        stockTakeItem.parcel_no = item.parcel_no;
        stockTakeItem.expiration_date = item.expiration_date;
        if (item.parcel_no) {
          // dựng lại option lô đã lưu để dropdown hiển thị
          stockTakeItem.lots = [{
            parcel_no: item.parcel_no,
            expiration_date: item.expiration_date,
            quantity_of_stock: item.quantity_of_stock
          }];
        }
        stockTakeItem.quantity_of_stock = item.quantity_of_stock;
        stockTakeItem.actual_number = item.actual_number;
        stockTakeItem.deviation_number = item.deviation_number;
        stockTakeItem.deviation_price = item.deviation_price;
        stockTakeItem.price = item.price;
        stockTakeItem.view_quantity_of_stock = item.quantity_of_stock;

        const units = item.productUnits;
        // tslint:disable-next-line:no-shadowed-variable
        units.forEach(element => {
          element.quantity_of_stock = Math.floor(item.quantity_of_stock / element.value);
        });
        stockTakeItem.productUnits = units;
        newData.push(stockTakeItem);
      });
      this.data = newData;
      this.productDataSource = new MatTableDataSource<StockTakeItem>(this.data);
      this.recalculateStockTake();
      this.isLoadingResults = false;
    });
  }

  buildFilterFromParams(): StockTakeItemFilter {
    function write<K extends keyof StockTakeItemFilter>(arg: StockTakeItemFilter, key: K, value: StockTakeItemFilter[K]): void {
      arg[key] = value;
    }

    const filter = new StockTakeItemFilter();
    const objectKeys = Object.keys(filter) as Array<keyof StockTakeItemFilter>;

    for (const attr of objectKeys) {
      write(filter, attr, this.route.snapshot.queryParams['StockTakeItemSearch[' + attr + ']']);
    }
    filter.page = this.route.snapshot.queryParams['page'];
    filter.pageSize = 50;
    filter.sort = this.route.snapshot.queryParams['sort'];
    filter.expand = 'product,productUnits';
    if (this.updateModelId !== null) {
      filter.stock_take_id = this.updateModelId;
    }
    return filter;
  }


  /**
   * Event choice search
   * @param product
   */
  onSelectedProduct(product) {
    this.handleAddProductToList(product.id);
  }

  /**
   * Handle add product to list
   * @param product_id
   */
  handleAddProductToList(product_id) {
    this.productSer.getDetail(product_id, 'productUnits,quantity').subscribe(res => {
      // console.log(res);
      if (res['quantity'] === null) {
        res['quantity_of_stock'] = 0;
      } else {
        res['quantity_of_stock'] = res['quantity'] ? res['quantity']['number'] : 0;
      }

      const units = res['productUnits'] || [];
      // tslint:disable-next-line:no-shadowed-variable
      units.forEach(element => {
        element.quantity_of_stock = Math.floor(res['quantity_of_stock'] / element.value);
      });
      units.sort((a, b) => (a.value > b.value) ? 1 : -1);

      // SP quản lý theo lô: đổ danh sách lô để kiểm theo từng lô (như luồng bán hàng)
      if (res['batch_tracking_enabled']) {
        this.addBatchProductLots(res, units);
        return;
      }

      // SP không theo lô: giữ nguyên hành vi cũ (1 dòng/SP)
      const stockTakeItem = new StockTakeItem();
      stockTakeItem.product_id = res['id'];
      stockTakeItem.product = res;
      stockTakeItem.actual_number = res['quantity_of_stock'] > 0 ? 1 : 0;
      stockTakeItem.productUnits = units;

      if (units.length > 0) {
        stockTakeItem.product_unit_id = units[0]['id'];
        stockTakeItem.view_quantity_of_stock = units[0]['quantity_of_stock'];
        stockTakeItem.deviation_number = stockTakeItem.actual_number - stockTakeItem.view_quantity_of_stock;
        stockTakeItem.price = units[0]['original_price'];
        stockTakeItem.deviation_price = stockTakeItem.deviation_number * stockTakeItem.price;
      }

      const newData = this.data.concat([stockTakeItem]);
      this.data = newData;
      this.productDataSource = new MatTableDataSource<StockTakeItem>(this.data);
      this.recalculateStockTake();
      this.selectProduct.patchValue(null);
    });
  }

  /**
   * Thêm SP quản lý theo lô: 1 dòng/SP, có dropdown chọn lô (như màn bán hàng).
   * Ép đơn vị cơ bản. Thêm lô mới phải qua Nhập hàng, kiểm kho chỉ điều chỉnh lô đã có.
   */
  addBatchProductLots(res, units) {
    this.productSer.getParcelNew(res['id']).subscribe((parcels: any) => {
      let lots = Array.isArray(parcels) ? parcels : [];
      if (lots.length === 0) {
        this.notifySer.notify('warning',
          'Thuốc "' + res['product_name'] + '" quản lý theo lô nhưng chưa có lô tồn. Vui lòng nhập hàng để thêm lô.');
        this.selectProduct.patchValue(null);
        return;
      }

      // FEFO: hạn sớm trước, lấy lô đầu làm mặc định
      lots = [...lots].sort((a, b) =>
        new Date(a['expiration_date']).getTime() - new Date(b['expiration_date']).getTime());

      // units đã sort tăng dần theo value ⇒ phần tử đầu là đơn vị cơ bản (value = 1)
      const baseUnit = units[0];
      const first = lots[0];
      const item = new StockTakeItem();
      item.product_id = res['id'];
      item.product = res;
      item.productUnits = units;
      item.product_unit_id = baseUnit['id'];
      item.lots = lots;
      item.parcel_no = first['parcel_no'];
      item.expiration_date = first['expiration_date'];
      item.view_quantity_of_stock = Number(first['quantity_of_stock']) || 0;
      item.actual_number = item.view_quantity_of_stock; // mặc định = tồn lô (lệch 0)
      item.price = baseUnit['original_price'];
      item.deviation_number = 0;
      item.deviation_price = 0;

      this.data = this.data.concat([item]);
      this.productDataSource = new MatTableDataSource<StockTakeItem>(this.data);
      this.recalculateStockTake();
      this.selectProduct.patchValue(null);
    });
  }

  /**
   * Đổi lô ở dropdown: cập nhật tồn lô + reset thực tế theo lô được chọn.
   */
  onLotChange(index, parcelNo) {
    const item = this.data[index];
    if (!item || !item['lots']) {
      return;
    }
    const lot = item['lots'].find(l => l['parcel_no'] === parcelNo);
    if (!lot) {
      return;
    }
    item['parcel_no'] = lot['parcel_no'];
    item['expiration_date'] = lot['expiration_date'];
    item['view_quantity_of_stock'] = Number(lot['quantity_of_stock']) || 0;
    item['actual_number'] = item['view_quantity_of_stock'];
    this.recalculateItem(index);
  }

  recalculateItem(index) {
    this.data[index]['deviation_number'] = this.data[index]['actual_number'] - this.data[index]['view_quantity_of_stock'];
    this.data[index]['deviation_price'] = this.data[index]['deviation_number'] * this.data[index]['price'];
    this.recalculateStockTake();
  }

  recalculateStockTake() {

    let total_price = 0;
    let actual_number = 0;
    this.data.forEach(item => {
      total_price += Number(item['deviation_price']);
      actual_number += Number(item['actual_number']);
    });

    this.form.patchValue({
      total_price: total_price,
      actual_number: actual_number,
    });
  }

  removeProduct(i) {
    const newData = this.data;
    newData.splice(i, 1);
    this.data = newData;
    this.recalculateStockTake();
    this.productDataSource = new MatTableDataSource<StockTakeItem>(this.data);
  }

  /**
   * @param index
   * @param select
   */
  onUnitChange(index, select) {
    if (this.data[index] !== undefined) {
      const unit = this.data[index]['productUnits'].find(element => element['id'] === select.value);
      const unitBase = this.data[index]['productUnits'].find(element => element['is_base'] === 1);
      this.data[index]['view_quantity_of_stock'] = unit['quantity_of_stock'];
      this.data[index]['deviation_number'] = this.data[index]['actual_number'] - this.data[index]['view_quantity_of_stock'];
      this.data[index]['price'] = unitBase['original_price'] * unit['value'];
      this.data[index]['deviation_price'] = this.data[index]['deviation_number'] * this.data[index]['price'];
      this.recalculateStockTake();
    }
  }

  changeQuantity(index, value) {
    this.data[index]['actual_number'] = Number(this.data[index]['actual_number']) + Number(value);
    this.data[index]['deviation_number'] = this.data[index]['actual_number'] - this.data[index]['view_quantity_of_stock'];
    this.data[index]['deviation_price'] = this.data[index]['price'] * this.data[index]['deviation_number'];
    this.recalculateStockTake();
  }

  openDialogBalanceSave(balance_status: string = 'draft') {
    if (this.data.length <= 0) {
      this.notifySer.notify('warning', 'Chưa có sản phẩm trong phiếu !');
      return;
    }

    if (balance_status === 'draft') {
      this.saveStockTake();
      return;
    }

    const obj = {
      action: 'Delete',
      title: 'Cân bằng kho',
      content: 'Cân bằng kho sẽ thay đổi tồn kho hiện tại của hàng hóa trong phiếu kiểm kho.<br> Bạn có chắc chắn muốn Cân bằng kho?',
    };

    const dialogRef = this.dialog.open(StockTakeBalanceDialogComponent, {
      data: obj,
      width: '40%',
      minHeight: '80%',
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result.event === 'accept') {
        this.saveStockTake(balance_status);
      }
    });
  }

  saveStockTake(balance_status: string = 'draft') {
    const hasInvalidActual = this.data.some(item => {
      const val = item['actual_number'];
      return val === null || val === undefined || isNaN(Number(val));
    });
    if (hasInvalidActual) {
      this.notifySer.notify('error', 'Số thực tế phải là số hợp lệ!');
      return;
    }

    const hasNegativeActual = this.data.some(item => Number(item['actual_number']) < 0);
    if (hasNegativeActual) {
      this.notifySer.notify('error', 'Số thực tế không được nhỏ hơn 0!');
      return;
    }

    if (this.form.valid) {
      const data = this.form.getRawValue();
      if (balance_status === 'done') {
        data['balance_status'] = 'done';
      }
      if (this.form.controls['date'].value !== null && typeof this.form.controls['date'].value === 'object') {
        const effDate = new Date(this.form.controls['date'].value.getTime() + (420 * 60 * 1000));
        data['date'] = effDate.toISOString().split('T')[0];
      }
      data['items'] = this.data;

      if (this.updateModelId !== null) {
        delete data['date'];
        this.stockTakeService.update(this.updateModelId, data).subscribe(res => {
          this.model = res;
          this.notifySer.notify('success', 'Lưu thành công.');
          if (balance_status === 'done') {
            this.router.navigate(['/store/stock-take']);
          } else {
            this.router.navigate(['/store/stock-take/update/' + res.id]);
          }
        });
      } else {
        this.stockTakeService.create(data).subscribe(res => {
          this.model = res;
          this.notifySer.notify('success', 'Lưu thành công.');
          if (balance_status === 'done') {
            this.router.navigate(['/store/stock-take']);
          } else {
            this.router.navigate(['/store/stock-take/update/' + res.id]);
          }
        });
      }


      //
    }
  }

  /**
   * In don kiem kho
   * @param model
   */
  buttonPrintWarehouse(model) {
    console.log('print');
  }
  openSearchProductDialog() {
    const dialogRef = this.dialog.open(SearchProductDialogComponent, {
      width: '80%',
      minWidth: '750px',
      minHeight: '85%',
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result['event'] === 'Choose') {
        if (result['product_id']) {
          this.handleAddProductToList(result['product_id']);
        }
        if (result['product_ids']) {
          result['product_ids'].forEach(id => {
            this.handleAddProductToList(id);
          });
        }
      }
    });
  }

  openProductMerchandiseFormDialog(action, obj) {
    obj.action = action;
    obj.title = 'Thêm hàng hóa';
    obj.product_id = null;
    obj.copy_product_id = null;
    obj.product_name = this.selectProduct.value;
    const dialogRef = this.dialog.open(ProductMerchandiseFormDialogComponent, {
      data: obj,
      width: '60%',
      minWidth: '750px',
      minHeight: '80%',
    });

    dialogRef.afterClosed().subscribe(result => {
      // this.loadData();
      // console.log(result);
      if (result['event'] === 'Save') {
        this.handleAddProductToList(result['data']['id']);
      }
    });
  }

  openProductMedicineDialog(action, obj) {
    obj.action = action;
    obj.title = 'Thêm thuốc';
    obj.product_id = null;
    obj.copy_product_id = null;
    obj.product_name = this.selectProduct.value;
    const dialogRef = this.dialog.open(ProductMedicineDialogComponent, {
      data: obj,
      width: '60%',
      minWidth: '750px',
      minHeight: '80%',
    });

    dialogRef.afterClosed().subscribe(result => {
      // console.log(result);
      if (result['event'] === 'Save') {
        this.handleAddProductToList(result['data']['id']);
      }
    });
  }


  toggleColumn(column) {
    setTimeout(() => {
      if (this.displayedColumns.includes(column)) {
        this.displayedColumns = this.displayedColumns.filter(col => col !== column);
      } else {
        this.displayedColumns = this.columnsToDisplay.filter(col =>
          col === column || this.displayedColumns.includes(col)
        );
      }
    });
  }

  isIncludes(column) {
    return this.displayedColumns.some(item => item === column);
  }
}
