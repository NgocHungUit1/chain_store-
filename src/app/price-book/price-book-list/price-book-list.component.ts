import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { ActivatedRoute } from '@angular/router';
import { ListComponentBase } from '../../shared/base';
import { MatDialog } from '@angular/material/dialog';
import { NotifierService } from 'angular-notifier';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { CreatePriceListFormDialogComponent } from '../create-price-list-form-dialog/create-price-list-form-dialog.component';
import { PriceListService } from '../price-list.service';
import { PriceListProductService } from '../price-list-product.service';
import { PriceList, PriceListFilter } from '../price-list.model';
import { WarehouseProduct, WarehouseProductFilter } from '../../warehouse/warehouse.model';
import { Product } from '../../product/product.model';
import { Observable } from 'rxjs/index';
import { WarehouseProductService } from '../../warehouse/warehouse-product.service';
import { ProductService } from '../../product/product.service';
import { of } from 'rxjs/internal/observable/of';
import { catchError, debounceTime, map, startWith, switchMap } from 'rxjs/operators';
import { exit } from 'process';


@Component({
  selector: 'app-price-book-list',
  templateUrl: './price-book-list.component.html',
  styleUrls: ['./price-book-list.component.css'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ]
})
export class PriceBookListComponent extends ListComponentBase implements OnInit {

  public priceListForm: FormGroup;
  priceLists: PriceList[] = [];


  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private dialog: MatDialog,
    private notifySer: NotifierService,
    private priceListSer: PriceListService,
    private priceListProductSer: PriceListProductService,
    private warehouseProductService: WarehouseProductService,
    private productSer: ProductService,

  ) {
    super();
  }

  @ViewChild(MatTable, { static: true }) table: MatTable<any>;
  @ViewChild('selectColumn') selectColumn;


  apiFilter: WarehouseProductFilter;

  selectProduct = new FormControl();
  data: WarehouseProduct[] = [];
  productDataSource = new MatTableDataSource<WarehouseProduct>([]);

  filteredProducts: Observable<Product[]>;

  form: FormGroup;
  columnsHeader = {
    '#': '#',
    'product_no': 'Mã hàng',
    'product_name': 'Tên hàng',
  };

  productTypeLable = {
    'medicine': 'Thuốc',
    'merchandise': 'Hàng hóa',
  };

  displayedColumns: string[] = ['#', 'product_no', 'product_name'];
  columnsToDisplay: string[] = ['#', 'product_no', 'product_name'];

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  isLoadingResults = false;
  isRateLimitReached = false;



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
    filter.expand = 'medicine,productPlacements,group,images';
    return filter;
  }

  initPriceListForm() {
    this.priceListForm = this.fb.group({
      priceLists: [[]],
    });
  }


  loadData(): void {
    this.isLoadingResults = true;
    this.warehouseProductService.getList(this.apiFilter).subscribe(res => {
      this.data = res.body;
      this.productDataSource = new MatTableDataSource<WarehouseProduct>(this.data);
      this.reloadFilter(res);
      this.isLoadingResults = false;
    });
  }


  ngOnInit() {
    const priceListFilter = new PriceListFilter();
    this.priceListSer.getList(priceListFilter).subscribe(res => {
      this.priceLists = res.body;
    });
    this.initPriceListForm();

    const date = new FormControl(new Date());
    this.form = this.fb.group({
      date: date,
      no: [null],
      supplier: [null, Validators.required],
      status: [null],
      quantity: [null],
      total_amount: [null],
      total_discount: [null],
      paid_amount: [null],
      remain_amount: [null],
      note: [null],
    });


    this.apiFilter = this.buildFilterFromParams();
    // this.loadData();


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


  openCreatePriceListFormDialog() {
    const dialogRef = this.dialog.open(CreatePriceListFormDialogComponent, {});

    dialogRef.afterClosed().subscribe(result => {
      if (result !== false && result !== undefined) {
        this.priceLists.push(result);
        const curSelects = this.priceListForm.controls['priceLists'].value;
        curSelects.push(result.id);
        this.priceListForm.patchValue({ priceLists: curSelects });
      }
    });
  }

  // inputSearch(event: any) {
  //   this.key_work = event.target.value;
  //   this.apiFilter = this.buildFilterFromParams();
  //   this.loadData();
  // }

  onSelectedProduct(product) {
    let aPriceLists = this.priceListForm.controls['priceLists'].value;
    if (aPriceLists.length <= 0) {
      this.notifySer.notify('warning', 'Chưa chọn bảng giá!');
      this.selectProduct.patchValue(null);
      return;
    }


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

  recalculateWarehouse() {
    let quantity = 0;
    let discount = 0;
    let amount = 0;
    const paidAmount = this.form.controls['paid_amount'].value;

    this.data.forEach(item => {
      quantity = quantity + item['quantity'];
      discount = discount + item['discount'];
      amount = amount + item['amount'];
    });
    const remainAmount = paidAmount - amount;

    this.form.patchValue({
      quantity: quantity,
      total_amount: amount,
      total_discount: discount,
      remain_amount: remainAmount,
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
