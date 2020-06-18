import {Component, OnInit, ViewChild} from '@angular/core';
import {MatTable, MatTableDataSource} from '@angular/material/table';
import {MatSort} from '@angular/material/sort';
import {MatPaginator} from '@angular/material/paginator';
import {NotifierService} from 'angular-notifier';
import {MatDialog} from '@angular/material/dialog';
import {ListComponentBase} from '../../shared/base';
import {WarehouseProductService} from '../warehouse-product.service';
import {WarehouseProduct, WarehouseProductFilter} from '../warehouse.model';
import {ActivatedRoute, Router} from '@angular/router';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {Observable} from 'rxjs/index';
import {Supplier} from '../../supplier/supplier.model';
import {catchError, debounceTime, map, startWith, switchMap} from 'rxjs/operators';
import {of} from 'rxjs/internal/observable/of';
import {SupplierService} from '../../supplier/supplier.service';
import {WarehouseService} from '../warehouse.service';
import {Product} from '../../product/product.model';
import {ProductService} from '../../product/product.service';

@Component({
  selector: 'app-warehouse-import-form',
  templateUrl: './warehouse-import-form.component.html',
  styleUrls: ['./warehouse-import-form.component.css']
})
export class WarehouseImportFormComponent extends ListComponentBase implements OnInit {

  constructor(
    private mainService: WarehouseService,
    private warehouseProductService: WarehouseProductService,
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

  @ViewChild(MatTable, { static: true }) table: MatTable<any>;
  @ViewChild('selectColumn') selectColumn;

  selectProduct = new FormControl();

  apiFilter: WarehouseProductFilter;
  updateModelId = null;

  statuses = [
    {id: '1', name: 'Hoàn thành'},
    {id: '10', name: 'Lưu tạm'},
  ];

  columnsHeader = {
    '#': '#',
    'product_no': 'Mã hàng',
    'product_name': 'Tên hàng',
    'quantity': 'Số lượng',
    'price': 'Đơn giá',
    'discount': 'Giảm giá',
    'amount': 'Thành tiền',
  };

  displayedColumns: string[] = [];
  columnsToDisplay: string[] = [
    '#',
    'product_no',
    'product_name',
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
      type: ['import'],
      quantity: [null],
      total_price: [null],
      total_amount: [null],
      discount_amount: [null],
      paid_amount: [null],
      remain_amount: [null],
      note: [null],
    });

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
        });
        this.form.controls['date'].disable();
        this.form.controls['supplier'].disable();
        this.form.controls['no'].disable();
        this.form.controls['status'].disable();
        this.form.controls['quantity'].disable();
        this.form.controls['total_price'].disable();
        this.form.controls['remain_amount'].disable();

        this.loadData();
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
        warehouseProduct.amount = item.amount;

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
    filter.expand = 'product';
    if (this.updateModelId !== null) {
      filter.warehouse_id = this.updateModelId;
    }
    return filter;
  }

  submit(status) {
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
        delete data['date'];
        delete data['supplier'];
        this.mainService.update(this.updateModelId, data).subscribe(res => {
          this.notifySer.notify('success', 'Lưu thành công.');
        });
      } else {
        this.mainService.create(data).subscribe(res => {
          this.notifySer.notify('success', 'Lưu thành công.');
          this.router.navigate(['/transaction/warehouse/update/' + res['id']]);
        });
      }
    }
  }

  onSelectedProduct(product) {
    const warehouseProduct = new WarehouseProduct();
    warehouseProduct.product_id = product.id;
    warehouseProduct.product = product;
    warehouseProduct.quantity = 1;
    warehouseProduct.price = product.original_price;
    warehouseProduct.discount = 0;
    warehouseProduct.amount = product.original_price;

    const newData = this.data.concat([warehouseProduct]);
    this.data = newData;
    this.productDataSource = new MatTableDataSource<WarehouseProduct>(this.data);
    this.recalculateWarehouse();
    this.selectProduct.patchValue(null);
  }

  recalculateItem(i) {
    if (this.data[i] !== undefined) {
      this.data[i]['amount'] = (this.data[i]['price'] - this.data[i]['discount']) * this.data[i]['quantity'];
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
      quantity = quantity + item['quantity'];
      price = price + (item['quantity'] * (item['price'] - item['discount']));
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

}
