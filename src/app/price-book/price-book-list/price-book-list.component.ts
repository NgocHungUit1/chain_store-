import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
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
import { SetupCommonPriceDialogComponent } from '../setup-common-price-dialog/setup-common-price-dialog.component';
import * as xlsx from 'xlsx';
import { ConfirmationDialogComponent } from '../../shared/confirmation-dialog/confirmation-dialog.component';
import { PopupConfirmDialogComponent } from '../../common/popup-confirm-dialog/popup-confirm-dialog.component';


@Component({
  selector: 'app-price-book-list',
  templateUrl: './price-book-list.component.html',
  styleUrls: ['./price-book-list.component.css'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({height: '0px', minHeight: '0'})),
      state('expanded', style({height: '*'})),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ]
})
export class PriceBookListComponent extends ListComponentBase implements OnInit {

  @ViewChild('epltable', {static: false}) epltable: ElementRef;

  public priceListForm: FormGroup;
  public priceLists: PriceList[] = [];
  public priceListCommon: PriceList;
  public priceListChoose: PriceList; // luu tru bang gia dang chon neu la bang gia chung se la null
  public priceListProductCommonExist = []; // dung cho truong hop chon 1 bang gia khac bang gia chung

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

  @ViewChild(MatTable, {static: true}) table: MatTable<any>;
  @ViewChild('selectColumn') selectColumn;


