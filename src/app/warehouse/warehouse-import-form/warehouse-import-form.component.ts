import {Component, OnInit, ViewChild, ViewEncapsulation} from '@angular/core';
import {MatTable, MatTableDataSource} from '@angular/material/table';
import {MatSort} from '@angular/material/sort';
import {MatPaginator} from '@angular/material/paginator';
import {NotifierService} from 'angular-notifier';
import {MatDialog} from '@angular/material/dialog';
import {ListComponentBase} from '../../shared/base';
import {WarehouseProductService} from '../warehouse-product.service';
import {Warehouse, WarehouseProduct, WarehouseProductFilter} from '../warehouse.model';
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
import {WarehouseParcelFormDialogComponent} from '../warehouse-parcel-form-dialog/warehouse-parcel-form-dialog.component';
import {WarehouseDiscountDialogComponent} from '../warehouse-discount-dialog/warehouse-discount-dialog.component';
import {SupplierFormDialogComponent} from '../../supplier/supplier-form-dialog/supplier-form-dialog.component';
import {ProductMedicineDialogComponent} from '../../product/product-medicine-dialog/product-medicine-dialog.component';
// tslint:disable-next-line:max-line-length
import {
  ProductMerchandiseFormDialogComponent
} from '../../product/product-merchandise-form-dialog/product-merchandise-form-dialog.component';
import {UserService} from '../../user/user.service';
import * as numeral from 'numeral';
import {MedicineService} from '../../medicine/medicine.service';
import {Medicine} from '../../medicine/medicine.model';
import {ExpensesTransaction, ExpensesTransactionFilter} from '../../expenses-transaction/expenses-transaction.model';
import {ExpensesTransactionService} from '../../expenses-transaction/expenses-transaction.service';
import {OptionStoreService} from '../../common/option-store.service';
import {OptionStore} from '../../common/option-store.model';
import {WarehouseExpensesComponent} from '../warehouse-expenses/warehouse-expenses.component';
import {WarehouseParcelListDialogComponent} from '../warehouse-parcel-list-dialog/warehouse-parcel-list-dialog.component';
import {WarehouseFormPriceDialogComponent} from '../warehouse-form-price-dialog/warehouse-form-price-dialog.component';
import {SearchProductDialogComponent} from '../../common/search-product-dialog/search-product-dialog.component';
import * as moment from 'moment';
import {SearchSupplierDialogComponent} from '../../common/search-supplier-dialog/search-supplier-dialog.component';
import { WarehouseUnitCreateDialogComponent } from '../warehouse-unit-create-dialog/warehouse-unit-create-dialog.component';


