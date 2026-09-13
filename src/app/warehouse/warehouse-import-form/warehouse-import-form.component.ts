import { Component, ElementRef, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
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
import { catchError, map, startWith, switchMap } from 'rxjs/operators';
import { of } from 'rxjs/internal/observable/of';
import { SupplierService } from '../../supplier/supplier.service';
import { WarehouseService } from '../warehouse.service';
import { Product, ProductFilter } from '../../product/product.model';
import { ProductService } from '../../product/product.service';
import { WarehouseParcelFormDialogComponent } from '../warehouse-parcel-form-dialog/warehouse-parcel-form-dialog.component';
import { WarehouseDiscountDialogComponent } from '../warehouse-discount-dialog/warehouse-discount-dialog.component';
import { SupplierFormDialogComponent } from '../../supplier/supplier-form-dialog/supplier-form-dialog.component';
import { ProductMedicineDialogComponent } from '../../product/product-medicine-dialog/product-medicine-dialog.component';
// tslint:disable-next-line:max-line-length
import {
  ProductMerchandiseFormDialogComponent,
} from '../../product/product-merchandise-form-dialog/product-merchandise-form-dialog.component';
import { UserService } from '../../user/user.service';
import * as numeral from 'numeral';
import { MedicineService } from '../../medicine/medicine.service';
import { Medicine } from '../../medicine/medicine.model';
import { ExpensesTransaction, ExpensesTransactionFilter } from '../../expenses-transaction/expenses-transaction.model';
import { ExpensesTransactionService } from '../../expenses-transaction/expenses-transaction.service';
import { OptionStoreService } from '../../common/option-store.service';
import { OptionStore } from '../../common/option-store.model';
import { WarehouseExpensesComponent } from '../warehouse-expenses/warehouse-expenses.component';
import { WarehouseParcelListDialogComponent } from '../warehouse-parcel-list-dialog/warehouse-parcel-list-dialog.component';
import { WarehouseFormPriceDialogComponent } from '../warehouse-form-price-dialog/warehouse-form-price-dialog.component';
import { SearchProductDialogComponent } from '../../common/search-product-dialog/search-product-dialog.component';
import * as moment from 'moment';
import { SearchSupplierDialogComponent } from '../../common/search-supplier-dialog/search-supplier-dialog.component';
import { WarehouseUnitCreateDialogComponent } from '../warehouse-unit-create-dialog/warehouse-unit-create-dialog.component';
import { WarehouseFormAmountComponent } from '../warehouse-form-amount/warehouse-form-amount.component';
import { MatSelect, MatSelectChange } from '@angular/material/select';
import { MatSelectionList, MatSelectionListChange } from '@angular/material/list';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { MatAutocomplete, MatAutocompleteSelectedEvent, MatAutocompleteTrigger } from '@angular/material/autocomplete';
import {
  ParcelData,
  WarehouseParcelFormDialogNewComponent,
} from '../warehouse-parcel-form-dialog-new/warehouse-parcel-form-dialog-new.component';
import {
  WarehouseParcelFormDialogAvailableComponent,
} from '../warehouse-parcel-form-dialog-available/warehouse-parcel-form-dialog-available.component';
import {
  WarehouseParcelFormDialogSelectComponent,
} from '../warehouse-parcel-form-dialog-select/warehouse-parcel-form-dialog-select.component';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MAT_MOMENT_DATE_ADAPTER_OPTIONS, MomentDateAdapter } from '@angular/material-moment-adapter';
import { MY_FORMATS } from '../../sale/sale-main/sale-main.component';
import { DatePipe } from '@angular/common';
import { LocalStorageService } from '../localStorageService';
import { WarehouseConfirmLoadDataFormComponent } from '../warehouse-confirm-load-data-form/warehouse-confirm-load-data-form.component';
import { IResponse } from '../../common/response.model';


///////////// coding fake data
// Base interface cho Parcel mới
export interface NewParcel {
  parcel_no: string;
  expiration_date: Date;
  quantity: number;
  unit_cost?: number | null;
}
/////////

const items: object[] = [];
for (let i = 1; i <= 10; i++) {
  const item: object  = {
    parcel_no: `Item-${i}`,              // String identifier
    expiration_date: new Date(Date.now() + i * 86400000), // Expiration date offset by days
    quantity_of_stock: Math.floor(Math.random() * 100) + 1,
    quantity: 1
  };
  items.push(item);
}

const parcelsdataFake: object[] = [];
const randomCount = Math.floor(Math.random() * 10); // Random number of items to select

for (let j = 0; j < randomCount; j++) {
  const randomIndex = Math.floor(Math.random() * items.length); // Select a random index
  const baseItem = items[randomIndex];
  parcelsdataFake.push(baseItem);
}
// end face data