  apiFilter: PriceListProductFilter;
  private previousTextSearch: string = null;

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
    'base_unit': 'Đơn vị',
    'actions': 'X',
    'price': 'Giá chung',
    'common': 'Giá chung',
  };

  productTypeLable = {
    'medicine': 'Thuốc',
    'merchandise': 'Hàng hóa',
  };

  displayedColumns: string[] = ['actions', '#', 'product_no', 'product_name', 'base_unit', 'original_price', 'sell_price', 'price'];
  // columnsToDisplay: string[] = ['#', 'product_no', 'product_name', 'original_price', 'sell_price', 'actions', 'price', 'price'];

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  isLoadingResults = false;
  isRateLimitReached = false;

  dataExports: Object[];
  namePriceListChoose: string;

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
    filter.expand = 'product,pricelistproduct,productUnit';
    filter.textSearchProduct = this.priceListForm.controls['textSearchProduct'].value;
    return filter;
  }

  setPriceListChoose(value: string) {
    if (value !== this.priceListCommon.id) {
      const list = this.priceLists;
      const result = list.filter(item => item.id === value);
      this.priceListChoose = result[0];
      this.displayedColumns = ['actions', '#', 'product_no', 'product_name', 'base_unit', 'original_price', 'sell_price', 'common', 'price'];
    } else {
      this.priceListChoose = null;
      this.displayedColumns = ['actions', '#', 'product_no', 'product_name', 'base_unit', 'original_price', 'sell_price', 'price'];
    }
  }

  initPriceListForm() {
    this.priceListForm = this.fb.group({
      priceLists: [null],
      textSearchProduct: [null],
    });
  }

  loadData(): void {
    this.isLoadingResults = true;
    this.priceListProductSer.getList(this.apiFilter).subscribe(res => {
      // truong hop khong phai bang gia chung
      const list = res.body;
      if (this.priceListChoose !== null && Array.isArray(list)) {
        // console.log(list);

        const listProductUnitIdChoose = list.map(obj => obj.product_unit_id);
        const common_id = this.priceListCommon.id;
        // tien hanh xu ly add common vao list
        this.priceListProductSer.getListProductCommon(common_id, listProductUnitIdChoose).subscribe(resCommon => {
          if (Array.isArray(resCommon)) {
            this.priceListProductCommonExist = resCommon;
            this.data = res.body;
            // debugger;
            // code group array by key
            const group = this.priceListProductCommonExist.reduce((r, a) => {
              r[a.product_unit_id] = [...r[a.product_unit_id] || [], a];
              return r;
            }, {});
            // add common || null
            this.data.forEach(elementData => {
              if (group[elementData.product_unit_id] !== undefined) {
                elementData.common = group[elementData.product_unit_id][0];
              } else {
                elementData.common = null;
              }
            });
          } else {
            this.data = res.body;
          }
          this.productDataSource = new MatTableDataSource<PriceListProduct>(this.data);
          this.reloadFilter(res);
          this.isLoadingResults = false;
        });
      } else {
        this.data = res.body;
        this.productDataSource = new MatTableDataSource<PriceListProduct>(this.data);
        this.reloadFilter(res);
        this.isLoadingResults = false;
      }


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

    this.priceListForm.valueChanges.subscribe(res => {
      console.log(res);
      this.priceLists.forEach(element => {
        if (element.id == res.priceLists) {
          this.namePriceListChoose = element.name;
        }
      });

      if (res.textSearchProduct !== this.previousTextSearch) {
        this.previousTextSearch = res.textSearchProduct;
        this.apiFilter = this.buildFilterFromParams();
        this.loadData();
      }
    });
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

  createPriceListFormDialog() {
    const obj = {
      title: 'Thêm bảng giá',
      priceListChoose: this.priceListChoose,
      action: 'create',
    };
    const dialogRef = this.dialog.open(CreatePriceListFormDialogComponent, {
      data: obj,
      width: '40%',
      minWidth: '600px',
    });

    dialogRef.afterClosed().subscribe(result => {

      if (result !== false && result !== undefined) {
        this.priceListChoose = result;
        this.priceLists.push(result);
        this.priceListForm.patchValue({
          priceLists: result.id,
        });
        this.apiFilter = this.buildFilterFromParams();
        this.loadData();
      }

    });
  }

  updateAllProduct() {
    const priceListID = this.priceListForm.controls['priceLists'].value;
    this.priceListSer.updateAll(priceListID).subscribe(res => {
      if (res === true) {
        this.notifySer.notify('success', 'Thêm tất cả sản phẩm thành công!');
        this.loadData();
      }
    });

  }

  /**
   * https://levelup.gitconnected.com/export-data-to-excel-sheet-in-angular-8-7a8e0342643d
   */
  exportExcel() {

    const priceListID = this.priceListForm.controls['priceLists'].value;
    this.priceListSer.exportExcel(priceListID).subscribe(res => {
      this.handleExcel(res);
    });
  }

  /**
   * chua tim dc cach xu ly tot hon
   */
  async handleExcel(res) {
    await this.setDataExports(res);
    setTimeout(() => {
      this.downloadExcel();
    }, 800);
    // await this.downloadExcel();
  }

  setDataExports(res) {
    this.dataExports = res;
    return true;
  }

  downloadExcel() {
    const ws: xlsx.WorkSheet = xlsx.utils.table_to_sheet(this.epltable.nativeElement);
    const wb: xlsx.WorkBook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(wb, ws, 'Bảng giá');
    xlsx.writeFile(wb, this.namePriceListChoose + '.xlsx');
  }

  updatePriceListFormDialog() {
    const obj = {
      title: 'Sửa bảng giá',
      priceListChoose: this.priceListChoose,
      action: 'update',
    };
    const dialogRef = this.dialog.open(CreatePriceListFormDialogComponent, {
      data: obj,
      width: '40%',
      minHeight: '80%',
    });

    // @NGHIA chua thay doi sau khi luu
    dialogRef.afterClosed().subscribe(result => {
      if (result !== false && result !== undefined) {

        this.priceListChoose = result;
        this.priceLists.forEach((element, index) => {
          if (element.id === result.id) {
            this.priceLists[index] = result;
          }
        });

        this.apiFilter = this.buildFilterFromParams();
        this.loadData();
      }

    });
  }

  choosePriceList() {
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
    let units = product?.productUnits;
    units.forEach(element => {
      this.priceListProductSer.exist(product.id, element.id, priceListID).subscribe(result => {
        if (result === false) {
          const mPriceListProduct = new PriceListProduct();
          mPriceListProduct.product_id = product.id;
          mPriceListProduct.price_list_id = priceListID;
          mPriceListProduct.price = element.sell_price;
          mPriceListProduct.product_unit_id = element.id;

          this.priceListProductSer.create(mPriceListProduct).subscribe(mPriceListProduct => {
            this.notifySer.notify('success', 'Thêm thành công!');
            this.apiFilter = this.buildFilterFromParams();
            this.loadData();
          });

        } else {
          this.notifySer.notify('warning', 'Đã tồn tại !');
        }
      });
    });

  }

  removeProduct(id) {
    const dialogRef = this.dialog.open(PopupConfirmDialogComponent, {
      data: {
        action: 'Delete',
        title: 'Xác nhận xóa?',
        content: 'Bạn có chắc chắn muốn xóa sản phẩm này khỏi bảng giá không?',
      },
      width: '30%',
      minHeight: '60%',
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result?.event ==='confirm') {
        this.priceListProductSer.delete(id).subscribe(product => {
          this.notifySer.notify('success', 'Xóa thành công!');
          this.apiFilter = this.buildFilterFromParams();
          this.loadData();
        });
      }
    });
  }

  savePrice(event: any, element) {
    const price = Number(event.target.value);
    if (price < 0) {
      this.notifySer.notify('warning', 'Giá không được nhỏ hơn 0!');
      event.target.value = element['price'];
      return;
    }
    element['price'] = price;
    this.priceListProductSer.update(element.id, element).subscribe(element => {
      this.notifySer.notify('success', 'Lưu thành công!');
      this.apiFilter = this.buildFilterFromParams();
      this.loadData();
    });
  }

  dialogSetUpCommonPrice(data, pageTotalCount, element_common_price) {
    data.pageTotalCount = pageTotalCount;
    data.price_list_common_id = this.priceListCommon.id;
    data.element_common_price = element_common_price;

    const dialogRef = this.dialog.open(SetupCommonPriceDialogComponent, {
      data: data,
      width: '45%',
      minWidth: '750px',
    });

    dialogRef.afterClosed().subscribe(result => {
      this.apiFilter = this.buildFilterFromParams();
      this.loadData();
    });

  }

  addNewCommonPrice(element) {
    const mPriceListProduct = new PriceListProduct();
    mPriceListProduct.product_id = element.product_id;
    mPriceListProduct.price_list_id = this.priceListCommon.id;
    mPriceListProduct.price = element.productUnit?.sell_price;
    mPriceListProduct.product_unit_id = element.productUnit?.id;

    this.priceListProductSer.create(mPriceListProduct).subscribe(mPriceListProduct => {
      this.notifySer.notify('success', 'Thêm vào bảng giá chung thành công!');
      this.apiFilter = this.buildFilterFromParams();
      this.loadData();
    });

  }

}
