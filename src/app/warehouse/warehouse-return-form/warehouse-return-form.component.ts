import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { NotifierService } from 'angular-notifier';
import { MatDialog } from '@angular/material/dialog';
import { ListComponentBase } from '../../shared/base';
import { WarehouseProductService } from '../warehouse-product.service';
import { Warehouse, WarehouseProduct, WarehouseProductFilter } from '../warehouse.model';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs/index';
import { Supplier } from '../../supplier/supplier.model';
import { catchError, debounceTime, map, startWith, switchMap } from 'rxjs/operators';
import { of } from 'rxjs/internal/observable/of';
import { SupplierService } from '../../supplier/supplier.service';
import { WarehouseService } from '../warehouse.service';
import { IResponse } from '../../common/response.model';
import { Product } from '../../product/product.model';
import { ProductService } from '../../product/product.service';
import { SupplierFormDialogComponent } from '../../supplier/supplier-form-dialog/supplier-form-dialog.component';
import { UserService } from '../../user/user.service';
import { MatDateProviders } from '../../shared/providers/mat-date.provider';

@Component({
  selector: 'app-warehouse-return-form',
  templateUrl: './warehouse-return-form.component.html',
  styleUrls: ['./warehouse-return-form.component.css'],
  providers: [...MatDateProviders]
})
export class WarehouseReturnFormComponent extends ListComponentBase implements OnInit {

  constructor(
    private mainService: WarehouseService,
    private warehouseProductService: WarehouseProductService,
    private userService: UserService,
    private dialog: MatDialog,
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private supplierSer: SupplierService,
    private productSer: ProductService,
    private notifySer: NotifierService
  ) {
    super();
  }

  @ViewChild(MatTable, {static: true}) table: MatTable<any>;
  // @ViewChild('selectColumn') selectColumn;

  selectProduct = new FormControl();

  apiFilter: WarehouseProductFilter;
  updateModelId = null;
  model = null;
  /**
   * Lô CÒN TỒN của từng sản phẩm, theo đơn vị cơ bản: product_id -> danh sách lô.
   * Trước đây dùng MỘT danh sách chung cho cả phiếu, chỉ có dữ liệu khi mở lại phiếu cũ
   * hoặc khi tự bấm "+" tạo lô, nên phiếu mới không gợi ý lô tồn và sản phẩm này hiện
   * cả lô của sản phẩm khác. Trả hàng nhập thì lô phải đang có trong kho.
   */
  availableParcels: { [productId: string]: object[] } = {};

  /**
   * Phiếu ĐÃ HOÀN THÀNH đang mở để sửa: tồn lô lấy về đã bị trừ bởi chính phiếu này,
   * nên phải cộng lại phần phiếu đã trả, không thì khách không sửa về được số cũ.
   * Khoá: product_id|số lô|hạn dùng -> số lượng theo đơn vị cơ bản.
   */
  ownReturned: { [key: string]: { productId: string, parcel_no: string, expiration_date: string, quantity: number } } = {};
  branchList: any;
  allPermission: any;
  isAdminStore: boolean;
  statuses = [
    {id: '10', name: 'Hoàn thành'},
    {id: '9', name: 'Lưu tạm'},
  ];

  columnsHeader = {
    '#': '#',
    // 'product_no': 'Mã hàng',
    'product_name': 'Tên hàng',
    // 'product_parcel': 'Lô',
    'product_unit_id': 'Đơn vị',
    'quantity': 'Số lượng',
    'price': 'Đơn giá',
    'discount': 'Giảm giá',
    'amount': 'Thành tiền',
  };

  displayedColumns: string[] = [];
  columnsToDisplay: string[] = [
    '#',
    // 'product_no',
    'product_name',
    // 'product_parcel',
    'product_unit_id',
    'quantity',
    'price',
    'discount',
    'amount',
    'actions'
  ];
  data: WarehouseProduct[] = [];
  productDataSource = new MatTableDataSource<WarehouseProduct>([]);
  invalidQuantityItems = new Set<object>();
  quantityErrors = new Map<object, string>();
  invalidPriceItems = new Set<object>();
  priceErrors = new Map<object, string>();

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  isLoadingResults = false;
  isRateLimitReached = false;