@Component({
  selector: 'app-warehouse-import-form',
  templateUrl: './warehouse-import-form.component.html',
  styleUrls: ['./warehouse-import-form.component.css'],
  encapsulation: ViewEncapsulation.None,
  // use like sale-main component
  // (but I think the good way is adding it into the module instead of component)
  // maybe need to be refactored later
  providers: [
    DatePipe,
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS],
    },
    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
  ]
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
    private notifyService: NotifierService,
    private localStorageService: LocalStorageService
  ) {
    super();
  }

  @ViewChild('productList') productList: MatSelectionList;
  @ViewChild(MatTable, {static: true}) table: MatTable<any>;
  @ViewChild('selectColumn') selectColumn;
  @ViewChild('chooseProduct') matAutocomplete: MatAutocomplete;
  @ViewChild(MatAutocompleteTrigger) autocompleteTrigger: MatAutocompleteTrigger;

  selectedProducts: Product[] = [];
  selectProduct = new FormControl();
  selectQuantity = new FormControl();
  selectUnit = new FormControl();

  apiFilter: WarehouseProductFilter;
  updateModelId = null;
  model: Warehouse = null;
  branchList: any;
  allPermission: any;
  isAdminStore: boolean;
  expensesTransaction: number;
  expensesTransactions: ExpensesTransaction[] = [];
  optionStore_transaction_expenses: OptionStore;
  allowPastExpiration = false;
  tempProductId = null;
  barcode: string;

  searchMode = localStorage.getItem('importForm-searchMode') ? JSON.parse(localStorage.getItem('importForm-searchMode')) : false;
  submitted = false;
  allow_amount_adjust = localStorage.getItem('importForm-allowAmountAdjust') ? JSON.parse(localStorage.getItem('importForm-allowAmountAdjust')) : false;
  allow_multiple_select = localStorage.getItem('importForm-allowMultipleSelect') ? JSON.parse(localStorage.getItem('importForm-allowMultipleSelect')) : false;
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
    'inventory_quantity': 'Tồn kho',
    'quantity': 'Tổng SL',
    'price': 'Đơn giá',
    'sell_price': 'Giá bán',
    // 'discount': 'Chiết khấu',//'Giảm giá',
    'amount': 'Thành tiền',
    'actions': 'Hành động',
    'add_row': 'Thêm dòng'
  };
  showFilters = localStorage.getItem('importForm-showFilters') ? JSON.parse(localStorage.getItem('importForm-showFilters')) : false;
  tempDataForQuickFilter = [];

  filterColumns: string[] = [];
  filterValues: { [key: string]: string } = {};
  displayedColumns: string[] = localStorage.getItem('importForm-displayedColumns') ? JSON.parse(localStorage.getItem('importForm-displayedColumns')) : [
    // 'image',
    '#',
    'product_no',
    'product_name',
    // 'product_parcel',
    'product_unit_id',
    'quantity',
    // 'inventory_quantity',
    'price',
    // 'sell_price',
    // 'discount',
    'amount',
    'actions',
    // 'add_row'
  ];
  columnsToDisplay: string[] = [
    'image',
    '#',
    'product_no',
    'product_name',
    // 'product_parcel',
    'product_unit_id',
    'inventory_quantity',
    'quantity',
    'price',
    'sell_price',
    // 'discount',
    'amount',
    'actions',
    'add_row'
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
  selectUnits = [];
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

  @ViewChild('inputField') inputField: ElementRef;
  @ViewChild('quantityInput') quantityInputRef: ElementRef;
  @ViewChild('unitInput') unitInputRef: MatSelect;

  separatorKeysCodes: number[] = [ENTER, COMMA];
  parcelItemControls: Map<number, FormControl> = new Map();
  parcelFilteredItems: Map<number, Observable<object[]>> = new Map();
  available_product_parcels: Map<string, object[]> = new Map();
  @ViewChild('parcelInput') parcelInput!: ElementRef<HTMLInputElement>;
  @ViewChild('parcelAutocomplete') matAutocompleteParcel!: MatAutocomplete;
  tmp_new_parcel_data = {
    parcel_no: '',
    expiration_date: null,
    quantity: null,
  };
  shownNotes: Set<number> = new Set();  // Will store user IDs or indices of visible notes
  payFullDefault: boolean = false;

  WAREHOUSEPRODUCTKEY = 'warehouseProduct';
  WAREHOUSEFORMKEY = 'warehouseForm';

  // create input for each row
  getItemControl(product_index: number) {
    if (!this.parcelItemControls.has(product_index)) {
      this.parcelItemControls.set(product_index, new FormControl('', Validators.required));
      this.setupFilteredItems(product_index);
    }
    return this.parcelItemControls.get(product_index)!;
  }

  // when click into a option of autocomplete chip
  selected(event: MatAutocompleteSelectedEvent, id: number) {
    if (event.option.value == null) {
      return;
    }
    const parcel = event.option.value;
    const product_no = this.data[id].product['product_no'];
    this.openAddAvailableParcelDialog(id, parcel, product_no);
    this.getItemControl(id)?.setValue(null);
  }

  // set up fields for typing and filter
  private setupFilteredItems(product_index: number) {
    const control = this.parcelItemControls.get(product_index)!;
    const filterItems = control.valueChanges.pipe(
      startWith(''),
      switchMap((searchText: string|null) => {
          if (searchText === null || typeof searchText !== 'string') {
            return this.getAvailableItems(product_index);
          }
          return this._filter(product_index, searchText);
        }
      ));
    this.parcelFilteredItems.set(product_index, filterItems);
  }

  // get available parcel is not added to product_parcels
  private getAvailableItems(product_index: number): Observable<any[]> {
    const product = this.data[product_index];
    const product_id = product.product_id.toString();
    const existingParcelNos = new Set(product.product_parcels.map(item => item['parcel_no']));

    return this.productSer.getParcelForImport(product_id).pipe(
      map(res => {

        if (res) {
          // remove unnecessary field
          res = (res as object[]).map(item => ({
            parcel_no: item['parcel_no'],
            expiration_date: item['expiration_date'],
            quantity_of_stock: item['quantity_of_stock']
          }));
          this.available_product_parcels.set(product_id, res as object[]);
          const availableParcelNos = this.available_product_parcels.get(product_id)?.map(item => ({
            parcel_no: item['parcel_no'],
            expiration_date: item['expiration_date'],
            quantity_of_stock: item['quantity_of_stock']
          })) || [];

          return availableParcelNos.filter(item => !existingParcelNos.has(item['parcel_no']));
        }
        return [];
      })
    );
  }

  // handle the filter function
  private _filter(product_index: number, searchText: string): Observable<any[]> {
    const filterValue = searchText.toLowerCase();
    return this.getAvailableItems(product_index).pipe(
      map(items => items.filter(item =>
        item['parcel_no'].toLowerCase().includes(filterValue)
      ))
    );
  }

  // get the list of filter items match with the typing
  getFilterItems(id: number) {
    return this.parcelFilteredItems.get(id)!;
  }

  // handle when remove chip from list
  remove(id: number, item: object): void {
    // Find the product in the data source
    const product = this.data[id];

    if (!product) { return; }
    // Find the index of the item to remove
    const indexItem = product.product_parcels.findIndex(
      parcel => parcel['parcel_no'] === item['parcel_no']
    );
    const parcel = product.product_parcels[indexItem];
    // add it to
    const currentFilteredItems = this.parcelFilteredItems.get(id);
    const perhapAvailableParcel = this.isAvailableParcel(product.product_parcels[indexItem], id);
    if (perhapAvailableParcel) {
      const availableParcel = this.data[id].product_parcels.find(p => p['parcel_no'] === parcel['parcel_no']);
      // const newAvailableParcel  = {...perhapAvailableParcel, ...availableParcel['quantity']};
      const { quantity: _, ...rest } = perhapAvailableParcel as any;
      const newAvailableParcel = {
        ...rest,
        quantity: availableParcel['quantity']
      };
      item = newAvailableParcel;
    }
    if (currentFilteredItems && perhapAvailableParcel) {
      // Create new observable with the removed item added back
      const updatedFilteredItems = currentFilteredItems.pipe(
        map(items => [...items, item])  // Add the item back to the array
      );

      // Update the map with new observable
      this.parcelFilteredItems.set(id, updatedFilteredItems);
    }

    // Remove the item if found (note: changed from > 0 to >= 0)
    if (indexItem >= 0) {
      product.product_parcels.splice(indexItem, 1);
      // Trigger change detection by creating a new reference
    }
    const allQuantities = product.product_parcels.map(item => Number(item['quantity']));
    product.quantity = allQuantities.reduce((acc, curr) => acc + curr, 0);
    const totalParcelQty = product.product_parcels.reduce((sum, p) => sum + Number(p['quantity']), 0);
    product['parcel_qty_mismatch'] = Math.abs(totalParcelQty - Number(product['line_qty'] ?? product.quantity)) > 0.001;
    this.recalculateItem(id);
    this.productDataSource.data = [...this.data];
    this.localStorageService.setItem(this.WAREHOUSEPRODUCTKEY, this.data)
  }

  // because the chip list have 2 type of parcel (new and old) -> need to distinguish them to display the corresponding dialog
  isAvailableParcel(parcel: object, product_index: number): object {
    const product_id = this.data[product_index].product_id.toString();
    const availableParcels = this.available_product_parcels.get(product_id);
    return availableParcels?.find(item => item['parcel_no'] == parcel['parcel_no']);
  }

  // handle open when click to "them lo moi" or chip button -> new parcel
  openAddNewParcelDialog(product_index: number, parcel: NewParcel = null) {
    // validate if needed
    if (parcel) {
      // Validate update case
      if (!parcel.parcel_no || !parcel.expiration_date) {
        console.error('Invalid parcel data for update');
        return;
      }
    }
    // end validate
    const product_id = this.data[product_index].product_id.toString();
    const product_name = this.data[product_index].product['product_name'];
    const product_no = this.data[product_index].product['product_no'];
    const product_quantity = this.data[product_index].quantity;
    const rawLinePrice = numeral(this.data[product_index]['price']).value() || null;
    const selectedUnit = this.data[product_index].productUnits?.find((u: any) => u['id'] === this.data[product_index]['product_unit_id']);
    const unitValue: number = selectedUnit?.['value'] ?? 1;
    // Dialog displays unit_cost per selected unit; DB stores per base unit (÷ unitValue on save)
    const dialogData: ParcelData = parcel ?
      {...parcel, unit_cost: parcel.unit_cost != null ? parcel.unit_cost * unitValue : null, product_id: product_id, product_name: product_name, product_no: product_no, allowPastExpiration: this.allowPastExpiration}
      : {...this.tmp_new_parcel_data, quantity: product_quantity, product_id: product_id, product_name: product_name, product_no: product_no, unit_cost: rawLinePrice, allowPastExpiration: this.allowPastExpiration};
    const parcelDialogRef  = this.dialog.open(WarehouseParcelFormDialogNewComponent, {
      width: '30%',
      data: dialogData,
    });

      parcelDialogRef.afterClosed().subscribe(result => {
        if (!result) {return; }

        const product = this.data[product_index];
        if (!product) { return; }

        const itemRow: object = {
          parcel_no: result.parcel_no,
          expiration_date: result.expiration_date,
          quantity: result.quantity,
          unit_cost: result.unit_cost != null ? result.unit_cost / unitValue : null,
        };
        // there are 2 type of case using this dialog:
        //  - create new one (form start with null)
        //  - update new one (form start with value)

        // handle update case
        if (parcel) {
          const index = product.product_parcels.findIndex(p => p['parcel_no'] === parcel.parcel_no);
          if (index >= 0) {
            product.product_parcels[index] = itemRow;
          } else {
            console.error('Parcel not found for update');
            return;
          }
        } else {
          // handle convert day with momentAdapter to fix the typing date bug
          const new_date = result.expiration_date._d;
          const adjusted_date = new Date(new_date.getTime() + (7 * 60 * 60 * 1000)); // Add 7 hours
          itemRow['expiration_date'] = adjusted_date.toISOString().split('T')[0];

          // this is the deprecated code
          // const effDate = new Date(result.expiration_date.getTime() + (420 * 60 * 1000));
          // itemRow['expiration_date'] = effDate.toISOString().split('T')[0];
          product.product_parcels.push(itemRow);
        }

        if (result.unit_cost != null && result.unit_cost !== numeral(product['price']).value()) {
          product['price'] = result.unit_cost;
        }

        // review later -> reviewed (17/1/2025)
        const allQuantities = product.product_parcels.map(item => Number(item['quantity']));
        product.quantity = allQuantities.reduce((acc, curr) => acc + curr, 0);
        const totalParcelQty = product.product_parcels.reduce((sum, p) => sum + Number(p['quantity']), 0);
        product['parcel_qty_mismatch'] = Math.abs(totalParcelQty - Number(product['line_qty'] ?? product.quantity)) > 0.001;
        this.recalculateItem(product_index);
        this.productDataSource.data = [...this.data];
        this.localStorageService.setItem(this.WAREHOUSEPRODUCTKEY, this.data);
      });
  }

  // handle open when click to option -> available (old) parcel
  openAddAvailableParcelDialog(product_index: number, parcel: object = null, product_no: string) {
    const rawLinePrice = numeral(this.data[product_index]['price']).value() || null;
    const selectedUnit = this.data[product_index].productUnits?.find((u: any) => u['id'] === this.data[product_index]['product_unit_id']);
    const unitValue: number = selectedUnit?.['value'] ?? 1;
    const data = {
      expiration_date: parcel['expiration_date'],
      quantity_of_stock: parcel['quantity_of_stock'],
      parcel_no: parcel['parcel_no'],
      product_no: product_no,
      quantity: parcel['quantity'] ?? null,
      // parcel.unit_cost from DB is per base unit; multiply to display per selected unit
      unit_cost: parcel['unit_cost'] != null ? parcel['unit_cost'] * unitValue : rawLinePrice,
    };
    const parcelDialogRef  = this.dialog.open(WarehouseParcelFormDialogAvailableComponent, {
      width: '30%',
      data: data,
    });
    parcelDialogRef.afterClosed().subscribe(result => {
      if (!result) { return; }
      result = {
        parcel_no: result.parcel_no,
        expiration_date: result.expiration_date,
        quantity: result.quantity,
        unit_cost: result.unit_cost != null ? result.unit_cost / unitValue : null,
      };

      const product = this.data[product_index];
      if (!product) { return; }
      const existingParcelIndex = product.product_parcels.findIndex(
        p => p['parcel_no'] === result.parcel_no
      );

      // there are 2 type of case using this dialog:
      //  - create new one (form start with null)
      //  - update new one (form start with value)
      if (existingParcelIndex >= 0) {
        // Update existing parcel
        product.product_parcels[existingParcelIndex] = result;
      } else {
        // Add new parcel
        product.product_parcels.push(result);
      }
      // remove it from available
      if (this.parcelFilteredItems.has(product_index)) {
        // Get current filtered items observable
        const currentFilteredItems = this.parcelFilteredItems.get(product_index);

        // Create new observable excluding the selected parcel
        const updatedFilteredItems = currentFilteredItems?.pipe(
          map(items => items.filter(item => item['parcel_no'] !== result.parcel_no))
        );

        // Update the map with new observable
        if (updatedFilteredItems) {
          this.parcelFilteredItems.set(product_index, updatedFilteredItems);
        }
      }

      // result.unit_cost is per base unit after division; compare and set line price in selected unit
      if (result.unit_cost != null && result.unit_cost !== numeral(product['price']).value() / unitValue) {
        product['price'] = result.unit_cost * unitValue;
      }

      // review later -> reviewed (17/1/2025)
      const allQuantities = product.product_parcels.map(item => Number(item['quantity']));
      product.quantity = allQuantities.reduce((acc, curr) => acc + curr, 0);
      const totalParcelQty = product.product_parcels.reduce((sum, p) => sum + Number(p['quantity']), 0);
      product['parcel_qty_mismatch'] = Math.abs(totalParcelQty - Number(product['line_qty'] ?? product.quantity)) > 0.001;
      this.recalculateItem(product_index);
      this.productDataSource.data = [...this.data];
      this.localStorageService.setItem(this.WAREHOUSEPRODUCTKEY, this.data);
    });
  }

  // handle when the chip is selected -> choose the right dialog to display
  handleSelectChip(index: number, parcel: object) {
    // because we have 2 type of chip -> need to check this is new or old parcel (by view the quantity_of_stock)
    const perhapAvailableParcel = this.isAvailableParcel(parcel, index);
    // handle old case
    if (perhapAvailableParcel) {
      const availableParcel = this.data[index].product_parcels.find(p => p['parcel_no'] === parcel['parcel_no']);
      const { quantity: _, ...rest } = perhapAvailableParcel as any;
      const newAvailableParcel = {
        ...rest,
        quantity: availableParcel['quantity']
      };
      const product_no = this.data[index].product['product_no'];
      this.openAddAvailableParcelDialog(index, newAvailableParcel, product_no);
    } else {
      this.openAddNewParcelDialog(index, parcel as NewParcel);
    }
  }

  // handle open when click "chon lo" icon -> dialog show all new parcels and available parcels
  openParcelSelectionDialog(product_index: number) {
    const product = this.data[product_index];
    const product_id = product.product_id.toString();
    if (!product) { return; }
    // const selectedAvailable = [...product.product_parcels, ...this.getAvailableItems(product_index)];
    const availableItems = this.available_product_parcels.get(product_id) ?? [];
    // get all parcel from product_parcels and available_product_parcels
    // handle missing field
    const selectedAvailable = [
      ...availableItems.map(availItem => {
        const existingParcel = product.product_parcels.find(
          p => p['parcel_no'] === availItem['parcel_no']
        );
        if (existingParcel) {
          return {
            ...availItem,
            quantity: existingParcel['quantity']
          };
        } else {
          return availItem;
        }
      }),
      ...product.product_parcels.filter(
        productParcel => !availableItems.some(
          availItem => availItem['parcel_no'] === productParcel['parcel_no']
        )
      )
    ];
    const dialogRef = this.dialog.open(WarehouseParcelFormDialogSelectComponent, {
      width: '40%',
      data: {
        product_id: product.product_id,
        selectedParcels: selectedAvailable
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (!result) { return; }
      const product = this.data[product_index];
      if (!product) { return; }

      // Update parcels with quantities
      product.product_parcels = result;

      // update available = start available - result (it means remove these parcel from available parcels)
      const exist = this.parcelFilteredItems.has(product_index);
      if (exist) {
        // Get current filtered items observable
        const currentFilteredItems = this.getAvailableItems(product_index);
        // Create Set of selected parcel_no for efficient lookup
        const selectedParcelNos = new Set(product.product_parcels.map(p => p['parcel_no']));
        // Filter out items that are already in product_parcels
        const updatedFilteredItems = currentFilteredItems.filter(item => !selectedParcelNos.has(item['parcel_no']));

        // Update the map with new observable
        if (updatedFilteredItems) {
          this.parcelFilteredItems.set(product_index, updatedFilteredItems);
        }
      }

      // review later -> reviewed (17/1/2025)
      const allQuantities = product.product_parcels.map(item => Number(item['quantity']));
      product.quantity = allQuantities.reduce((acc, curr) => acc + curr, 0);
      this.recalculateItem(product_index);
      this.productDataSource.data = [...this.data];
    });
  }

  ngOnInit() {
    this.filterColumns = this.displayedColumns.map(col => `filter-${col}`);
    this.productDataSource = new MatTableDataSource();
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

    // Cho phép nhập lô có hạn dùng quá khứ (mặc định tắt) - dùng để mở/khóa chặn ngày ở dialog lô
    this.optionStoreService.getValue('allow_past_expiration').subscribe(res => {
      this.allowPastExpiration = res && res.value === 'yes';
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
            this.filteredMedicines = this.lookupMedicine(value);
            this.filteredProducts = this.lookupProduct(value);
          } else {
            // if no value is present, return null
            this.filteredProducts = of(null);
            this.filteredMedicines = of(null);
          }
        }, 300);
      });
      this.payFullDefault = this.localStorageService.getItem<boolean>("payFullDefault") ?? false;

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

          // We should have both Form and List products to load the temp data
          const formData = this.localStorageService.getItem<object>(this.WAREHOUSEFORMKEY);
          if(formData) {
            const tempData = this.localStorageService.getItem<WarehouseProduct[]>(this.WAREHOUSEPRODUCTKEY);
            // if missing 1 of 2, we will remove both
            if(tempData && tempData.length > 0) {
              this.data = tempData;
              this.productDataSource = new MatTableDataSource<WarehouseProduct>(this.data);
              this.openConfirmLoadTempDataFormDialog().subscribe(confirm => {
                if (confirm) {
                  this.form.patchValue({
                    no: 'PN' + res,
                    discount_amount: 0,
                    discount_type: 'price',
                    ...formData
                  });
                  this.recalculateWarehouse();
                } else {
                  this.data = [];
                  this.productDataSource = new MatTableDataSource<WarehouseProduct>(this.data);
                  this.form.patchValue({
                    no: 'PN' + res,
                    total_price: 0,
                    discount_amount: 0,
                    discount_type: 'price'
                  });
                  this.localStorageService.removeItem(this.WAREHOUSEPRODUCTKEY);
                  this.localStorageService.removeItem(this.WAREHOUSEFORMKEY);
                }
              });
            } else {
              this.form.patchValue({
                no: 'PN' + res,
                total_price: 0,
                discount_amount: 0,
                discount_type: 'price'
              });
              this.localStorageService.removeItem(this.WAREHOUSEPRODUCTKEY);
              this.localStorageService.removeItem(this.WAREHOUSEFORMKEY);
            }
          } else{
            this.localStorageService.removeItem(this.WAREHOUSEPRODUCTKEY);
            console.log('No data');
            this.form.patchValue({
              no: 'PN' + res,
              total_price: 0,
              discount_amount: 0,
              discount_type: 'price'
            });
          }
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


  // Enhanced filter function
  applyFilter(event: Event, column: string) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.filterValues[column] = filterValue;

    // Apply all active filters
    this.data = this.tempDataForQuickFilter.filter(item => {
      return Object.keys(this.filterValues).every(key => {
        const value = this.filterValues[key];
        if (!value) { return true; } // Skip empty filters

        if (key == 'product_unit_id') {
          return (item.productUnits.some(productUnit => {
                return (productUnit.name + '')
                  ?.toLowerCase()
                  ?.includes(value.toLowerCase());
              }
            )
          );
        } else {
          return (item.product[key] + '')
            ?.toLowerCase()
            ?.includes(value.toLowerCase());
        }
      });
    });

    // Update datasource
    this.productDataSource = new MatTableDataSource<WarehouseProduct>(this.data);

    // Reset to first page
    if (this.paginator) {
      this.paginator.firstPage();
    }
  }

  // Clear all filters
  clearFilters() {
    this.filterValues = {};
    this.data = [...this.tempDataForQuickFilter];
    this.productDataSource = new MatTableDataSource<WarehouseProduct>(this.data);
  }

  toggleFilters() {
    if (this.showFilters) {
      this.clearFilters();
    }
    setTimeout(() => {
      this.showFilters = !this.showFilters;
      localStorage.setItem('importForm-showFilters', JSON.stringify(this.showFilters));
    });
  }

  displaySupplier(supplier?: Supplier): string | undefined {
    return (supplier === undefined || supplier === null) ? undefined : supplier.name;
  }

  // lookup(value: string): Observable<Supplier[]> {
  //   return this.supplierSer.autocomplete(value).pipe(
  //     // map the item property of the github results as our return object
  //     map(results => results),
  //     // catch errors
  //     catchError(_ => {
  //       return of(null);
  //     })
  //   );
  // }


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
    // return this.productSer.autocompleteWithExpand(value,"manufacturerOne")
    return this.productSer.autocomplete(value)
    .pipe(
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
      let isChangeTotalAmount = false;
      const productIdsStr = res.body.map(item => item.product.id).join(',');
      const productFilter = new ProductFilter();
      productFilter.id = productIdsStr;
      productFilter.expand = 'quantity';

      res.body.forEach(item => {
        const warehouseProduct = new WarehouseProduct();
        if (this.updateModelId !== null) {
          warehouseProduct.id = item.id;
        }

        const productParcels = item.productParcels || [];
        let productUnit = null;
        if (item.productUnits && item.productUnits.length > 0) {
            productUnit = item.productUnits.find(obj => obj.id === item.product_unit_id);
        }

        if (productUnit) {
          productParcels.forEach(parcel => {
            parcel['quantity'] =  parcel['quantity'] / productUnit['value'];
          });
        }

        warehouseProduct.product_id = item.product_id;
        warehouseProduct.product = item.product;
        warehouseProduct.quantity = item.quantity;
        warehouseProduct.price = (item.price !== null) ? numeral(item.price).format('0,0') : 0;
        warehouseProduct.sell_price = item.sell_price;
        warehouseProduct.discount = (item.discount !== null) ? item.discount : 0;
        warehouseProduct.discount_type = (item.discount_type !== null) ? item.discount_type : 'price';
        warehouseProduct.amount = (item.amount !== null) ? item.amount : 0;
        warehouseProduct.productUnits = item.productUnits !== undefined ? item.productUnits : [];
        warehouseProduct.product_parcels = productParcels;
        warehouseProduct.vat = (item.vat !== null) ? item.vat : 0;
        warehouseProduct.vat_type = (item.vat_type !== null) ? item.vat_type : 'price';
        warehouseProduct.is_sub_item = item.is_sub_item ?? 0;
        warehouseProduct.note = item.note || '';
        warehouseProduct.productUnits.forEach(productUnit => {
          productUnit['quantity_of_stock'] = ((item?.productQuantity?.number || 0) / productUnit['value']);
        });

        let productUnitSelect = warehouseProduct.productUnits.find(unit => unit['id'] === item.product_unit_id);
        if (productUnitSelect) {
          warehouseProduct.product_unit_id = item.product_unit_id;
          warehouseProduct.inventory_quantity = productUnit['quantity_of_stock'];
        } else {
          isChangeTotalAmount = true;

          if (warehouseProduct.productUnits.length > 0) {
            productUnitSelect = warehouseProduct.productUnits[0];
            warehouseProduct.product_unit_id =  productUnitSelect['id'];
            warehouseProduct.inventory_quantity =  productUnitSelect['quantity_of_stock'];
            warehouseProduct.price = productUnitSelect['original_price'];
            warehouseProduct.sell_price = productUnitSelect['sell_price'];
            warehouseProduct.amount = ((warehouseProduct.price - item.discount) * item.quantity);
          } else {
            warehouseProduct.product_unit_id = null;
            warehouseProduct.inventory_quantity = 0;
          }
        }

        if (productParcels.length > 0) {
          this.parcels = this.parcels.concat(productParcels);
        }
        newData.push(warehouseProduct);
      });
      this.data = newData;
      this.tempDataForQuickFilter = [...newData]; // Create initial copy
      this.productDataSource = new MatTableDataSource<WarehouseProduct>(this.data);
      // this.recalculateWarehouse(true); no need recalculate when update data

      if (isChangeTotalAmount) {
        this.recalculateWarehouse();
      }
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
    filter.expand = 'productUnits,quantity,product,productParcels,productQuantity';
    if (this.updateModelId !== null) {
      filter.warehouse_id = this.updateModelId;
    }
    return filter;
  }


  submit(status: number) {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    if (this.submitted === true) {
      return;
    }
    this.submitted = true;
    this.isLoadingResults = true;
    this.recalculateWarehouse(true);
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

          if (!element.product_unit_id) {
            // @ts-ignore
            this.notifySer.notify('warning', 'Vui lòng chọn đơn vị cho SP: ' +  element?.product?.product_name);
            reject();
          }
        });
        resolve();
      } else {
        this.notifySer.notify('warning', 'Danh sách không được để trống!');
        reject();
      }
    });
    // check parcel
    const products = this.data;
    for (const product of products) {
      // @ts-ignore
      if (product.product_parcels.length === 0 && (product.product['batch_tracking_enabled'])) {
        this.notifySer.notify('warning', `${product?.product['product_no']}: chưa nhập lô cho sản phẩm!`);
        this.isLoadingResults = false;
        this.submitted = false;
        return;
      }
      if (product['parcel_qty_mismatch'] && (product.product['batch_tracking_enabled'])) {
        this.notifySer.notify('warning', `${product?.product['product_no']}: Tổng số lượng các lô chưa khớp với số lượng đặt hàng!`);
        this.isLoadingResults = false;
        this.submitted = false;
        return;
      }

      if (!product.product_parcels || product.product_parcels.length === 0) {
        continue;
      }

      for (const parcel of product.product_parcels) {
        const expDate = parcel['expiration_date'];
        if (typeof expDate === 'string') {
          const parsed = moment(expDate, 'YYYY-MM-DD', true);
          if (!parsed.isValid()) {
            const fallback = moment(expDate);
            if (!fallback.isValid()) {
              this.notifySer.notify('warning', `Ngày hết hạn số lô SP ${product?.product['product_no']} không hợp lệ!`);
              this.isLoadingResults = false;
              this.submitted = false;
              return;
            }
            parcel['expiration_date'] = fallback.format('YYYY-MM-DD');
          }
        } else if (expDate instanceof Date) {
          parcel['expiration_date'] = moment(expDate).format('YYYY-MM-DD');
        } else if (expDate && typeof expDate === 'object' && expDate._d) {
          parcel['expiration_date'] = moment(expDate._d).format('YYYY-MM-DD');
        }
      }
    }

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
            const expDate = new Date(this.form.controls['date'].value.valueOf() + (420 * 60 * 1000));

            data['date'] = expDate.toISOString().split('T')[0];
          } else {
            const effDate = this.form.controls['date'].value;
            data['date'] = effDate.split('T')[0];
            data['date'] = moment(data['date'], 'YYYY-MM-DD').add(1, 'days').format('YYYY-MM-DD');
          }
        }
        // if (this.form.controls['date'].value !== null) {
        //   if (typeof this.form.controls['date'].value === 'object') {
        //     // handle convert day with momentAdapter to fix the typing date bug
        //     let adjusted_date;
        //     // handle case date not change (don't use moment) because of missing _d
        //     if(!this.form.controls['date'].value._d) {
        //       adjusted_date = this.form.controls['date'].value;
        //     }
        //     else{
        //       const new_date = this.form.controls['date'].value._d;
        //        adjusted_date = new Date(new_date.getTime() + (7 * 60 * 60 * 1000)); // Add 7 hours
        //     }
        //     // this is the deprecated code
        //     // const effDate = new Date(this.form.controls['date'].value.getTime() + (420 * 60 * 1000));
        //     // data['date'] = effDate.toISOString().split('T')[0];
        //
        //     data['date'] = adjusted_date.toISOString().split('T')[0];
        //   } else {
        //     // @@ NGHIA
        //     const effDate = this.form.controls['date'].value;
        //     data['date'] = effDate.split('T')[0];
        //     data['date'] = moment(data['date'], 'YYYY-MM-DD').add(1, 'days').format('YYYY-MM-DD');
        //   }
        // }
        this.data.forEach(element => {
          element.price = numeral(element.price).value();
          element.amount = numeral(element.amount).value();
          element.discount = numeral(element.discount).value();
          element.vat = numeral(element.vat).value();
          element.sell_price = numeral(element.sell_price).value();
        });
        data['items'] = this.data;
        // console.log(this.data);
        data['status'] = status;

        if (data['supplier_id'] === undefined) {
          this.notifySer.notify('warning', this.form.controls['supplier'].value + ' chưa được tạo bên nhà cung cấp.');
          return;
        }

        if (this.updateModelId !== null) {
          // if (this.model['status'] === 10 && !this.isAdminStore) {
          //   this.notifySer.notify('error', 'Bạn không có quyền thực hiện chức năng này.');
          //   return;
          // }
          // delete data['date'];
          // delete data['supplier'];
          this.mainService.update(this.updateModelId, data)
            .subscribe({
              next: (res: IResponse<Warehouse>) => { //
                if (res && res.success) {
                  this.notifySer.notify('success', 'Lưu thành công.');
                  this.submitted = false;
                  this.isLoadingResults = false;
                  if (status === 9) {
                    this.model = res.data;
                    this.router.navigate(['/transaction/warehouse/update/' + res.data.id]);
                  } else {
                    this.router.navigate(['/transaction/warehouse/']);
                  }
                } else {
                  this.notifySer.notify('error', res.message || 'Lưu thất bại, vui lòng thử lại sau');
                  this.submitted = false;
                  this.isLoadingResults = false;
                }
              },
              error: (err) => {
                console.log(err);
                this.notifySer.notify('error', 'Lưu thất bại, vui lòng thử lại sau');
                this.submitted = false;
                this.isLoadingResults = false;
              }
            });
        } else {
          this.mainService.create(data).subscribe({
            next: (res: IResponse<Warehouse>) => {
              if (res && res.success) {
                this.notifySer.notify('success', 'Lưu thành công.');
                this.submitted = false;
                this.isLoadingResults = false;
                if (status === 9) {
                  this.model = res.data;
                  this.router.navigate(['/transaction/warehouse/update/' + res.data.id]);
                } else {
                  this.router.navigate(['/transaction/warehouse/']);
                }
              } else {
                this.notifySer.notify('error', res.message || 'Lưu thất bại, vui lòng thử lại sau');
                this.submitted = false;
                this.isLoadingResults = false;
              }
            },
            error: (err) => {
              console.log(err);
              this.notifySer.notify('error', 'Lưu thất bại, vui lòng thử lại sau');
              this.submitted = false;
              this.isLoadingResults = false;
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
      this.localStorageService.removeItem(this.WAREHOUSEPRODUCTKEY);
      this.localStorageService.removeItem(this.WAREHOUSEFORMKEY);
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
    if (this.searchMode) {

      if (!product['productUnits']) {
        this.notifyService.notify('warning', 'Sản phẩm này không tồn đại đơn vị để thêm nhanh, vui lòng thêm bình thường.');
        return;
      }

      this.tempProductId = product.id;

      this.selectUnits = product['productUnits'];

      this.quantityInputRef.nativeElement.focus();
      return;
    }

    if (product == -1) {
      return;
    }

    if (product.product_type !== undefined) {
      this.handleAddProductToList(product.id);
      this.selectProduct.patchValue(null);
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
  handleAddProductToList(product_id, inLocal=-1) {
    if (this.productDataSource.data.length >= 200) {
      this.notifySer.notify('warning', 'Đơn nhập tối đa 100 sản phẩm!');
      return;
    }
    let productExits = 0;
    this.data.forEach((element, index) => {
      if (element.product_id === product_id && element.is_sub_item===0) {
        productExits = 1;
        if (element['product_parcels'].length > 0) {
          element['product_parcels'][0]['quantity'] = element['product_parcels'][0]['quantity'] + 1;
        }
        element.quantity = element.quantity + 1;
        this.recalculateItem(index);
      }
    });
    if (productExits === 0) {
      if(inLocal>-1) {
        let tempData = this.localStorageService.getItem<WarehouseProduct[]>(this.WAREHOUSEPRODUCTKEY)[inLocal];
        if(tempData) {


          this.data.push(tempData);
          this.tempDataForQuickFilter = [...this.data]; // Update copy with new item

          this.productDataSource = new MatTableDataSource<WarehouseProduct>(this.data);
          this.recalculateWarehouse();
        }
      }else{
        this.productSer.getDetail(product_id, 'productUnits,quantity').subscribe(res => {
          const warehouseProduct = new WarehouseProduct();
          warehouseProduct.product_id = res['id'];
          warehouseProduct.product = res;
          warehouseProduct.quantity = 1; // de nhap so lo
          warehouseProduct.price = (res['original_price'] !== null) ? numeral(res['original_price']).format('0,0') : 0;
          warehouseProduct.sell_price = (res['sell_price'] !== null) ? numeral(res['sell_price']).format('0,0') : 0;
          const baseQty1 = res['quantity'] ? res['quantity']['number'] : 0;
          warehouseProduct.inventory_quantity = baseQty1;
          warehouseProduct.discount = 0;
          warehouseProduct.discount_type = 'price';
          warehouseProduct.amount = (res['original_price'] !== null) ? res['original_price'] : 0;
          // warehouseProduct.amount = 0; // (res['original_price'] !== null) ? res['original_price'] : 0;
          warehouseProduct.productUnits = res['productUnits'];
          if (res['productUnits']) {
            res['productUnits'].forEach(pu => {
              if (!pu['quantity_of_stock']) {
                pu['quantity_of_stock'] = Math.floor(baseQty1 / (pu['value'] || 1));
              }
            });
          }
          warehouseProduct.product_parcels = [];
          warehouseProduct.vat = 0;
          warehouseProduct.vat_type = 'price';
          warehouseProduct.is_sub_item = 0;
          warehouseProduct.note = '';
          warehouseProduct.master_product_id = product_id;
          if (res['productUnits'].length > 0) {
            res['productUnits'].sort((a, b) => (a.value > b.value) ? 1 : -1);
            warehouseProduct.product_unit_id = res['productUnits'][0]['id'];
            warehouseProduct.price = res['productUnits'][0]['original_price'];
            warehouseProduct.sell_price = (res['productUnits'][0]['sell_price'] !== null) ? numeral(res['productUnits'][0]['sell_price']).format('0,0') : 0;
          }
          this.data.unshift(warehouseProduct);
          this.tempDataForQuickFilter = [...this.data]; // Update copy with new item

          // const newData = this.data.concat([warehouseProduct]);
          // this.data = newData;
          this.data.forEach(element => {
            element.price = numeral(element.price).format('0,0');
          });
          this.productDataSource = new MatTableDataSource<WarehouseProduct>(this.data);
          this.recalculateWarehouse();
          this.localStorageService.setItem(this.WAREHOUSEPRODUCTKEY, this.data);
          // this.selectProduct.patchValue(null, { emitEvent : false });
        });
      }

      this.productSer.getParcel(product_id).subscribe(res => {
        if (res) {
          this.available_product_parcels.set(product_id, [res]);
        }
      });
    } else {
      this.productDataSource = new MatTableDataSource<WarehouseProduct>(this.data);
      this.recalculateWarehouse();
      // this.selectProduct.patchValue(null, { emitEvent : false });
    }
  }
  handleAddProductToListWithQuickAdd(product_id) {

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
        element.quantity = element.quantity + +this.selectQuantity.value;
        this.recalculateItem(index);
      }
    });
    if (productExits === 0) {
      this.productSer.getDetail(product_id, 'productUnits,quantity').subscribe(res => {
        const warehouseProduct = new WarehouseProduct();
        warehouseProduct.product_id = res['id'];
        warehouseProduct.product = res;
        warehouseProduct.quantity = +this.selectQuantity.value;
        warehouseProduct.price = (res['original_price'] !== null) ? numeral(res['original_price']).format('0,0') : 0;
        warehouseProduct.sell_price = (res['sell_price'] !== null) ? numeral(res['sell_price']).format('0,0') : 0;
        const baseQty2 = res['quantity'] ? res['quantity']['number'] : 0;
        warehouseProduct.inventory_quantity = baseQty2;
        warehouseProduct.discount = 0;
        warehouseProduct.discount_type = 'price';
        warehouseProduct.amount = (res['original_price'] !== null) ? res['original_price'] : 0;
        // warehouseProduct.amount = 0; // (res['original_price'] !== null) ? res['original_price'] : 0;
        warehouseProduct.productUnits = res['productUnits'];
        if (res['productUnits']) {
          res['productUnits'].forEach(pu => {
            if (!pu['quantity_of_stock']) {
              pu['quantity_of_stock'] = Math.floor(baseQty2 / (pu['value'] || 1));
            }
          });
        }
        warehouseProduct.product_parcels = [];
        warehouseProduct.vat = 0;
        warehouseProduct.vat_type = 'price';
        warehouseProduct.is_sub_item = 0;

        warehouseProduct.product_unit_id = this.selectUnit.value['id'];
        warehouseProduct.price = this.selectUnit.value['original_price'];

        this.data.unshift(warehouseProduct);
        this.tempDataForQuickFilter = [...this.data]; // Update copy with new item

        // const newData = this.data.concat([warehouseProduct]);
        // this.data = newData;
        this.data.forEach(element => {
          element.price = numeral(element.price).format('0,0');
        });
        this.productDataSource = new MatTableDataSource<WarehouseProduct>(this.data);
        this.recalculateWarehouse();
        this.selectProduct.patchValue(null);
        this.selectUnit.patchValue(null);
        this.selectUnits = [];
        this.selectQuantity.patchValue(0);
        this.inputField.nativeElement.focus();
      });
    } else {
      this.productDataSource = new MatTableDataSource<WarehouseProduct>(this.data);
      this.recalculateWarehouse();
      this.selectProduct.patchValue(null);
      this.selectUnit.patchValue(null);
      this.selectUnits = [];
      this.selectQuantity.patchValue(0);
      this.inputField.nativeElement.focus();
    }
  }

  recalculateItem(i) {
    if (this.data[i] !== undefined) {
      const price = numeral(this.data[i]['price']).value();
      let amount;
      if (this.data[i]['discount_type'] === 'price') {
        amount = (price * this.data[i]['quantity']) - this.data[i]['discount'];
      } else {
        amount = (price - (price * this.data[i]['discount']) / 100) * this.data[i]['quantity'];
      }

      // tính thue suat
      const vat = numeral(this.data[i]['vat']).value();
      if (vat !== 0) {
        if (this.data[i]['vat_type'] === 'price') {
          amount = amount + vat;
        } else {
          amount = amount + (amount * vat) / 100;
        }
      }

      // Giữ phần lẻ tới 2 số (khớp hóa đơn) thay vì làm tròn về số nguyên
      this.data[i]['amount'] = this.round2(amount);

      this.recalculateWarehouse();
    }
  }

  recalculateWarehouse(isSubmit = false) {
    let quantity = 0, price = 0, remainAmount = 0, totalAmount = 0;
    let paidAmount = numeral(this.form.controls['paid_amount'].value).value();
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
      totalAmount = this.round2(Number(price) - Number(discount));

      // handle the auto payfull case => skip when update
      if(this.payFullDefault && !isSubmit && !this.updateModelId){
        paidAmount = totalAmount;
      }
      remainAmount = this.round2(Number(paidAmount) - totalAmount);
    } else {
      totalAmount = this.round2(Number(price) - Number(price) * Number(discount) / 100);

      // handle the auto payfull case => skip when update
      if(this.payFullDefault && !isSubmit && !this.updateModelId){
        paidAmount = totalAmount;
      }
      remainAmount = this.round2(Number(paidAmount) - totalAmount);
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

    let formValues = {
      quantity: numeral(quantity).format('0,0'),
      total_price: numeral(price).format('0,0.[00]'),
      remain_amount: numeral(remainAmount).format('0,0.[00]'),
      total_amount: numeral(totalAmount).format('0,0.[00]'),
      expenses_price: numeral(this.expensesTransaction).format('0,0.[00]')
    };
    if(this.payFullDefault){
      formValues['paid_amount'] =  numeral(paidAmount).format('0,0.[00]')
    }
    this.form.patchValue(formValues);

    const temp = this.localStorageService.getItem<object>(this.WAREHOUSEFORMKEY);
    this.localStorageService.setItem(this.WAREHOUSEFORMKEY,{
      ...temp,
      quantity: numeral(quantity).format('0,0'),
      total_price: numeral(price).format('0,0.[00]'),
      remain_amount: numeral(remainAmount).format('0,0.[00]'),
      total_amount: numeral(totalAmount).format('0,0.[00]'),
      expenses_price: numeral(this.expensesTransaction).format('0,0.[00]'),
      paid_amount: numeral(paidAmount).format('0,0.[00]')
    })
  }

  removeProduct(i) {
    // we need to remove the subItem when remove the master Item
    const selectedProduct = this.data[i];

    // Filter out the selected product and its sub-items
    if (selectedProduct.is_sub_item === 1) {
      // If it's a sub-item, just remove that specific item
      this.data = this.data.filter((item, index) => index !== i);
    } else {
      // If it's a master item, remove it and its sub-items
      this.data = this.data.filter(item => {
        return item !== selectedProduct &&
          (item.is_sub_item === 0  || item.master_product_id !== selectedProduct.product_id);
      });
    }

    // Update the tempDataForQuickFilter similarly
    if (selectedProduct.is_sub_item === 1) {
      this.tempDataForQuickFilter = this.tempDataForQuickFilter.filter((item, index) =>
        index !== i
      );
    } else {
      this.tempDataForQuickFilter = this.tempDataForQuickFilter.filter(item => {
        return item !== selectedProduct &&
          (item.is_sub_item === 0 || item.master_product_id  !== selectedProduct.product_id);
      });
    }


    this.recalculateWarehouse();
    this.productDataSource = new MatTableDataSource<WarehouseProduct>(this.data);
    this.localStorageService.setItem(this.WAREHOUSEPRODUCTKEY, this.data);
  }

  /**
   * - Nhập hàng đơn vị giá đơn vị  = giá vôn đơn vị cơ bản * số lượng quy đổi
   * @param index
   * @param select
   */
  /**
   * Chỉ đổi đơn vị của ĐÚNG dòng này. Trước đây đổi một dòng là ép mọi dòng cùng sản
   * phẩm (dòng chính + dòng tặng) về chung đơn vị, nên nhập 1 hộp tặng 5 viên phải tự
   * quy đổi. Backend đã xử lý từng dòng theo product_unit_id riêng: cộng tồn
   * (Warehouse::afterSave), quy đổi lô, và giá vốn bình quân
   * (PriceUtils::calculateOriginalProductPrice) — nên mỗi dòng một đơn vị không làm sai tồn
   * hay giá vốn. Giá vốn sản phẩm vẫn chỉ lấy từ dòng chính như trước.
   */
  onUnitChange(index, select) {
    const product = this.data[index];
    if (!product) { return; }
    const unit = product['productUnits'].find(element => element['id'] === select.value);
    const unitBase = product['productUnits'].find(element => element['is_base'] === 1);
    if (!unit) { return; }

    // Dòng tặng đã để giá 0 thì đổi đơn vị vẫn giữ 0, không đặt lại thành giá vốn
    const keepFreeGiftPrice = Number(product['is_sub_item']) === 1 && Number(product['price']) === 0;
    if (!keepFreeGiftPrice && unitBase) {
      product['price'] = unitBase['original_price'] * unit['value'];
    }
    product['sell_price'] = unit['sell_price'];
    product['inventory_quantity'] = unit['quantity_of_stock'];
    product['amount'] = (product['price'] - product['discount']) * product['quantity'];
    if (product['product_parcels']?.length === 1) {
      product['product_parcels'][0]['quantity'] = product['quantity'];
    }
    this.recalculateWarehouse();
    this.localStorageService.setItem(this.WAREHOUSEPRODUCTKEY, this.data);

    // if (this.data[index] !== undefined) {
    //   const unit = this.data[index]['productUnits'].find(element => element['id'] === select.value);
    //   const unitBase = this.data[index]['productUnits'].find(element => element['is_base'] === 1);
    //   this.data[index]['price'] = unitBase['original_price'] * unit['value'];
    //   this.data[index]['sell_price'] = unit['sell_price'];
    //   this.data[index]['inventory_quantity'] = unit['quantity_of_stock'];
    //   // this.data[index]['price'] = (unit['original_price'] !== 0) ? unit['original_price'] : unit['sell_price']; //unit['original_price'];
    //   this.data[index]['amount'] = (this.data[index]['price'] - this.data[index]['discount']) * this.data[index]['quantity'];
    //   this.localStorageService.setItem(this.WAREHOUSEPRODUCTKEY, this.data);
    //   this.recalculateWarehouse();
    // }
  }

  /**
   * Open the popup check user want to load the previous data or not
   * This is important because maybe user want to remove all data
   */
  openConfirmLoadTempDataFormDialog():Observable<boolean>  {
    const dialogRef = this.dialog.open(WarehouseConfirmLoadDataFormComponent, {
      width: '35%',
      minHeight: '80%',
    });
    return dialogRef.afterClosed().pipe(map(result => result === true));
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
        this.localStorageService.setItem("warehouseProduct", this.data);
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
    this.recalculateWarehouse();
    const dialogRef = this.dialog.open(WarehouseDiscountDialogComponent, {
      width: '30%',
      minHeight: '80%',
      data: {
        discount_amount: this.form.controls['discount_amount'].value,
        discount_type: this.form.controls['discount_type'].value,
        total_price: numeral(this.form.controls['total_price'].value).value(),
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result !== null && result !== undefined) {
        this.form.patchValue({
          discount_amount: result.number,
          discount_type: result.type,
        });
        const temp = this.localStorageService.getItem<object>(this.WAREHOUSEFORMKEY);
        this.localStorageService.setItem(this.WAREHOUSEFORMKEY, {
          ...temp,
          discount_amount: result.number,
          discount_type: result.type,
        })
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
          total_price: numeral(this.data[i]['price']).value() * this.data[i]['quantity'],
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
          sell_price: this.data[i]['sell_price'],
          discount: this.data[i]['discount'],
          discount_type: this.data[i]['discount_type'],
          vat: this.data[i]['vat'],
          vat_type: this.data[i]['vat_type'],
        }
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result !== null) {
          this.data[i]['sell_price'] = numeral(result.sell_price).value();
          this.data[i]['price'] = numeral(result.price).value();
          this.data[i]['discount'] = numeral(result.discount).value();
          this.data[i]['discount_type'] = result.discount_type;
          this.data[i]['vat'] = numeral(result.vat).value();
          this.data[i]['vat_type'] = result.vat_type;
          this.recalculateItem(i);
          this.localStorageService.setItem(this.WAREHOUSEPRODUCTKEY, this.data);
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
        const temp = this.localStorageService.getItem<object>(this.WAREHOUSEFORMKEY);
        this.localStorageService.setItem(this.WAREHOUSEFORMKEY, {
            ...temp,
            supplier: result['supplier'],
        })
        // this.handleAddProductToList(result['product_id']);
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
      paid_amount: numeral(paid_amount).format('0,0.[00]'),
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
    event.target.value = this.formatNumberKeepDecimal(event.target.value);
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
    // Cho phép đơn giá âm (nghiệp vụ điều chỉnh giảm/nhập trả). Đoạn chặn < 0
    // trước đây (commit 142df000) đã được gỡ theo yêu cầu khách hàng.
    // formatNumberKeepDecimal strip dấu "-", nên giữ lại dấu trừ cục bộ tại đây.
    const isNegative = (event.target.value || '').toString().trim().startsWith('-');
    const formatted = (isNegative ? '-' : '') + this.formatNumberKeepDecimal(event.target.value);
    const parsedPrice = numeral(formatted).value();
    event.target.value = formatted;
    // Lưu number: pipe showValueExpenses là impure nhưng trả về cùng chuỗi khi giá
    // trị số không đổi (vd lúc vừa gõ dấu "."), nên không ghi đè/cắt phần thập phân
    // đang gõ dở. Giữ number để các phép tính amount trực tiếp khác không bị NaN.
    this.data[index]['price'] = parsedPrice;
    this.recalculateItem(index);
  }

  /**
   * Format số có giữ phần thập phân (tối đa 2 chữ số) khi người dùng đang gõ.
   * - Phần nguyên: thêm dấu phân cách hàng nghìn.
   * - Giữ dấu "." cuối để người dùng gõ tiếp số lẻ (vd "72,626.").
   */
  formatNumberKeepDecimal(value: any): string {
    if (value === null || value === undefined) { return ''; }
    const str = value.toString().replace(/,/g, '').replace(/[^0-9.]/g, '');
    if (str === '') { return ''; }
    const dotIndex = str.indexOf('.');
    if (dotIndex === -1) {
      return numeral(str).format('0,0');
    }
    const intPart = str.slice(0, dotIndex);
    const decPart = str.slice(dotIndex + 1).replace(/\./g, '').slice(0, 2);
    const intFormatted = intPart === '' ? '0' : numeral(intPart).format('0,0');
    return intFormatted + '.' + decPart;
  }

  /** Làm tròn tới 2 chữ số thập phân (đơn vị: đồng, giữ phần lẻ khớp hóa đơn). */
  round2(value: number): number {
    return Math.round((Number(value) + Number.EPSILON) * 100) / 100;
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

  openUnitCreateDialog(index: number, element: any) {
    const ref = this.dialog.open(WarehouseUnitCreateDialogComponent, {
      width: '80%',
      minHeight: '200px',
      maxWidth: '750px',
      data: element
    });

    ref.afterClosed().subscribe(res => {
      if (res && res.success) {
        element['productUnits'] = res.data;

        if (res.unit_id_active) {
          this.data[index]['product_unit_id'] = res.unit_id_active;
          this.onUnitChange(index, {value: res.unit_id_active});
        }
      }
    });
  }

  openAmountDialog(index: any) {
    if (!this.allow_amount_adjust) { return; }

    const ref = this.dialog.open(WarehouseFormAmountComponent, {
      width: '20%',
      minHeight: '200px',
      data: this.data[index],
    });

    ref.afterClosed().subscribe(result => {
      if (result) {
        const el = this.data[index];
        const am = numeral(result.final_amount).value();
        const q = el.quantity;
        const a = el.vat;
        const b = el.discount;

        const  type = el.vat_type + '|' + el.discount_type;
        switch (type) {
          case 'percent|percent':
            this.data[index]['price'] = (100 * am) / (q * (100 + a - a * (b / 100) - b));
            break;
          case 'price|price':
            this.data[index]['price'] = (am / q) - a + b;
            break;
          case 'percent|price':
            this.data[index]['price'] = (100 * am + a * b + 100 * b) / (q * (100 + a));
            break;
          case 'price|percent':
            this.data[index]['price'] = (am - a) / (q * (1 - b / 100));
            break;
        }

        this.recalculateItem(index);
        this.recalculateWarehouse();
        this.localStorageService.setItem(this.WAREHOUSEPRODUCTKEY, this.data)
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
      this.filterColumns = this.displayedColumns.map(col => `filter-${col}`);

      localStorage.setItem('importForm-displayedColumns', JSON.stringify(this.displayedColumns));
    });
  }
  toggleAmountAdjustColumn() {
    setTimeout(() => {
      this.allow_amount_adjust = !this.allow_amount_adjust;
      localStorage.setItem('importForm-allowAmountAdjust', JSON.stringify(this.allow_amount_adjust));
    });
  }
  toggleMultipleSelectColumn() {
    setTimeout(() => {
      this.allow_multiple_select = !this.allow_multiple_select;
      localStorage.setItem('importForm-allowMultipleSelect', JSON.stringify(this.allow_multiple_select));
    });
  }
  isIncludes(column) {
    return this.displayedColumns.some(item => item === column);
  }

  focusInput() {
    // This will programmatically focus the input field
    this.inputField.nativeElement.focus();

    this.searchMode = !this.searchMode;
    this.selectedProducts = [];
  }

  onQuantityEnter() {
    this.unitInputRef.focus();
    this.unitInputRef.open();
  }

  onUnitEnter() {
    this.handleAddProductToListWithQuickAdd(this.tempProductId);
  }

  displayProductFn(item: any): string {
    return item && item.product_name ? item.product_name :
          item && item.medicine_name ? item.medicine_name : '';
  }

  onProductSelectionChange(event: MatSelectionListChange) {
    // Get selected products
    this.selectedProducts = event.source.selectedOptions.selected.map(option => option.value);
  }

  onAddProducts() {
    for (const product of this.selectedProducts) {
      this.handleAddProductToList(product.id);
    }
    this.selectedProducts = [];
    this.productList.deselectAll();
    this.autocompleteTrigger.closePanel();
  }

  // coding add new row
  addNewRow(i: number) {
    const oldItem = this.data[i];
    const newItem = {...oldItem, note: '', master_product_id: oldItem.product_id, is_sub_item: 1, product_parcels: [], quantity: 0};
    this.data.splice(i + 1, 0, newItem);

    this.productDataSource.data = [...this.data];
    this.tempDataForQuickFilter = [...this.data];
    this.localStorageService.setItem(this.WAREHOUSEPRODUCTKEY, this.data)
  }
  // Add this method to check if note is shown
  isNoteShown(i: number): boolean {
    return this.shownNotes.has(i);
  }
  closeNote(index: number) {
    this.shownNotes.delete(index);
  }
  toggleShowNote(i: number) {
    if (this.shownNotes.has(i)) {
      this.shownNotes.delete(i);
    } else {
      this.shownNotes.add(i);
    }
  }

  enterBarcode($event) {
    this.barcode = $event.target.value;
    // console.log(this.barcode);
    this.productSer.addproductBarcode(this.barcode).subscribe(res => {
      // console.log(res);
      if (res['errors']) {
        this.notifySer.notify('warning', res['errors']);
      }
      if (res !== null) {
        // if (this.amountProduct === null) {
        //   this.amountProduct = 1;
        // }

        // if (this.searchMode) {
        //   this.selectedProductValue = res;
        //   this.inputQuantity.nativeElement.focus();
        //   return;
        // } else {
        this.onSelectedProduct(res);
        // }
      }
      this.autocompleteTrigger.closePanel();
    });
  }
  // end coding
  storeNoteToLocalStorage(i) {
    this.localStorageService.setItem(this.WAREHOUSEPRODUCTKEY, this.data);
  }


  /**
   * Store the branch to local storage once user completes selection
   * @param event
   */
  storeBranchToLocalStorage(event: MatSelectChange) {
    const value = event.value;
    const temp = this.localStorageService.getItem(this.WAREHOUSEFORMKEY);
    temp['branch_id'] = value;
    this.localStorageService.setItem(this.WAREHOUSEFORMKEY, temp);
  }

  /**
   * Store the Note into the local storage once user finishes typing
   */
  storeWholeNoteToLocalStorage() {
    const noteValue = this.form.get('note')?.value;
    const temp = this.localStorageService.getItem<object>(this.WAREHOUSEFORMKEY);
    this.localStorageService.setItem(this.WAREHOUSEFORMKEY, {
      ...temp,
      note: noteValue,
    });
  }

  /**
   * Get the master index to make the order shows correctly
   * @param currentIndex
   */
  getMasterIndex(currentIndex: number) {
    let masterItemCount = 0;
    for (let i = 0; i <= currentIndex; i++) {
      if (this.data[i]?.is_sub_item === 0) {
        masterItemCount++;
      }
    }
    return masterItemCount;
  }

  /**
   * Store to localstorage user choice when the payfull toggle
   */
  onShowPayfullChange() {
    this.payFullDefault = !this.payFullDefault;
    this.localStorageService.setItem('payFullDefault', this.payFullDefault);
  }

  /**
   * Calculate the quantity & price of import form
   * Support to the pay full automation progress
   */
  calculatePay() {
    let quantity = 0;
    let price = 0;
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
    return {
      quantity: quantity,
      price: price
    }
  }

  /**
   * Recalculate when user want to change the pay (they don't want to use the default one)
   */
  onPayProducer() {
    let paidAmount = numeral(this.form.controls['paid_amount'].value).value();
    const { quantity, price } = this.calculatePay();
    const discount = this.form.controls['discount_amount'].value;
    const discount_type = this.form.controls['discount_type'].value;
    let totalAmount = 0;
    let remainAmount = 0;
    if (discount_type === 'price') {
      totalAmount = this.round2(Number(price) - Number(discount));
      remainAmount = this.round2(Number(paidAmount) - totalAmount);
    } else {
      totalAmount = this.round2(Number(price) - Number(price) * Number(discount) / 100);
      remainAmount = this.round2(Number(paidAmount) - totalAmount);
    }
    let formValues = {
      quantity: numeral(quantity).format('0,0'),
      total_price: numeral(price).format('0,0.[00]'),
      remain_amount: numeral(remainAmount).format('0,0.[00]'),
      total_amount: numeral(totalAmount).format('0,0.[00]'),
      paid_amount: numeral(paidAmount).format('0,0.[00]'),
    };
    this.form.patchValue(formValues);
  }

  getParcelStatus(i) {
    const product = this.data[i];

    const isBatchTrackingEnabled = product.product['batch_tracking_enabled'] || false;

    return product.product_parcels?.length === 0 && isBatchTrackingEnabled && this.parcelItemControls.get(i)?.touched;
  }
}