@Component({
  selector: 'app-warehouse-import-form',
  templateUrl: './warehouse-import-form.component.html',
  styleUrls: ['./warehouse-import-form.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class WarehouseImportFormComponent extends ListComponentBase implements OnInit {

  constructor(
    private mainService: WarehouseService,
    private warehouseProductService: WarehouseProductService,
    private medicineService: MedicineService,
    private userService: UserService,
    private dialog: MatDialog,
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private supplierSer: SupplierService,
    private productSer: ProductService,
    private notifySer: NotifierService,
    private expensesTransactionService: ExpensesTransactionService,
    private optionStoreService: OptionStoreService,
  ) {
    super();
  }


  @ViewChild(MatTable, {static: true}) table: MatTable<any>;
  @ViewChild('selectColumn') selectColumn;

  selectProduct = new FormControl();

  apiFilter: WarehouseProductFilter;
  updateModelId = null;
  model: Warehouse = null;
  branchList: any;
  allPermission: any;
  isAdminStore: boolean;
  expensesTransaction: number;
  expensesTransactions: ExpensesTransaction[] = [];
  optionStore_transaction_expenses: OptionStore;

  submitted = false;
  statuses = [
    {id: '10', name: 'Hoàn thành'},
    {id: '9', name: 'Lưu tạm'},
  ];

  parcels: object[] = [];

  columnsHeader = {
    '#': '#',
    'product_no': 'Mã hàng',
    'image': '',
    'product_name': 'Tên hàng',
    // 'product_parcel': 'Lô',
    'product_unit_id': 'Đơn vị',
    'quantity': 'Tổng SL',
    'price': 'Giá nhập',
    // 'discount': 'Chiết khấu',//'Giảm giá',
    'amount': 'Thành tiền',
    'actions': 'Hành động',
  };

  displayedColumns: string[] = [
    'actions',
    // 'image',
    '#',
    'product_no',
    'product_name',
    // 'product_parcel',
    'product_unit_id',
    'quantity',
    'price',
    // 'discount',
    'amount',
  ];
  columnsToDisplay: string[] = [
    'actions',
    'image',
    '#',
    'product_no',
    'product_name',
    // 'product_parcel',
    'product_unit_id',
    'quantity',
    'price',
    // 'discount',
    'amount',
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
  filteredMedicines: Observable<Medicine[]>;

  fieldLabels = {
    no: 'Mã phiếu',
    supplier: 'nhà cung cấp',
    status: 'trạng thái',
    type: 'loại',
    quantity: 'sô luọng',
    total_price: 'tổng tiền',
    total_amount: '',
    discount_amount: 'giảm giá',
    discount_type: 'loại giảm giá',
    paid_amount: 'tiền trả',
    remain_amount: 'tiền thừa',
    branch_id: 'chi nhánh',
  };

  ngOnInit() {

    const date = new FormControl(new Date());
    this.form = this.fb.group({
      date: date,
      no: [null, Validators.required],
      supplier: [null, Validators.required],
      status: [null],
      type: ['import'],
      quantity: [null],
      total_price: [null],
      total_amount: [null],
      discount_amount: [null],
      discount_type: [null],
      paid_amount: [null, Validators.required],
      remain_amount: [null],
      note: [null],
      branch_id: [null, Validators.required],
      expenses_price: [0],
      action_change: [0],
    });

    const optionStorePromise = new Promise((resolve) => {
      this.optionStoreService.getValue('transaction_expenses_transaction').subscribe(res => {
        this.optionStore_transaction_expenses = res;
        resolve();
      });
    });

    optionStorePromise.then(() => {

      this.allPermission = sessionStorage.getItem('allPermission').split(',');
      this.isAdminStore = sessionStorage.getItem('isAdminStore') === 'true';

      this.userService.getStoreBranchList().subscribe(res => {
        this.branchList = res.body;
      });

      // this.displayedColumns = this.columnsToDisplay;

      // this.filteredSuppliers = this.form.controls['supplier'].valueChanges.pipe(
      //   startWith(''),
      //   // delay emits
      //   debounceTime(300),
      //   // use switch map so as to cancel previous subscribed events, before creating new once
      //   switchMap(value => {
      //     if (value !== '') {
      //       // lookup from github
      //       return this.lookup(value);
      //     } else {
      //       // if no value is present, return null
      //       return of(null);
      //     }
      //   })
      // );

      this.selectProduct.valueChanges.subscribe(value => {
        setTimeout(res => {
          if (value !== '') {
            this.filteredProducts = this.lookupProduct(value);
            this.filteredMedicines = this.lookupMedicine(value);
          } else {
            // if no value is present, return null
            this.filteredProducts = of(null);
            this.filteredMedicines = of(null);
          }
        }, 300);
      });

      const id = this.route.snapshot.paramMap.get('id');
      if (id !== null && id !== undefined) {
        this.updateModelId = id;
        this.mainService.getDetail(this.updateModelId, 'supplier,warehouseExpensess').subscribe(res => {
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
            quantity: Number(res['total_quantity']),
            total_price: (res['total_price'] !== undefined) ? Number(res['total_price']) : 0,
            total_amount: Number(res['total_amount']),
            discount_amount: (res['discount_amount'] !== undefined && res['discount_amount'] !== null) ? Number(res['discount_amount']) : 0,
            discount_type: (res['discount_type'] !== undefined && res['discount_type'] !== null) ? res['discount_type'] : 'price',
            paid_amount: Number(res['paid_amount']),
            remain_amount: Number(res['remain_amount']),
            expenses_price: Number(res['expenses_price']),
            note: res['note'],
            branch_id: res['branch_id'].toString(),
          });

          this.expensesTransaction = Number(res['expenses_price']);

          // && res['status'] === 10
          if (this.expensesTransaction > 0) {
            this.expensesTransactions = res['warehouseExpensess'];
          }

          if (this.optionStore_transaction_expenses.value === 'yes' && res['status'] == 9) {
            const filter = new ExpensesTransactionFilter();
            filter.status = '10';
            filter.auto = '1';
            this.expensesTransactionService.getList(filter).subscribe(resEx => {
              const dataEx = <ExpensesTransaction[]>resEx.body;
              dataEx.forEach(expense => {
                // console.log(this.expensesTransactions.some(e => e.no === expense.no));
                if (!this.expensesTransactions.some(e => e.no === expense.no)) {
                  expense.auto = 0;
                  this.expensesTransactions.push(expense);
                }
              });

            });
          }

          // Luu thong tin
          if (this.updateModelId !== null && res['status'] === 10) {
            console.log(res['status']);
            this.form.patchValue({
              action_change: 1,
            });
            this.form.controls['date'].disable();
            this.form.controls['no'].disable();
          }

          this.form.controls['status'].disable();
          this.form.controls['quantity'].disable();

          this.loadData();
        });
      } else {
        this.userService.getBranchLogin().subscribe(branchLogin => {
          this.form.controls['branch_id'].setValue(branchLogin.toString());
        });
        this.mainService.getRenderWarehouseNo().subscribe(res => {
          this.form.patchValue({
            no: 'PN' + res,
            total_price: 0,
            discount_amount: 0,
            discount_type: 'price'
          });
        });

        if (this.optionStore_transaction_expenses.value === 'yes') {
          const filter = new ExpensesTransactionFilter();
          filter.status = '10';
          // filter.auto = '1';
          this.expensesTransactionService.getList(filter).subscribe(resEx => {
            this.expensesTransactions = <ExpensesTransaction[]>resEx.body;
            this.recalculateWarehouse();
          });
        }
      }

      const product_id = localStorage.getItem('product_id');
      if (product_id !== null) {
        this.handleAddProductToList(product_id);
        localStorage.removeItem('product_id');
      }

    });

  }

  displaySupplier(supplier?: Supplier): string | undefined {
    return (supplier === undefined || supplier === null) ? undefined : supplier.name;
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


  lookupMedicine(value: string): Observable<Medicine[]> {
    return this.medicineService.autocomplete(value).pipe(
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
        warehouseProduct.price = (item.price !== null) ? numeral(item.price).format('0,0') : 0;
        warehouseProduct.discount = (item.discount !== null) ? item.discount : 0;
        warehouseProduct.discount_type = (item.discount_type !== null) ? item.discount_type : 'price';
        warehouseProduct.amount = (item.amount !== null) ? item.amount : 0;
        warehouseProduct.product_unit_id = item.product_unit_id;
        warehouseProduct.productUnits = item.productUnits !== undefined ? item.productUnits : [];
        warehouseProduct.product_parcels = item.productParcels !== undefined ? item.productParcels : [];
        warehouseProduct.vat = (item.vat !== null) ? item.vat : 0;
        warehouseProduct.vat_type = (item.vat_type !== null) ? item.vat_type : 'price';

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
    filter.pageSize = 50; // this.route.snapshot.queryParams['pageSize'];
    filter.sort = this.route.snapshot.queryParams['sort'];
    filter.expand = 'product,productParcels,productUnits';
    if (this.updateModelId !== null) {
      filter.warehouse_id = this.updateModelId;
    }
    return filter;
  }


  submit(status: number) {
    if (this.submitted === true) {
      return;
    }
    this.submitted = true;
    this.isLoadingResults = true;
    this.recalculateWarehouse();
    const data = this.form.getRawValue();
    if (numeral(data['paid_amount']).value() > (numeral(data['total_price']).value() + numeral(data['expenses_price']).value())) {
      this.form.patchValue({
        paid_amount: '',
      });
    }

    const promise = new Promise((resolve, reject) => {
      const list = this.data;
      if (list.length > 0) {
        list.forEach(element => {
          if (element.quantity === 0) {
            // @ts-ignore
            this.notifySer.notify('warning', 'Chưa nhập số lượng ' + element?.product?.product_name);
            reject();
          }
        });
        resolve();
      } else {
        this.notifySer.notify('warning', 'Danh sách không được để trống !');
        reject();
      }
    });

    promise.then(() => {
      // console.log(this.form.valid);
      // console.log(this.form.controls);
      if (this.form.valid) {
        data['supplier_id'] = data['supplier']['id'];
        data['quantity'] = numeral(data['quantity']).value();
        data['total_price'] = numeral(data['total_price']).value();
        data['remain_amount'] = numeral(data['remain_amount']).value();
        data['total_amount'] = numeral(data['total_amount']).value();
        data['paid_amount'] = numeral(data['paid_amount']).value();
        data['expenses_price'] = numeral(data['expenses_price']).value();
        data['action_change'] = numeral(data['action_change']).value(); // chuc nang cap nhat don hoan thanh
        data['expensesTransactions'] = this.expensesTransactions;
        if (this.form.controls['date'].value !== null) {
          if (typeof this.form.controls['date'].value === 'object') {
            const effDate = new Date(this.form.controls['date'].value.getTime() + (420 * 60 * 1000));
            data['date'] = effDate.toISOString().split('T')[0];
          } else {
            // @@ NGHIA
            const effDate = this.form.controls['date'].value;
            data['date'] = effDate.split('T')[0];
            data['date'] = moment(data['date'], 'YYYY-MM-DD').add(1, 'days').format('YYYY-MM-DD');
          }
        }
        this.data.forEach(element => {
          element.price = numeral(element.price).value();
          element.amount = numeral(element.amount).value();
          element.discount = numeral(element.discount).value();
          element.vat = numeral(element.vat).value();
        });
        data['items'] = this.data;
        // console.log(this.data);
        data['status'] = status;

        if (data['supplier_id'] === undefined) {
          this.notifySer.notify('warning', this.form.controls['supplier'].value + ' chưa được tạo bên nhà cung cấp.');
          return;
        }

        if (this.updateModelId !== null) {
          if (this.model['status'] === 10 && !this.isAdminStore) {
            this.notifySer.notify('error', 'Bạn không có quyền thực hiện chức năng này.');
            return;
          }
          //delete data['date'];
          //delete data['supplier'];
          this.mainService.update(this.updateModelId, data).subscribe(res => { //
            this.notifySer.notify('success', 'Lưu thành công.');
            this.submitted = false;
            this.isLoadingResults = false;
            if (status === 9) {
              this.model = res;
              this.router.navigate(['/transaction/warehouse/update/' + res['id']]);
            } else {
              this.router.navigate(['/transaction/warehouse/']);
            }
          });
        } else {
          this.mainService.create(data).subscribe(res => {
            this.notifySer.notify('success', 'Lưu thành công.');
            this.submitted = false;
            this.isLoadingResults = false;
            if (status === 9) {
              this.model = res;
              this.router.navigate(['/transaction/warehouse/update/' + res['id']]);
            } else {
              this.router.navigate(['/transaction/warehouse/']);
            }

          });
        }
      } else {
        // Form errors
        const controls = Object.entries(this.form.controls);
        const hasError = this.checkToShowControlError(controls);
        this.submitted = false;
        this.isLoadingResults = false;
      }

    }).catch(() => {
      console.log('rejected');
      this.submitted = false;
      this.isLoadingResults = false;
    });
  }

  checkToShowControlError(controls) {
    const count = controls.length;
    let hasError = false;
    for (let i = 0; i < count; i++) {
      const fieldName = controls[i][0];
      const fieldControl = controls[i][1];
      if (fieldControl['errors'] !== null) {
        this.notifySer.notify('error', 'Lỗi thông tin trường ' + this.fieldLabels[fieldName]);
        hasError = true;
        break;
      }
    }

    return hasError;
  }

  /**
   * Event choice search
   * @param product
   */
  onSelectedProduct(product) {
    if (product == -1) {
      return;
    }

    if (product.product_type !== undefined) {
      this.handleAddProductToList(product.id);
    } else {
      sessionStorage.setItem('medicine', JSON.stringify(product));
      // this.openProductMedicineDialog('Add', {});
      this.openWarehouseProductMedicineDialog('Add', {});
      this.selectProduct.patchValue(null);
    }


    /**
     *  Xư ly luu cũ
     */
    // if (this.form.controls['status'].value === '10') {
    //   this.notifySer.notify('warning', 'Đơn nhập hàng đã hoàn thành.');
    //   this.selectProduct.patchValue(null);
    // } else {
    //   if (product.product_type !== undefined) {
    //     this.handleAddProductToList(product.id);
    //   } else {
    //     sessionStorage.setItem('medicine', JSON.stringify(product));
    //     // this.openProductMedicineDialog('Add', {});
    //     this.openWarehouseProductMedicineDialog('Add', {});
    //     this.selectProduct.patchValue(null);
    //   }
    // }
  }

  /**
   * Handle add product to list
   * @param product_id
   */
  handleAddProductToList(product_id) {

    if (this.productDataSource.data.length >= 200) {
      this.notifySer.notify('warning', 'Đơn nhập tối đa 100 sản phẩm!');
      return;
    }

    let productExits = 0;
    // tslint:disable-next-line:no-shadowed-variable
    this.data.forEach((element, index) => {
      if (element.product_id === product_id) {
        productExits = 1;
        if (element['product_parcels'].length > 0) {
          element['product_parcels'][0]['quantity'] = element['product_parcels'][0]['quantity'] + 1;
        }
        element.quantity = element.quantity + 1;
        this.recalculateItem(index);
      }
    });
    if (productExits === 0) {
      this.productSer.getDetail(product_id, 'productUnits').subscribe(res => {
        const warehouseProduct = new WarehouseProduct();
        warehouseProduct.product_id = res['id'];
        warehouseProduct.product = res;
        warehouseProduct.quantity = 1; // de nhap so lo
        warehouseProduct.price = (res['original_price'] !== null) ? numeral(res['original_price']).format('0,0') : 0;
        warehouseProduct.discount = 0;
        warehouseProduct.discount_type = 'price';
        warehouseProduct.amount = (res['original_price'] !== null) ? res['original_price'] : 0;
        // warehouseProduct.amount = 0; // (res['original_price'] !== null) ? res['original_price'] : 0;
        warehouseProduct.productUnits = res['productUnits'];
        warehouseProduct.product_parcels = [];
        warehouseProduct.vat = 0;
        warehouseProduct.vat_type = 'price';

        if (res['productUnits'].length > 0) {
          res['productUnits'].sort((a, b) => (a.value > b.value) ? 1 : -1);
          warehouseProduct.product_unit_id = res['productUnits'][0]['id'];
          warehouseProduct.price = res['productUnits'][0]['original_price'];
        }
        this.data.unshift(warehouseProduct);

        // const newData = this.data.concat([warehouseProduct]);
        // this.data = newData;
        this.data.forEach(element => {
          element.price = numeral(element.price).format('0,0');
        });
        this.productDataSource = new MatTableDataSource<WarehouseProduct>(this.data);
        this.recalculateWarehouse();
        this.selectProduct.patchValue(null);
      });
    } else {
      this.productDataSource = new MatTableDataSource<WarehouseProduct>(this.data);
      this.recalculateWarehouse();
      this.selectProduct.patchValue(null);
    }
  }

  recalculateItem(i) {
    if (this.data[i] !== undefined) {
      const price = numeral(this.data[i]['price']).value();
      if (this.data[i]['discount_type'] === 'price') {
        this.data[i]['amount'] = Math.round((price * this.data[i]['quantity']) - this.data[i]['discount']);
      } else {
        this.data[i]['amount'] =
          Math.round((price - (price * this.data[i]['discount']) / 100) * this.data[i]['quantity']);
      }

      // tính thue suat
      const vat = numeral(this.data[i]['vat']).value();
      if (vat !== 0) {
        if (this.data[i]['vat_type'] === 'price') {
          this.data[i]['amount'] = this.data[i]['amount'] + vat;
        } else {
          this.data[i]['amount'] = this.data[i]['amount'] + (this.data[i]['amount'] * vat) / 100;
        }
      }

      this.recalculateWarehouse();
    }
  }

  recalculateWarehouse() {
    let quantity = 0, price = 0, remainAmount = 0, totalAmount = 0;
    const paidAmount = numeral(this.form.controls['paid_amount'].value).value();
    const discount = this.form.controls['discount_amount'].value;
    const discount_type = this.form.controls['discount_type'].value;

    this.data.forEach(item => {
      const item_quantity = numeral(item['quantity']).value();
      const item_price = numeral(item['price']).value();
      const item_discount = Number(item['discount']);
      const vat = numeral(item['vat']).value();
      const vat_type = item['vat_type'];
      let money = 0;
      quantity = Number(quantity) + item_quantity;
      if (item['discount_type'] === 'price') {
        money = ((item_quantity * item_price) - item_discount);
        // tinh thue suat
        if (vat !== 0) {
          if (vat_type === 'price') {
            money = money + vat;
          } else {
            money = money + (money * vat) / 100;
          }
        }
        price = Number(price) + money;
      } else {
        money = item_quantity * item_price * (1 - (item_discount / 100));
        // tinh thue suat
        if (vat !== 0) {
          if (vat_type === 'price') {
            money = money + vat;
          } else {
            money = money + (money * vat) / 100;
          }
        }
        price = Number(price) + money;
      }

    });

    // Tinh vao cong no
    if (discount_type === 'price') {
      totalAmount = Number(price) - Number(discount);
      remainAmount = Number(paidAmount) - totalAmount;
    } else {
      totalAmount = Math.round(Number(price) - Number(price) * Number(discount) / 100);
      remainAmount = Math.round(Number(paidAmount) - totalAmount);
    }

    if (this.optionStore_transaction_expenses.value === 'yes') {
      if (this.expensesTransactions !== null && this.expensesTransactions !== undefined) {
        this.expensesTransaction = 0;
        this.expensesTransactions.forEach(item => {
          if (item.auto === 1) {
            item.value = numeral(item.value).value();
            if (item.type === 'price') {
              item.price = item.value;
            } else {
              item.price = totalAmount * (item.value / 100);
            }
            this.expensesTransaction += item.price;
          }
        });
        remainAmount = remainAmount - this.expensesTransaction; // tinh vao cong no
      }
    }
    // debugger;
    // console.log(remainAmount);

    this.form.patchValue({
      quantity: numeral(quantity).format('0,0'),
      total_price: numeral(price).format('0,0'),
      remain_amount: numeral(remainAmount).format('0,0'),
      total_amount: numeral(totalAmount).format('0,0'),
      expenses_price: numeral(this.expensesTransaction).format('0,0')
    });
  }

  removeProduct(i) {
    const newData = this.data;
    newData.splice(i, 1);

    this.data = newData;

    this.recalculateWarehouse();
    this.productDataSource = new MatTableDataSource<WarehouseProduct>(this.data);
  }

  /**
   * - Nhập hàng đơn vị giá đơn vị  = giá vôn đơn vị cơ bản * số lượng quy đổi
   * @param index
   * @param select
   */
  onUnitChange(index, select) {
    if (this.data[index] !== undefined) {
      const unit = this.data[index]['productUnits'].find(element => element['id'] === select.value);
      const unitBase = this.data[index]['productUnits'].find(element => element['is_base'] === 1);
      this.data[index]['price'] = unitBase['original_price'] * unit['value'];
      // this.data[index]['price'] = (unit['original_price'] !== 0) ? unit['original_price'] : unit['sell_price']; //unit['original_price'];
      this.data[index]['amount'] = (this.data[index]['price'] - this.data[index]['discount']) * this.data[index]['quantity'];
      this.recalculateWarehouse();
    }
  }

  openParcelFormDialog(index) {
    const dialogRef = this.dialog.open(WarehouseParcelFormDialogComponent, {
      width: '35%',
      minHeight: '80%',
      data: {
        parcels: this.parcels,
        product_id: this.data[index]['product_id']
      }
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
        this.recalculateItem(index);
        this.recalculateWarehouse();
      }
    });
  }

  /**
   * Danh sach lo hang hoa san pham
   * @param index
   */
  openParcelListDialog(index) {

    const dialogRef = this.dialog.open(WarehouseParcelListDialogComponent, {
      width: '600px',
      minHeight: '80%',
      data: {parcels: this.data[index]['product_parcels']}
    });
    dialogRef.afterClosed().subscribe(result => {
      // console.log(result);
      this.data[index]['product_parcels'].forEach(element => {
        if (element['expiration_date'] !== null && typeof element['expiration_date'] === 'object') {
          const effDate = new Date(element['expiration_date'].getTime() + (420 * 60 * 1000));
          element['expiration_date'] = effDate.toISOString().split('T')[0];
        }
      });

      if (result !== null && result !== undefined) {
        this.data[index]['product_parcels'] = result;
        let quantity = 0;
        this.data[index]['product_parcels'].forEach(parcel => {
          parcel['quantity'] = numeral(parcel['quantity']).value();
          quantity = quantity + parcel['quantity'];
        });
        this.data[index]['quantity'] = quantity;
        this.data[index]['amount'] = (this.data[index]['price'] - this.data[index]['discount']) * this.data[index]['quantity'];

        this.recalculateWarehouse();
      }
      // console.log(result);
    });
  }

  changeQuantity(index, value) {
    this.openParcelFormDialog(index);
  }

  onParcelSelectedChange(index, value) {
    let quantity = 0;
    this.data[index]['product_parcels'].forEach(parcel => {
      quantity = quantity + parcel['quantity'];
    });
    this.data[index]['quantity'] = quantity;
    this.data[index]['amount'] = (this.data[index]['price'] - this.data[index]['discount']) * this.data[index]['quantity'];
    this.recalculateItem(index);
    this.recalculateWarehouse();
  }

  openDiscountDialogWarehouse() {
    const dialogRef = this.dialog.open(WarehouseDiscountDialogComponent, {
      width: '30%',
      minHeight: '80%',
      data: {
        discount_amount: this.form.controls['discount_amount'].value,
        discount_type: this.form.controls['discount_type'].value,
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result !== null && result !== undefined) {
        this.form.patchValue({
          discount_amount: result.number,
          discount_type: result.type,
        });
        this.recalculateWarehouse();
      }
    });
  }

  openDiscountDialogWarehouseProduct(i) {
    if (this.data[i] !== undefined) {

      const dialogRef = this.dialog.open(WarehouseDiscountDialogComponent, {
        width: '30%',
        minHeight: '80%',
        data: {
          discount_amount: this.data[i]['discount'],
          discount_type: this.data[i]['discount_type'],
        }
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result !== null) {
          this.data[i]['discount'] = result.number;
          this.data[i]['discount_type'] = result.type;
          this.recalculateItem(i);
        }
      });
    }
  }

  openPriceDialog(i) {
    if (this.data[i] !== undefined) {

      const dialogRef = this.dialog.open(WarehouseFormPriceDialogComponent, {
        width: '30%',
        minHeight: '65%',
        data: {
          price: this.data[i]['price'],
          discount: this.data[i]['discount'],
          discount_type: this.data[i]['discount_type'],
          vat: this.data[i]['vat'],
          vat_type: this.data[i]['vat_type'],
        }
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result !== null) {
          this.data[i]['price'] = numeral(result.price).value();
          this.data[i]['discount'] = numeral(result.discount).value();
          this.data[i]['discount_type'] = result.discount_type;
          this.data[i]['vat'] = numeral(result.vat).value();
          this.data[i]['vat_type'] = result.vat_type;
          this.recalculateItem(i);
        }
      });
    }
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

  /**
   * In don nhap hang
   * @param model
   */
  buttonPrintWarehouse(model) {
    this.printWarehouse(model.id);
  }

  /**
   * Main handel print
   * @param id mainService
   */
  printWarehouse(id: string) {
    let _font_size = '11px';
    let _padding = '3px;';
    this.optionStoreService.getValue('print_type').subscribe(res => {
      if (res.value === 'K58') {
        _font_size = '11px;';
        _padding = '3px;';
      } else { // A4
        _font_size = '13px;';
        _padding = '6px;';
      }
    });

    this.mainService.getDataWarehouseToPrint(id).subscribe(res => {
      let printContent = '<title>' + res.no + '</title>';
      printContent += '<style> ' +
        'p,table,div {' +
        'font-family: Arial, sans-serif;' +
        'font-size: ' + _font_size +
        'margin: 4px;' +
        '}' +
        'table {' +
        'border-collapse: collapse;' +
        'width: 100%;' +
        '}' +
        'td, th {' +
        'border: 1px solid #616161;' +
        'text-align: left;' +
        'padding: ' + _padding +
        '}</style>' +
        '<section style="padding: 10px;font-size: ' + _font_size + '">' +
        '<p style="text-align:left; margin: 10px; font-size: ' + _font_size + '">' + res?.store?.name + '</p>' +
        '<p style="text-align:center; font-weight:600;margin: 10px;">HÓA ĐƠN NHẬP HÀNG</p>' +
        '<p style="text-align:center; font-weight:600;margin: 10px;">Mã phiếu nhập: ' + res?.no + '</p> ' +
        '<p style="text-align:left; margin: 8px; font-size: ' + _font_size + '">Ngày nhập: ' + res?.date + ' </p>' +
        '<p style="text-align:left; margin: 8px; font-size: ' + _font_size + '">Người nhập: ' + res?.created_by + ' </p>' +
        '<table style="font-size: ' + _font_size + '">' +
        '<tr>' +
        '<td style="font-weight: 600;"> Nhà cung cấp </td>' +
        '<td>' + res?.supplier?.name + '</td>' +
        '<td style="font-weight: 600;"> Tiền hàng </td>' +
        '<td style="text-align:right;">' + res?.total_price + '</td>' +
        '</tr>' +
        '<tr>' +
        '<td style="font-weight: 600;">Trạng thái </td>' +
        '<td>' + res?.status + '</td>' +
        '<td style="font-weight: 600;">Chiết khấu </td>' +
        '<td style="text-align:right;">' + res?.discount_amount + '</td>' +
        '</tr>';
      if (res?.expenses_price > 0) {
        printContent += '<tr>' +
          '<td style="font-weight: 600;" colspan="2" >Chi phí nhập hàng</td>' +
          '<td colspan="2">' + res?.warehouseExpensess + '</td>' +
          '</tr>';
      }
      printContent += '<tr>' +
        '<td style="font-weight: 600;" >Tính vào công nợ </td>' +
        '<td style="text-align:right;">' + res?.remain_amount + '</td>' +
        '<td style="font-weight: 600;">Tiền trả NCC </td>' +
        '<td style="text-align:right;">' + res?.paid_amount + '</td>' +
        '</tr>' +
        '<tr>' +
        '<td style="font-weight: 600;" >Ghi chú</td>' +
        '<td colspan="3">' + res?.note + '</td>' +
        '</tr>' +
        '</table>';

      printContent += '<p style="text-align:left;margin: 10px;">Chi tiết nhập hàng :</p>';

      const detail = res.warehoureItems;
      printContent += '<table style="font-size: ' + _font_size + '">';
      printContent += '<tr style="text-align:center;">';
      printContent += '<th>' + 'Mã hàng' + '</th>';
      printContent += '<th>' + 'Tên hàng' + '</th>';
      printContent += '<th>' + 'Đơn giá' + '</th>';
      printContent += '<th>' + 'Chiết khấu' + '</th>';
      printContent += '<th>' + 'Thành tiền' + '</th>';
      printContent += '</tr>';

      // tslint:disable-next-line:no-shadowed-variable
      detail.forEach(element => {
        printContent += '<tr style="font-size: ' + _font_size + '">';
        printContent += '<td style="text-align:left;">' + element?.product?.product_no + '</td>';
        printContent += '<td style="text-align:left;">' + element?.product?.product_name + '<br>' +
          'Đơn vị : ' + element?.product_unit?.name + '<br>' +
          'SL : ' + element.quantity + '<br>';
        const parcels = element.parcels;

        if (parcels !== null && parcels !== undefined) {
          parcels.forEach(parcel => {
            printContent += 'Lô: ' + parcel['parcel_no'] + '-';
            printContent += parcel['expiration_date'] + '-SL:';
            printContent += parcel['quantity'] + '<br>';
          });
        }

        printContent += '</td>';
        printContent += '<td style="text-align:right;">' + element.price + '</td>';
        printContent += '<td style="text-align:right;">' + element.discount + '</td>';
        printContent += '<td style="text-align:right;">' + element.amount + '</td>';
        printContent += '</tr>';
      });
      printContent += '</table>';
      // printContent += '<p style="text-align:left; font-size: 12px;font-style: italic;" >Hổ trợ : 0972 574 506</p>';
      printContent += '<p style="text-align:center;font-style: italic;" >---</p>';
      printContent += '</section>';

      const WindowPrt = window.open('', '', 'left=0,top=0,width=900,height=900,toolbar=0,scrollbars=0,status=0');
      WindowPrt.document.write(printContent);
      WindowPrt.document.close();
      WindowPrt.focus();
      WindowPrt.print();
      // WindowPrt.close();
    });
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

  openSearchSupplierDialog() {
    const dialogRef = this.dialog.open(SearchSupplierDialogComponent, {
      width: '80%',
      height: '750px',
      // minWidth: '750px',
      // minHeight: '70%',
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result['event'] === 'Choose') {
        this.form.patchValue({'supplier': result['supplier']});
        //this.handleAddProductToList(result['product_id']);
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

  openWarehouseProductMedicineDialog(action, obj) {
    obj.action = action;
    obj.title = 'Thêm thuốc nhập hàng';
    obj.product_id = null;
    obj.copy_product_id = null;
    const dialogRef = this.dialog.open(ProductMedicineDialogComponent, {
      data: obj,
      width: '60%',
      minWidth: '750px',
      minHeight: '80%',
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log(result);
      if (result['event'] === 'Save') {


        /*this.productSer.getDetail(result['data']['id'], 'productUnits').subscribe(res => {
          // console.log(res);
          const warehouseProduct = new WarehouseProduct();
          warehouseProduct.product_id = res['id'];
          warehouseProduct.product = res;
          warehouseProduct.quantity = 0; // de nhap so lo
          warehouseProduct.price = (res['original_price'] !== null) ? res['original_price'] : 0;
          warehouseProduct.discount = 0;
          warehouseProduct.discount_type = 'price';
          warehouseProduct.amount = 0; // (res['original_price'] !== null) ? res['original_price'] : 0;
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

          result = result['parcel'];
          const index = this.data.length - 1;
          this.parcels.push(result);
          this.data[index]['product_parcels'].push(result);
          let quantity = 0;
          this.data[index]['product_parcels'].forEach(parcel => {
            quantity = quantity + parcel['quantity'];
          });
          this.data[index]['quantity'] = quantity;
          this.data[index]['amount'] = (this.data[index]['price'] - this.data[index]['discount']) * this.data[index]['quantity'];
          this.recalculateWarehouse();

        });*/


        this.handleAddProductToList(result['data']['id']);
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

  /**
   * Tra du tien tong tien hoa don
   */
  paidAmount() {
    const data = this.form.getRawValue();
    const paid_amount = numeral(data['total_amount']).value() + numeral(data['expenses_price']).value();
    this.form.patchValue({
      paid_amount: numeral(paid_amount).format('0,0'),
    });
    this.recalculateWarehouse();
  }

  checkPermissionDisable(permission) {
    const indexPermission = this.allPermission.indexOf(permission);
    if (indexPermission !== -1) {
      return false;
    }
    return true;
  }

  /**
   * Format input number
   */
  inputformatNumber(event: any) {
    event.target.value = numeral(event.target.value).format('0,0');
  }

  quantityChange(event: any, index) {
    event.target.value = numeral(event.target.value).format('0,0');
    if (this.data[index]['product_parcels'].length === 1) {
      this.data[index]['product_parcels'][0]['quantity'] = numeral(event.target.value).value();
    }
    this.data[index]['quantity'] = numeral(event.target.value).value();
    this.recalculateItem(index);
    // this.recalculateWarehouse();
  }

  priceChange(event: any, index) {
    event.target.value = numeral(event.target.value).format('0,0');
    this.recalculateItem(index);
  }

  openWarehouseExpenses() {
    // console.log(this.form.controls['status'].value);
    const dialogRef = this.dialog.open(WarehouseExpensesComponent, {
      width: '50%',
      minHeight: '80%',
      data: {
        expenses: this.expensesTransactions,
        status: this.form.controls['status'].value,
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      // console.log(result);
      if (result !== null && result !== undefined) {
        this.expensesTransactions = result;
        this.recalculateWarehouse();
      }
    });
  }

  // Quet ma vach
  onkeydownBarCode($event) {
    if (this.form.controls['status'].value === '10') {
      this.notifySer.notify('warning', 'Đơn nhập hàng đã hoàn thành.');
      $event.target.value = '';
    } else {
      const barcode = $event.target.value;
      // console.log($event.target.value);
      this.productSer.addproductBarcode(barcode).subscribe(res => {
        // console.log(res);
        if (res['errors']) {
          this.notifySer.notify('warning', res['errors']);
        }
        if (res !== null) {
          this.handleAddProductToList(res.id);
        }
      });
      $event.target.value = '';
    }
  }

  openUnitCreateDialog(element: any) {
    const ref = this.dialog.open(WarehouseUnitCreateDialogComponent, {
      width: '35%',
      minHeight: '200px',
      data: element
    });

    ref.afterClosed().subscribe(res => {
      if (res) {
        /* Handle call api here */
        console.log(res);
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
