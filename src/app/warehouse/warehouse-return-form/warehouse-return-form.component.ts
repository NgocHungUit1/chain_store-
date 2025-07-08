import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { NotifierService } from 'angular-notifier';
import { MatDialog } from '@angular/material/dialog';
import { ListComponentBase } from '../../shared/base';
import { WarehouseProductService } from '../warehouse-product.service';
import { WarehouseProduct, WarehouseProductFilter } from '../warehouse.model';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs/index';
import { Supplier } from '../../supplier/supplier.model';
import { catchError, debounceTime, map, startWith, switchMap } from 'rxjs/operators';
import { of } from 'rxjs/internal/observable/of';
import { SupplierService } from '../../supplier/supplier.service';
import { WarehouseService } from '../warehouse.service';
import { Product } from '../../product/product.model';
import { ProductService } from '../../product/product.service';
import { WarehouseParcelFormDialogComponent } from '../warehouse-parcel-form-dialog/warehouse-parcel-form-dialog.component';
import { SupplierFormDialogComponent } from '../../supplier/supplier-form-dialog/supplier-form-dialog.component';
import { UserService } from '../../user/user.service';

@Component({
  selector: 'app-warehouse-return-form',
  templateUrl: './warehouse-return-form.component.html',
  styleUrls: ['./warehouse-return-form.component.css']
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
  parcels: object[] = [];
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

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  isLoadingResults = false;
  isRateLimitReached = false;

  form: FormGroup;

  filteredSuppliers: Observable<Supplier[]>;
  filteredProducts: Observable<Product[]>;

  ngOnInit() {
    const date = new FormControl(new Date());
    this.form = this.fb.group({
      date: date,
      no: [null],
      supplier: [null, Validators.required],
      status: [null],
      type: ['return'],
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
          no: 'PT0' + res,
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
      res.body.forEach(item => {
        const warehouseProduct = new WarehouseProduct();
        if (this.updateModelId !== null) {
          warehouseProduct.id = item.id;
        }
        warehouseProduct.product_id = item.product_id;
        warehouseProduct.product = item.product;
        warehouseProduct.quantity = item.quantity;
        warehouseProduct.price = item.price;
        warehouseProduct.discount = item.discount;
        warehouseProduct.amount = Number(item.amount);

        warehouseProduct.product_unit_id = item.product_unit_id;
        warehouseProduct.productUnits = item.productUnits !== undefined ? item.productUnits : [];
        warehouseProduct.product_parcels = item.productParcels !== undefined ? item.productParcels : [];

        if (item.productParcels !== undefined && item.productParcels.length > 0) {
          this.parcels = this.parcels.concat(item.productParcels);
        }

        newData.push(warehouseProduct);
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
    this.isLoadingResults = true;
    if (this.form.valid) {
      const data = this.form.getRawValue();
      data['supplier_id'] = data['supplier']['id'];
      if (this.form.controls['date'].value !== null && typeof this.form.controls['date'].value === 'object') {
        const effDate = new Date(this.form.controls['date'].value.getTime() + (420 * 60 * 1000));

        data['date'] = effDate.toISOString().split('T')[0];
      }
      data['items'] = this.data;
      data['status'] = status;

      if (this.updateModelId !== null) {
        if (this.model['status'] === 10 && !this.isAdminStore) {
          this.notifySer.notify('error', 'Bạn không có quyền thực hiện chức năng này.');
          this.isLoadingResults = false;
          return;
        }

        delete data['date'];
        delete data['supplier'];
        this.mainService.update(this.updateModelId, data).subscribe(res => {
          this.isLoadingResults = false;
          this.notifySer.notify('success', 'Lưu thành công.');
          if (status === 9) {
            this.model = res;
            this.router.navigate(['/transaction/warehouse-return/update/' + res['id']]);
          } else {
            this.router.navigate(['/transaction/warehouse-return/']);
          }
        });
      } else {
        this.mainService.create(data).subscribe(res => {
          this.isLoadingResults = false;
          this.notifySer.notify('success', 'Lưu thành công.');
          if (status === 9) {
            this.model = res;
            this.router.navigate(['/transaction/warehouse-return/update/' + res['id']]);
          } else {
            this.router.navigate(['/transaction/warehouse-return/']);
          }
        });
      }
    }
  }

  onSelectedProduct(product) {
    this.productSer.getDetail(product.id, 'productUnits').subscribe(res => {
      const warehouseProduct = new WarehouseProduct();
      warehouseProduct.product_id = product.id;
      warehouseProduct.product = product;
      warehouseProduct.quantity = 1;
      warehouseProduct.price = product.original_price;
      warehouseProduct.discount = 0;
      warehouseProduct.amount = product.original_price;
      warehouseProduct.productUnits = res['productUnits'];
      warehouseProduct.product_parcels = [];

      if (res['productUnits'].length > 0) {
        res['productUnits'].sort((a, b) => (a.value > b.value) ? 1 : -1);
        warehouseProduct.product_unit_id = res['productUnits'][0]['id'];
        warehouseProduct.price = res['productUnits'][0]['original_price'];
      }

      const newData = this.data.concat([warehouseProduct]);
      this.data = newData;
      this.productDataSource = new MatTableDataSource<WarehouseProduct>(this.data);
      this.recalculateWarehouse();
      this.selectProduct.patchValue(null);
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

  openParcelFormDialog(index) {
    const dialogRef = this.dialog.open(WarehouseParcelFormDialogComponent, {
      width: '20%',
      data: {parcels: this.parcels}
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result !== false && result !== undefined) {
        this.parcels.push(result);
        this.data[index]['product_parcels'].push(result);
        let quantity = 0;
        this.data[index]['product_parcels'].forEach(parcel => {
          quantity = quantity + parcel['quantity'];
        });
        this.data[index]['quantity'] = quantity;
        this.data[index]['amount'] = (this.data[index]['price'] - this.data[index]['discount']) * this.data[index]['quantity'];
        this.recalculateWarehouse();
      }
    });
  }

  changeQuantity(index, value) {
    this.data[index]['quantity'] = Number(this.data[index]['quantity']) + Number(value);
    if (this.data[index]['product_parcels'].length === 1) {
      this.data[index]['product_parcels'][0]['quantity'] = this.data[index]['quantity'];
    }
    this.recalculateItem(index);
  }

  onParcelSelectedChange(index, value) {
    let quantity = 0;
    this.data[index]['product_parcels'].forEach(parcel => {
      quantity = quantity + parcel['quantity'];
    });
    this.data[index]['quantity'] = quantity;
    this.data[index]['amount'] = (this.data[index]['price'] - this.data[index]['discount']) * this.data[index]['quantity'];
    this.recalculateWarehouse();
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
      // this.data[index]['price'] = (unit['original_price'] !== 0) ? unit['original_price'] : unit['sell_price']; //unit['original_price'];
      this.data[index]['amount'] = (this.data[index]['price'] - this.data[index]['discount']) * this.data[index]['quantity'];
      this.recalculateWarehouse();
    }
  }


}
