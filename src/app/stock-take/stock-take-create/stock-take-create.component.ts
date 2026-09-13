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
import { StockTakeUploadDialogComponent } from '../stock-take-upload-dialog/stock-take-upload-dialog.component';
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
          // tồn đã lưu là theo đơn vị đã chọn -> quy về tồn lô gốc (viên)
          const u = (item.productUnits || []).find(x => x.id === item.product_unit_id);
          const uv = Number(u && u.value) || 1;
          stockTakeItem.lot_base_qty = (Number(item.quantity_of_stock) || 0) * uv;
          // dựng lại option lô (tồn theo viên) để dropdown + quy đổi đơn vị hoạt động
          stockTakeItem.lots = [{
            parcel_no: item.parcel_no,
            expiration_date: item.expiration_date,
            quantity_of_stock: stockTakeItem.lot_base_qty
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
    // Tải đủ mọi dòng: khi lưu, dòng không có trong danh sách gửi lên sẽ bị xoá.
    filter.pageSize = 5000;
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
   * Thêm SP quản lý theo lô: mỗi lô còn tồn một dòng (bỏ qua lô đã có trong lưới), để kiểm đủ
   * cả kho chứ không chỉ lô hạn gần nhất. Mỗi dòng vẫn có dropdown lô + chọn đơn vị.
   * Tồn lô gốc lưu theo đơn vị cơ bản (lot_base_qty); hiển thị/nhập quy đổi theo đơn vị chọn.
   * Thêm lô mới phải qua Nhập hàng, kiểm kho chỉ điều chỉnh lô đã có.
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

      // FEFO: hạn sớm trước
      lots = [...lots].sort((a, b) =>
        new Date(a['expiration_date']).getTime() - new Date(b['expiration_date']).getTime());

      // units đã sort tăng dần theo value ⇒ phần tử đầu là đơn vị cơ bản (value = 1)
      const baseUnit = units[0];
      const baseVal = Number(baseUnit['value']) || 1;
      const newItems = [];
      lots.forEach(lot => {
        if (this.findRowIndex(res['id'], lot['parcel_no'], lot['expiration_date']) !== -1) {
          return;
        }
        const item = new StockTakeItem();
        item.product_id = res['id'];
        item.product = res;
        // mỗi dòng một bản sao đơn vị để đổi đơn vị dòng này không ảnh hưởng dòng khác
        item.productUnits = units.map(u => ({...u}));
        item.product_unit_id = baseUnit['id'];
        item.lots = lots;
        item.parcel_no = lot['parcel_no'];
        item.expiration_date = lot['expiration_date'];
        item.lot_base_qty = Number(lot['quantity_of_stock']) || 0; // tồn lô theo đơn vị cơ bản (viên)
        item.view_quantity_of_stock = item.lot_base_qty / baseVal;  // quy đổi theo đơn vị mặc định
        item.actual_number = item.view_quantity_of_stock;           // mặc định = tồn lô (lệch 0)
        item.price = Number(baseUnit['original_price']) || 0;
        item.deviation_number = 0;
        item.deviation_price = 0;
        newItems.push(item);
      });

      if (newItems.length === 0) {
        this.notifySer.notify('info', 'Các lô còn tồn của "' + res['product_name'] + '" đã có trong phiếu.');
        this.selectProduct.patchValue(null);
        return;
      }

      this.data = this.data.concat(newItems);
      this.productDataSource = new MatTableDataSource<StockTakeItem>(this.data);
      this.recalculateStockTake();
      this.selectProduct.patchValue(null);
    });
  }

  /** Vị trí dòng cùng hàng + lô trong lưới, -1 nếu chưa có. Hàng không lô: parcel_no rỗng. */
  findRowIndex(productId, parcelNo, expirationDate = null): number {
    const lot = parcelNo || '';
    return this.data.findIndex(row =>
      String(row.product_id) === String(productId)
      && String(row.parcel_no || '').toLowerCase() === String(lot).toLowerCase()
      && (!lot || !expirationDate || !row.expiration_date || row.expiration_date === expirationDate));
  }

  /**
   * Hộp thoại Import Excel. Dòng trùng hàng + lô đã có trong lưới thì cập nhật theo file
   * (số chốt, thực tế, về đơn vị cơ bản), không nhân đôi; dòng mới thêm vào cuối.
   */
  openUploadDialog() {
    const dialogRef = this.dialog.open(StockTakeUploadDialogComponent, {
      data: {},
      width: '75%',
      minWidth: '900px',
      maxHeight: '90vh',
    });

    dialogRef.afterClosed().subscribe(result => {
      if (!result || !result.items || !result.items.length) {
        return;
      }
      let added = 0;
      let updated = 0;
      result.items.forEach(row => {
        const index = this.findRowIndex(row.product_id, row.parcel_no, row.expiration_date);
        if (index === -1) {
          this.data.push(Object.assign(new StockTakeItem(), row));
          added++;
        } else {
          const id = this.data[index].id;
          this.data[index] = Object.assign(new StockTakeItem(), row, {id: id});
          updated++;
        }
      });
      this.data = this.data.slice();
      this.productDataSource = new MatTableDataSource<StockTakeItem>(this.data);
      this.recalculateStockTake();
      this.notifySer.notify('success', 'Đã nạp ' + added + ' dòng mới'
        + (updated ? ', cập nhật ' + updated + ' dòng đã có' : '') + ' vào phiếu.');
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
    item['lot_base_qty'] = Number(lot['quantity_of_stock']) || 0;
    // quy đổi tồn lô theo đơn vị đang chọn
    const unit = item['productUnits'].find(u => u['id'] === item['product_unit_id']) || item['productUnits'][0];
    const v = Number(unit && unit['value']) || 1;
    item['view_quantity_of_stock'] = item['lot_base_qty'] / v;
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
    if (this.data[index] === undefined) {
      return;
    }
    const item = this.data[index];
    const unit = item['productUnits'].find(element => element['id'] === select.value);
    if (!unit) {
      return;
    }

    if (item['parcel_no']) {
      // Dòng theo lô: tồn = tồn lô gốc (viên) / value đơn vị đang chọn
      const v = Number(unit['value']) || 1;
      const baseUnit = item['productUnits'][0]; // batch: units đã sort tăng dần ⇒ [0] = cơ bản
      item['view_quantity_of_stock'] = (Number(item['lot_base_qty']) || 0) / v;
      item['actual_number'] = item['view_quantity_of_stock']; // reset về tồn lô (lệch 0)
      item['price'] = (Number(baseUnit && baseUnit['original_price']) || 0) * v;
      item['deviation_number'] = item['actual_number'] - item['view_quantity_of_stock'];
      item['deviation_price'] = item['deviation_number'] * item['price'];
      this.recalculateStockTake();
      return;
    }

    // SP thường: giữ nguyên logic cũ
    const unitBase = item['productUnits'].find(element => element['is_base'] === 1);
    item['view_quantity_of_stock'] = unit['quantity_of_stock'];
    item['deviation_number'] = item['actual_number'] - item['view_quantity_of_stock'];
    item['price'] = unitBase['original_price'] * unit['value'];
    item['deviation_price'] = item['deviation_number'] * item['price'];
    this.recalculateStockTake();
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

    // Cân bằng đặt THẲNG tồn = thực tế. Hàng bán/nhập từ lúc thêm dòng (hoặc tải file) tới giờ
    // sẽ bị ghi đè, nên hỏi trước những dòng có tồn đã đổi.
    this.stockTakeService.checkStockChange(this.itemsPayload()).subscribe(res => {
      const changes = (res && res.changes || []).map(change => {
        const row = this.data[change.index];
        const unit = row && (row.productUnits || []).find(u => u['id'] === row.product_unit_id);
        return {
          ...change,
          product_no: row && row.product ? row.product['product_no'] : '',
          product_name: row && row.product ? row.product['product_name'] : '',
          unit_name: unit ? unit['name'] : '',
          actual_number: row ? row.actual_number : 0,
        };
      });
      this.openBalanceDialog(changes);
    });
  }

  openBalanceDialog(changes: any[]) {
    const obj = {
      action: 'Delete',
      title: 'Cân bằng kho',
      content: 'Cân bằng kho sẽ thay đổi tồn kho hiện tại của hàng hóa trong phiếu kiểm kho.<br> Bạn có chắc chắn muốn Cân bằng kho?',
      changes: changes,
    };

    const dialogRef = this.dialog.open(StockTakeBalanceDialogComponent, {
      data: obj,
      width: changes.length ? '75%' : '40%',
      minWidth: changes.length ? '900px' : undefined,
      maxHeight: '90vh',
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result && result.event === 'accept') {
        this.applyStockChanges(changes, result.mode);
        this.saveStockTake('done');
      }
    });
  }

  /**
   * Cập nhật số chốt về tồn hiện tại cho các dòng đã đổi, để số lệch/thẻ kho đúng.
   * mode 'subtract': số thực tế cộng thêm phần phát sinh (đếm 100, trong lúc đó bán 5 → còn 95).
   * mode 'keep': giữ nguyên số đã đếm (người dùng đếm lại sau khi bán rồi).
   */
  applyStockChanges(changes: any[], mode: string) {
    changes.forEach(change => {
      const row = this.data[change.index];
      if (!row) {
        return;
      }
      const unit = (row.productUnits || []).find(u => u['id'] === row.product_unit_id);
      const value = Number(unit && unit['value']) || 1;
      if (mode === 'subtract') {
        row.actual_number = Math.max(0, Number(row.actual_number) + (change.current - change.snapshot));
      }
      row.view_quantity_of_stock = change.current;
      if (row.parcel_no) {
        row.lot_base_qty = change.current * value;
      }
      this.recalculateItem(change.index);
    });
  }

  /** Chỉ gửi các trường server cần — product/productUnits/lots mỗi dòng rất nặng với phiếu vài nghìn dòng. */
  itemsPayload() {
    return this.data.map(row => ({
      id: row.id,
      product_id: row.product_id,
      product_unit_id: row.product_unit_id,
      parcel_no: row.parcel_no,
      expiration_date: row.expiration_date,
      price: row.price,
      view_quantity_of_stock: row.view_quantity_of_stock,
      actual_number: row.actual_number,
      deviation_number: row.deviation_number,
      deviation_price: row.deviation_price,
    }));
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
      data['items'] = this.itemsPayload();

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
