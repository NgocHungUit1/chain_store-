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
import { PriceListProduct, PriceListProductFilter } from '../price-list-product.model';
import { Product } from '../../product/product.model';
import { Observable } from 'rxjs/index';
import { ProductService } from '../../product/product.service';
import { of } from 'rxjs/internal/observable/of';
import { catchError, debounceTime, map, startWith, switchMap } from 'rxjs/operators';
import { exit } from 'process';
import { element } from 'protractor';
import { resolve } from 'dns';
import { rejects } from 'assert';
import { SetupCommonPriceDialogComponent } from '../setup-common-price-dialog/setup-common-price-dialog.component';


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
  public priceListCommon: PriceList;
  public priceListChoose: PriceList;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private dialog: MatDialog,
    private notifySer: NotifierService,
    private priceListSer: PriceListService,
    private priceListProductSer: PriceListProductService,
    private productSer: ProductService,

  ) {
    super();
  }

  @ViewChild(MatTable, { static: true }) table: MatTable<any>;
  @ViewChild('selectColumn') selectColumn;


  apiFilter: PriceListProductFilter;

  selectProduct = new FormControl();
  data: PriceListProduct[] = [];
  productDataSource = new MatTableDataSource<PriceListProduct>([]);

  filteredProducts: Observable<Product[]>;
  form: FormGroup;
  columnsHeader = {
    '#': '#',
    'product_no': 'Mã hàng',
    'product_name': 'Tên hàng',
    'original_price': 'Giá vốn',
    'sell_price': 'Giá bán',
    'actions': 'X',
    'price': 'Giá chung',
  };

  productTypeLable = {
    'medicine': 'Thuốc',
    'merchandise': 'Hàng hóa',
  };

  displayedColumns: string[] = ['actions', '#', 'product_no', 'product_name', 'original_price', 'sell_price', 'price'];
  columnsToDisplay: string[] = ['#', 'product_no', 'product_name', 'original_price', 'sell_price', 'actions', 'price'];

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  isLoadingResults = false;
  isRateLimitReached = false;



  buildFilterFromParams(): PriceListProductFilter {
    function write<K extends keyof PriceListProductFilter>(arg: PriceListProductFilter, key: K, value: PriceListProductFilter[K]): void {
      arg[key] = value;
    }
    const aPriceLists = this.priceListForm.controls['priceLists'].value;
    this.setPriceListChoose(aPriceLists); // luu cho bien price list chon

    const filter = new PriceListProductFilter();
    const objectKeys = Object.keys(filter) as Array<keyof PriceListProductFilter>;

    for (const attr of objectKeys) {
      write(filter, attr, this.route.snapshot.queryParams['PriceListProductSearch[' + attr + ']']);
    }

    filter.price_list_id = aPriceLists;
    filter.page = this.route.snapshot.queryParams['page'];
    filter.pageSize = this.route.snapshot.queryParams['pageSize'];
    filter.sort = this.route.snapshot.queryParams['sort'];
    filter.expand = 'product';
    return filter;
  }

  setPriceListChoose(value: string) {
    if (value !== this.priceListCommon.id) {
      const list = this.priceLists;
      const result = list.filter(item => item.id === value);
      this.priceListChoose = result[0];
    } else {
      this.priceListChoose = null;
    }
  }
  initPriceListForm() {
    this.priceListForm = this.fb.group({
      priceLists: [null],
    });
  }

  loadData(): void {
    this.isLoadingResults = true;
    this.priceListProductSer.getList(this.apiFilter).subscribe(res => {
      this.data = res.body;
      this.productDataSource = new MatTableDataSource<PriceListProduct>(this.data);
      this.reloadFilter(res);
      this.isLoadingResults = false;
    });
  }


  ngOnInit() {
    const priceListFilter = new PriceListFilter();
    this.initPriceListForm();

    this.priceListSer.getList(priceListFilter).subscribe(res => {
      this.priceLists = res.body;
      this.priceLists.forEach((element, index) => {
        if (element.is_default === 1) {
          this.priceListForm.patchValue({
            priceLists: element.id,
          });
          this.priceListCommon = element;
        }

      });
      this.apiFilter = this.buildFilterFromParams();
      this.loadData();

    });

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
    const dialogRef = this.dialog.open(CreatePriceListFormDialogComponent, {
      width: '40%',
      minHeight: '80%',
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result !== false && result !== undefined) {
        this.priceLists.push(result);
        const curSelects = this.priceListForm.controls['priceLists'].value;
        curSelects.push(result.id);
        this.priceListForm.patchValue({ priceLists: curSelects });
      }
    });
  }

  choosePriceList(event: any) {
    this.apiFilter = this.buildFilterFromParams();
    this.loadData();
  }

  onSelectedProduct(product) {
    const priceListID = this.priceListForm.controls['priceLists'].value;

    if (priceListID === undefined) {
      this.notifySer.notify('warning', 'Chưa chọn bảng giá!');
    } else {
      this.handlePriceListProduct(product, priceListID);
    }
    this.selectProduct.patchValue(null);
  }

  handlePriceListProduct(product: any, priceListID: any) {
    this.priceListProductSer.exist(product.id, priceListID).subscribe(result => {
      if (result === false) {
        const mPriceListProduct = new PriceListProduct();
        mPriceListProduct.product_id = product.id;
        mPriceListProduct.price_list_id = priceListID;
        mPriceListProduct.price = product.sell_price;

        this.priceListProductSer.create(mPriceListProduct).subscribe(mPriceListProduct => {
          this.notifySer.notify('success', 'Cập nhật thuốc thành công!');
        });
        this.apiFilter = this.buildFilterFromParams();
        this.loadData();
      } else {
        this.notifySer.notify('warning', 'Đã tồn tại !');
      }
    });
  }

  removeProduct(id) {
    this.priceListProductSer.delete(id).subscribe(product => {
      this.notifySer.notify('success', 'Xóa thành công!');
      this.apiFilter = this.buildFilterFromParams();
      this.loadData();
    });
  }

  savePrice(event: any, element) {
    console.log((event.target.value));
    element['price'] = Number(event.target.value);
    this.priceListProductSer.update(element.id, element).subscribe(element => {
      this.notifySer.notify('success', 'Lưu thành công!');
      this.apiFilter = this.buildFilterFromParams();
      this.loadData();
    });
  }

  dialogSetUpCommonPrice(data, pageTotalCount) {
    data.pageTotalCount = pageTotalCount;
    const dialogRef = this.dialog.open(SetupCommonPriceDialogComponent, {
      data: data,
      width: '45%',
      minHeight: '80%',
    });

    dialogRef.afterClosed().subscribe(result => {
      this.apiFilter = this.buildFilterFromParams();
      this.loadData();
    });

  }

}