  form: FormGroup;
  /** Dùng chung cho Trả hàng nhập và Xuất huỷ (route data mode = 'destroy') */
  isDestroy = false;
  basePath = '/transaction/warehouse-return';
  destroyReasonOptions = [
    {id: 'expired', name: 'Hết hạn dùng'},
    {id: 'damaged', name: 'Hư hỏng, vỡ, biến chất'},
    {id: 'recall', name: 'Thu hồi theo quyết định'},
    {id: 'other', name: 'Lý do khác'},
  ];

  filteredSuppliers: Observable<Supplier[]>;
  filteredProducts: Observable<Product[]>;

  ngOnInit() {
    this.isDestroy = this.route.snapshot.data?.mode === 'destroy';
    this.basePath = this.isDestroy ? '/transaction/warehouse-destroy' : '/transaction/warehouse-return';
    const date = new FormControl(new Date());
    this.form = this.fb.group({
      date: date,
      no: [null],
      // Phiếu huỷ không có nhà cung cấp, bắt buộc lý do huỷ
      supplier: [null, this.isDestroy ? [] : Validators.required],
      destroy_reason: [null, this.isDestroy ? Validators.required : []],
      status: [null],
      type: [this.isDestroy ? 'destroy' : 'return'],
      quantity: [null],
      total_price: [null],
      total_amount: [null],
      discount_amount: [null],
      paid_amount: [null],
      remain_amount: [null],
      note: [null],
      branch_id: [null, Validators.required],
      action_change: [0]
    });
    this.userService.getStoreBranchList().subscribe(res => {
      this.branchList = res.body;
    });

    this.allPermission = sessionStorage.getItem('allPermission').split(',');
    this.isAdminStore = sessionStorage.getItem('isAdminStore') === 'true';

    this.displayedColumns = this.columnsToDisplay;

    this.filteredSuppliers = this.form.controls['supplier'].valueChanges.pipe(
      startWith(''),
      // delay emits
      debounceTime(300),
      // use switch map so as to cancel previous subscribed events, before creating new once
      switchMap(value => {
        if (value !== '') {
          // lookup from github
          return this.lookup(value);
        } else {
          // if no value is present, return null
          return of(null);
        }
      })
    );
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
      this.mainService.getDetail(this.updateModelId, 'supplier').subscribe(res => {
        let dateStr = null;
        if (res['date'] !== null) {
          dateStr = new Date(res['date']).toISOString();
        }
        this.model = res;
        this.form.patchValue({
          date: dateStr,
          no: res['no'],
          supplier: res['supplier'],
          destroy_reason: res['destroy_reason'],
          status: res['status'] + '',
          quantity: res['total_quantity'],
          total_price: res['total_price'],
          total_amount: res['total_amount'],
          discount_amount: res['discount_amount'],
          paid_amount: res['paid_amount'],
          remain_amount: res['remain_amount'],
          note: res['note'],
          branch_id: res['branch_id'].toString(),
        });
        this.form.controls['date'].disable();
        this.form.controls['supplier'].disable();
        this.form.controls['no'].disable();
        this.form.controls['status'].disable();
        this.form.controls['quantity'].disable();
        this.form.controls['total_price'].disable();
        this.form.controls['remain_amount'].disable();

        if (res && res['status'] === 10) {
          this.form.patchValue({
            action_change: 1
          });
        }

        this.loadData();
      });
    } else {
      this.userService.getBranchLogin().subscribe(branchLogin => {
        this.form.controls['branch_id'].setValue(branchLogin.toString());
      });

      this.mainService.getRenderWarehouseNo().subscribe(res => {
        this.form.patchValue({
          no: (this.isDestroy ? 'XH0' : 'PT0') + res,
          total_price: 0,
          discount_amount: 0,
          discount_type: 'price'
        });
      });
    }
  }

  displaySupplier(supplier?: Supplier): string | undefined {
    return supplier ? supplier.name : undefined;
  }

  lookup(value: string): Observable<Supplier[]> {
    return this.supplierSer.autocomplete(value).pipe(
      // map the item property of the github results as our return object
      map(results => results),
      // catch errors
      catchError(_ => {
        return of(null);
      })
    );
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
    this.warehouseProductService.getList(this.apiFilter).subscribe(res => {
      const newData = [];
      const isDone = this.model && Number(this.model['status']) === 10;
      res.body.forEach(item => {
        const productParcels = item.productParcels || [];
        let productUnit = null;
        if (item.productUnits && item.productUnits.length > 0) {
          productUnit = item.productUnits.find(obj => obj.id === item.product_unit_id);
        }
        const unitValue = productUnit && Number(productUnit['value']) > 0 ? Number(productUnit['value']) : 1;

        productParcels.forEach(parcel => {
          if (isDone) {
            const key = item.product_id + '|' + parcel['parcel_no'] + '|' + parcel['expiration_date'];
            const own = this.ownReturned[key] || {
              productId: String(item.product_id),
              parcel_no: parcel['parcel_no'],
              expiration_date: parcel['expiration_date'],
              quantity: 0,
            };
            own.quantity += Number(parcel['quantity']) || 0; // đơn vị cơ bản
            this.ownReturned[key] = own;
          }
          parcel['quantity'] = (Number(parcel['quantity']) || 0) / unitValue;
        });

        // Mỗi dòng một lô (giống màn Kiểm kho). Phiếu lưu từ trước có thể dồn nhiều lô
        // vào một dòng -> tách ra: dòng đầu giữ id (backend cập nhật), các dòng sau không
        // có id (backend tạo mới); số lượng, đơn giá, thành tiền của phiếu không đổi.
        const groups = productParcels.length > 1 ? productParcels.map(parcel => [parcel]) : [productParcels];
        groups.forEach((parcels, k) => {
          const warehouseProduct = new WarehouseProduct();
          if (this.updateModelId !== null && k === 0) {
            warehouseProduct.id = item.id;
          }
          const quantity = productParcels.length > 1 ? Number(parcels[0]['quantity']) : item.quantity;

          warehouseProduct.product_id = item.product_id;
          warehouseProduct.product = item.product;
          warehouseProduct.quantity = quantity;
          warehouseProduct.price = item.price;
          warehouseProduct.discount = item.discount;
          warehouseProduct.amount = productParcels.length > 1
            ? (Number(item.price) - Number(item.discount)) * quantity
            : Number(item.amount);

          warehouseProduct.product_unit_id = item.product_unit_id;
          warehouseProduct.productUnits = item.productUnits !== undefined ? item.productUnits : [];
          warehouseProduct.product_parcels = parcels;

          newData.push(warehouseProduct);
        });

        this.loadAvailableParcels(item.product_id);
      });
      this.data = newData;
      this.productDataSource = new MatTableDataSource<WarehouseProduct>(this.data);
      this.recalculateWarehouse();
      this.isLoadingResults = false;
    });
  }

  buildFilterFromParams(): WarehouseProductFilter {
    function write<K extends keyof WarehouseProductFilter>(arg: WarehouseProductFilter, key: K, value: WarehouseProductFilter[K]): void {
      arg[key] = value;
    }

    const filter = new WarehouseProductFilter();
    const objectKeys = Object.keys(filter) as Array<keyof WarehouseProductFilter>;

    for (const attr of objectKeys) {
      write(filter, attr, this.route.snapshot.queryParams['WarehouseProductSearch[' + attr + ']']);
    }
    filter.page = this.route.snapshot.queryParams['page'];
    filter.pageSize = this.route.snapshot.queryParams['pageSize'];
    filter.sort = this.route.snapshot.queryParams['sort'];
    filter.expand = 'product,productParcels,productUnits';
    if (this.updateModelId !== null) {
      filter.warehouse_id = this.updateModelId;
    }
    return filter;
  }

  submit(status: number) {
    if (this.isLoadingResults === true) {
      return;
    }
    // Dòng đang báo lỗi số lượng (vượt tồn kho / vượt tồn lô): giá trị sai vẫn nằm trong
    // data[i].quantity vì ô nhập gắn ngModel, gửi đi sẽ bị backend từ chối với câu khó
    // hiểu "tổng các lô chưa khớp số lượng" — chặn ở đây và nói đúng lỗi.
    if (this.invalidQuantityItems.size > 0 || this.invalidPriceItems.size > 0) {
      const row = Array.from(this.invalidQuantityItems)[0] || Array.from(this.invalidPriceItems)[0];
      const message = this.quantityErrors.get(row) || this.priceErrors.get(row) || 'Dữ liệu không hợp lệ';
      this.notifySer.notify('error', 'Sản phẩm "' + (row?.['product']?.['product_name'] || '') + '": ' + message + '.');
      return;
    }
    this.isLoadingResults = true;
    if (this.form.valid) {
      const data = this.form.getRawValue();

      let isValidUnits = true;
      this.data.forEach(item => {
        if (!item.product_unit_id) {
          // @ts-ignore
          this.notifySer.notify('warning', 'Vui lòng chọn đơn vị cho SP: ' +  item?.product?.product_name);
          isValidUnits = false;
          return;
        }
      });

      if (!isValidUnits) {
        this.isLoadingResults = false;
        return;
      }

      data['supplier_id'] = data['supplier']?.id || null;
      if (this.form.controls['date'].value !== null && typeof this.form.controls['date'].value === 'object') {
        const effDate = new Date(this.form.controls['date'].value.getTime() + (420 * 60 * 1000));

        data['date'] = effDate.toISOString().split('T')[0];
      }
      data['items'] = this.data;
      data['status'] = status;

      if (this.updateModelId !== null) {
        // if (this.model['status'] === 10 && !this.isAdminStore) {
        //   this.notifySer.notify('error', 'Bạn không có quyền thực hiện chức năng này.');
        //   this.isLoadingResults = false;
        //   return;
        // }

        delete data['date'];
        delete data['supplier'];
        this.mainService.update(this.updateModelId, data).subscribe({
          next: (res: IResponse<Warehouse>) => {
            if (res && res.success) {
              this.isLoadingResults = false;
              this.notifySer.notify('success', 'Lưu thành công.');
              if (status === 9) {
                this.model = res.data;
                this.router.navigate([this.basePath + '/update/' + res.data.id]);
              } else {
                this.router.navigate([this.basePath + '/']);
              }
            } else {
              this.isLoadingResults = false;
              this.notifySer.notify('error', res.message || 'Có lỗi xảy ra, vui lòng thử lại.');
            }
          },
          error: (err) => {
            this.isLoadingResults = false;
            this.notifySer.notify('error', err?.error?.message || 'Có lỗi xảy ra, vui lòng thử lại.');
          }
        });
      } else {
        this.mainService.create(data).subscribe({
          next: (res: IResponse<Warehouse>) => {
            if (res && res.success) {
              this.isLoadingResults = false;
              this.notifySer.notify('success', 'Lưu thành công.');
              if (status === 9) {
                this.model = res.data;
                this.router.navigate([this.basePath + '/update/' + res.data.id]);
              } else {
                this.router.navigate([this.basePath + '/']);
              }
            } else {
              this.isLoadingResults = false;
              this.notifySer.notify('error', res.message || 'Có lỗi xảy ra, vui lòng thử lại.');
            }
          },
          error: (err) => {
            this.isLoadingResults = false;
            this.notifySer.notify('error', err?.error?.message || 'Có lỗi xảy ra, vui lòng thử lại.');
          }
        });
      }
    }
  }

  validateQuantityInput(i: number, event: Event) {
    const input = (event.target as HTMLInputElement).value.trim();
    const item = this.data[i];
    const num = Number(input);
    if (!input || isNaN(num) || !/^\d+(\.\d+)?$/.test(input)) {
      this.invalidQuantityItems.add(item);
      this.quantityErrors.set(item, 'Số lượng không hợp lệ');
      return;
    }
    if (num <= 0) {
      this.invalidQuantityItems.add(item);
      this.quantityErrors.set(item, 'Số lượng phải lớn hơn 0');
      return;
    }
    const inventory = item['inventory_quantity'];
    if (inventory !== undefined && inventory !== null && num > inventory) {
      this.invalidQuantityItems.add(item);
      this.quantityErrors.set(item, `Số lượng không được vượt quá tồn kho (${inventory})`);
      return;
    }
    if (item['product_parcels'].length === 1) {
      const lotStock = this.parcelStockInRowUnit(i, item['product_parcels'][0]);
      if (lotStock !== null && num > lotStock) {
        this.invalidQuantityItems.add(item);
        this.quantityErrors.set(item, `Lô ${item['product_parcels'][0]['parcel_no']} chỉ còn ${lotStock}`);
        return;
      }
      item['product_parcels'][0]['quantity'] = num;
    }
    this.invalidQuantityItems.delete(item);
    this.quantityErrors.delete(item);
    this.recalculateItem(i);
  }

  clearQuantityError(i: number) {
    const item = this.data[i];
    this.invalidQuantityItems.delete(item);
    this.quantityErrors.delete(item);
  }


  clearPriceError(i: number) {
    const item = this.data[i];
    this.invalidPriceItems.delete(item);
    this.priceErrors.delete(item);
  }

  validatePriceInput(i: number, event: Event) {
    const input = (event.target as HTMLInputElement).value.trim();
    const item = this.data[i];
    const num = Number(input);
    if (input === '' || isNaN(num) || !/^-?\d+(\.\d+)?$/.test(input)) {
      this.invalidPriceItems.add(item);
      this.priceErrors.set(item, 'Đơn giá không hợp lệ');
      return;
    }
    if (num < 0) {
      this.invalidPriceItems.add(item);
      this.priceErrors.set(item, 'Đơn giá không được nhỏ hơn 0');
      return;
    }
    this.invalidPriceItems.delete(item);
    this.priceErrors.delete(item);
    this.recalculateItem(i);
  }


  onSelectedProduct(product) {
    this.productSer.getDetail(product.id, 'productUnits,quantity').subscribe(res => {
      const warehouseProduct = new WarehouseProduct();
      warehouseProduct.product_id = product.id;
      warehouseProduct.product = product;
      warehouseProduct.quantity = 1;
      warehouseProduct.price = product.original_price;
      warehouseProduct.discount = 0;
      warehouseProduct.amount = product.original_price;
      warehouseProduct.productUnits = res['productUnits'];
      warehouseProduct.product_parcels = [];

      const baseQty = res['quantity'] ? res['quantity']['number'] : 0;
      warehouseProduct.inventory_quantity = baseQty;

      if (res['productUnits'].length > 0) {
        res['productUnits'].sort((a, b) => (a.value > b.value) ? 1 : -1);
        res['productUnits'].forEach(pu => {
          pu['quantity_of_stock'] = Math.floor(baseQty / (pu['value'] || 1));
        });
        warehouseProduct.product_unit_id = res['productUnits'][0]['id'];
        warehouseProduct.price = res['productUnits'][0]['original_price'];
        warehouseProduct.inventory_quantity = res['productUnits'][0]['quantity_of_stock'];
      }

      const newData = this.data.concat([warehouseProduct]);
      this.data = newData;
      this.productDataSource = new MatTableDataSource<WarehouseProduct>(this.data);
      this.recalculateWarehouse();
      this.selectProduct.patchValue(null);
      this.loadAvailableParcels(product.id);
    });
  }

  recalculateItem(i) {
    if (this.data[i] !== undefined) {
      this.data[i]['amount'] = (Number(this.data[i]['price']) - Number(this.data[i]['discount'])) * Number(this.data[i]['quantity']);
      this.recalculateWarehouse();
    }
  }

  recalculateWarehouse() {
    let quantity = 0;
    let price = 0;
    let remainAmount = 0;
    let totalAmount = 0;
    const paidAmount = this.form.controls['paid_amount'].value;
    const discount = this.form.controls['discount_amount'].value;

    this.data.forEach(item => {
      quantity = Number(quantity) + Number(item['quantity']);
      price = price + (Number(item['quantity']) * (Number(item['price']) - Number(item['discount'])));
    });
    remainAmount = paidAmount - (price - discount);
    totalAmount = price - discount;
    this.form.patchValue({
      quantity: quantity,
      total_price: price,
      remain_amount: remainAmount,
      total_amount: totalAmount
    });
  }

  removeProduct(i) {
    const newData = this.data;
    newData.splice(i, 1);

    this.data = newData;

    this.recalculateWarehouse();
    this.productDataSource = new MatTableDataSource<WarehouseProduct>(this.data);
  }

  /** Nạp lô còn tồn của một sản phẩm (một lần cho mỗi sản phẩm). */
  loadAvailableParcels(productId) {
    const key = String(productId);
    if (this.availableParcels[key] !== undefined) {
      this.autoSelectSingleLot(key);
      return;
    }
    this.availableParcels[key] = null; // đang tải
    this.productSer.getParcelInStock(key).subscribe(res => {
      const lots = ((res as object[]) || []).map(item => ({
        parcel_no: item['parcel_no'],
        expiration_date: item['expiration_date'],
        quantity_of_stock: Number(item['quantity_of_stock']) || 0,
      }));
      // Lô mà chính phiếu (đã hoàn thành) này trả hết thì API không còn trả về, nhưng vẫn
      // phải chọn lại được khi sửa phiếu.
      Object.keys(this.ownReturned).forEach(ownKey => {
        const own = this.ownReturned[ownKey];
        if (own.productId === key && !lots.some(lot => this.lotKey(lot) === this.lotKey(own))) {
          lots.push({parcel_no: own.parcel_no, expiration_date: own.expiration_date, quantity_of_stock: 0});
        }
      });
      this.availableParcels[key] = lots;
      this.autoSelectSingleLot(key);
    }, () => {
      delete this.availableParcels[key];
      this.notifySer.notify('error', 'Không tải được danh sách lô tồn của sản phẩm.');
    });
  }

  /** Sản phẩm chỉ còn đúng một lô tồn thì chọn sẵn cho các dòng chưa chọn lô. */
  private autoSelectSingleLot(productId: string) {
    const lots = this.availableParcels[productId];
    if (!lots || lots.length !== 1) {
      return;
    }
    this.data.forEach((row, index) => {
      if (String(row['product_id']) === productId && (!row['product_parcels'] || row['product_parcels'].length === 0)) {
        this.onLotChange(index, this.lotKey(lots[0]));
      }
    });
  }

  /** Khoá của một lô: tồn lô tính theo cặp (số lô, hạn dùng), không chỉ số lô. */
  lotKey(lot): string {
    return lot['parcel_no'] + '|' + lot['expiration_date'];
  }

  selectedLotKey(index): string | null {
    const parcels = this.data[index]['product_parcels'] || [];
    return parcels.length === 1 ? this.lotKey(parcels[0]) : null;
  }

  /** Lô đang chọn trên dòng nhưng không còn trong danh sách tồn (mở lại phiếu cũ). */
  selectedLotMissing(index): boolean {
    const key = this.selectedLotKey(index);
    if (key === null) {
      return false;
    }
    const lots = this.availableParcels[String(this.data[index]['product_id'])] || [];
    return !lots.some(lot => this.lotKey(lot) === key);
  }

  /** Hệ số quy đổi của đơn vị đang chọn trên dòng (tồn lô tính theo đơn vị cơ bản). */
  private unitValueOf(index): number {
    const row = this.data[index];
    const unit = (row['productUnits'] || []).find(u => u['id'] === row['product_unit_id']);
    return unit && Number(unit['value']) > 0 ? Number(unit['value']) : 1;
  }

  /** Tồn của một lô quy theo đơn vị đang chọn trên dòng. */
  lotStockInRowUnit(index, lot): number {
    const own = this.ownReturned[this.data[index]['product_id'] + '|' + this.lotKey(lot)];
    const stock = (Number(lot['quantity_of_stock']) || 0) + (own ? own.quantity : 0);
    return Math.floor(stock / this.unitValueOf(index));
  }

  /** Tồn của lô đang chọn trên dòng, null nếu không tra được. */
  private parcelStockInRowUnit(index, parcel): number | null {
    const lots = this.availableParcels[String(this.data[index]['product_id'])] || [];
    const lot = lots.find(l => this.lotKey(l) === this.lotKey(parcel));
    return lot ? this.lotStockInRowUnit(index, lot) : null;
  }

  /**
   * Chọn lô cho dòng — giống màn Kiểm kho: mỗi dòng một lô, số lượng trên dòng chính
   * là số trả của lô đó. Trả từ nhiều lô thì thêm sản phẩm thêm một lần.
   */
  onLotChange(index, key) {
    const row = this.data[index];
    const lots = this.availableParcels[String(row['product_id'])] || [];
    const lot = lots.find(l => this.lotKey(l) === key);
    if (!lot) {
      return;
    }
    row['product_parcels'] = [{
      parcel_no: lot['parcel_no'],
      expiration_date: lot['expiration_date'],
      quantity: Number(row['quantity']) || 0,
    }];
    this.checkLotStock(index);
  }

  /** Báo lỗi ngay trên dòng nếu số lượng trả vượt tồn của lô đang chọn. */
  private checkLotStock(index) {
    const row = this.data[index];
    if (!row['product_parcels'] || row['product_parcels'].length !== 1) {
      return;
    }
    const stock = this.parcelStockInRowUnit(index, row['product_parcels'][0]);
    if (stock !== null && Number(row['quantity']) > stock) {
      this.invalidQuantityItems.add(row);
      this.quantityErrors.set(row, `Lô ${row['product_parcels'][0]['parcel_no']} chỉ còn ${stock}`);
    } else if ((this.quantityErrors.get(row) || '').startsWith('Lô ')) {
      this.invalidQuantityItems.delete(row);
      this.quantityErrors.delete(row);
    }
  }

  changeQuantity(index, value) {
    const newQty = Number(this.data[index]['quantity']) + Number(value);
    const inventory = this.data[index]['inventory_quantity'];
    if (Number(value) > 0 && inventory !== undefined && inventory !== null && newQty > inventory) {
      this.notifySer.notify('error', `Số lượng không được vượt quá tồn kho (${inventory})`);
      return;
    }
    if (this.data[index]['product_parcels'].length === 1) {
      const lotStock = this.parcelStockInRowUnit(index, this.data[index]['product_parcels'][0]);
      if (Number(value) > 0 && lotStock !== null && newQty > lotStock) {
        this.notifySer.notify('error', `Lô ${this.data[index]['product_parcels'][0]['parcel_no']} chỉ còn ${lotStock}`);
        return;
      }
    }
    this.data[index]['quantity'] = newQty;
    if (this.data[index]['product_parcels'].length === 1) {
      this.data[index]['product_parcels'][0]['quantity'] = this.data[index]['quantity'];
    }
    this.recalculateItem(index);
  }

  openSupplierFormDialog() {
    const dialogRef = this.dialog.open(SupplierFormDialogComponent, {
      width: '50%',
      minHeight: '80%',
    });

    dialogRef.afterClosed().subscribe(result => {
      this.form.patchValue({'supplier': result});
    });
  }

  checkPermissionDisable(permission) {
    const indexPermission = this.allPermission.indexOf(permission);
    if (indexPermission !== -1) {
      return false;
    }
    return  true;
  }

  /**
   * - Trả hàng đơn vị giá đơn vị  = giá vôn đơn vị cơ bản * số lượng quy đổi
   * @param index
   * @param select
   */
  onUnitChange(index, select) {
    if (this.data[index] !== undefined) {
      const unit = this.data[index]['productUnits'].find(element => element['id'] === select.value);
      const unitBase = this.data[index]['productUnits'].find(element => element['is_base'] === 1);
      this.data[index]['price'] = unitBase['original_price'] * unit['value'];
      this.data[index]['sell_price'] = unit['sell_price'];
      this.data[index]['inventory_quantity'] = unit['quantity_of_stock'];
      // Re-validate quantity against new unit's inventory
      const item = this.data[index];
      const qty = Number(item['quantity']);
      const inventory = unit['quantity_of_stock'];
      if (inventory !== undefined && inventory !== null && qty > inventory) {
        this.invalidQuantityItems.add(item);
        this.quantityErrors.set(item, `Số lượng không được vượt quá tồn kho (${inventory})`);
      } else {
        this.invalidQuantityItems.delete(item);
        this.quantityErrors.delete(item);
      }
      // this.data[index]['price'] = (unit['original_price'] !== 0) ? unit['original_price'] : unit['sell_price']; //unit['original_price'];
      this.data[index]['amount'] = (this.data[index]['price'] - this.data[index]['discount']) * this.data[index]['quantity'];

      if (this.data[index]['product_parcels'].length === 1) {
        this.data[index]['product_parcels'][0]['quantity'] = this.data[index]['quantity'];
        // Tồn lô quy theo đơn vị mới đã khác, kiểm lại
        this.checkLotStock(index);
      }
      this.recalculateItem(index);
    }
  }


}
