import { MediaMatcher } from '@angular/cdk/layout';
import { Router } from '@angular/router';
import { FormControl } from '@angular/forms';
import {
  ChangeDetectorRef,
  Component,
  NgZone,
  OnDestroy,
  ViewChild,
  HostListener,
  Directive,
  ElementRef,
  OnInit,
} from '@angular/core';

import { MenuItems } from '../../shared/menu-items/menu-items';

import { PerfectScrollbarConfigInterface } from 'ngx-perfect-scrollbar';
import { Observable } from 'rxjs';
import { Product } from '../../product/product.model';
import { PriceListFilter } from '../../price-book/price-list.model';
import {
  catchError,
  debounceTime,
  map,
  startWith,
  switchMap,
} from 'rxjs/operators';
import { of } from 'rxjs/internal/observable/of';
import { PriceListService } from '../../price-book/price-list.service';
import { ProductService } from '../../product/product.service';
import { OrderService } from '../../sale/order.service';
import { ItemInvoice } from '../../sale/order.model';
import { NotifierService } from 'angular-notifier';
import { SamplePrescriptionService } from '../../sample-prescription/sample-prescription.service';
import { element } from 'protractor';
import { CustomerService } from '../../customer/customer.service';
import {StoreService} from '../../store/store.service';

/** @title Responsive sidenav */
@Component({
  selector: 'app-cart-layout',
  templateUrl: './cart.component.html',
  // styleUrls: ['./cart.component.css'],
})
export class CartComponent implements OnInit, OnDestroy {
  mobileQuery: MediaQueryList;
  dir = 'ltr';
  green: boolean = true;
  blue: boolean = false;
  dark: boolean;
  minisidebar: boolean;
  boxed: boolean;
  danger: boolean = false;
  showHide: boolean;
  sidebarOpened;
  placeholderSearch = 'Tìm sản phẩm (F3)';
  iconChangeType = 'cached';
  public showSearch = false;

  public config: PerfectScrollbarConfigInterface = {};
  private _mobileQueryListener: () => void;

  selectProduct = new FormControl();
  public filteredProducts: Observable<Product[]>;
  public productsHistory: Observable<Product[]>;
  listmItemInvoice: ItemInvoice[] = [];

  //
  activeLink = 0;

  storeId: number;

  amountProduct = 1;

  public storeDetail: object = null;
  logo = 'assets/images/Rx20_16x16_op1-1207.png';

  @ViewChild('inputSearch') inputSearch: ElementRef;

  constructor(
    changeDetectorRef: ChangeDetectorRef,
    media: MediaMatcher,
    public menuItems: MenuItems,
    public router: Router,
    private orderService: OrderService,
    private productSer: ProductService,
    private samplePrescriptionService: SamplePrescriptionService,
    private priceListSer: PriceListService,
    private notifySer: NotifierService,
    private storeSer: StoreService,
    protected customerService: CustomerService
  ) {
    this.mobileQuery = media.matchMedia('(min-width: 768px)');
    this._mobileQueryListener = () => changeDetectorRef.detectChanges();
    this.mobileQuery.addListener(this._mobileQueryListener);
  }

  ngOnDestroy(): void {
    this.mobileQuery.removeListener(this._mobileQueryListener);
  }

  ngOnInit(): void {
    this.customerService.getNameStore(0).subscribe(res => {
      this.storeId = Number(res);
    });

    this.orderService.subscribeObjectListInvoice.subscribe(listInvoice => {
      const listItemInvoice = listInvoice.itemInvoice;
      this.listmItemInvoice = [];
      // tslint:disable-next-line:no-shadowed-variable
      listItemInvoice.forEach(element => {
        if (element.active === true) {
          this.activeLink = element.invoice_id;
        }
        this.listmItemInvoice.push(element);
      });
    });

    this.filteredProducts = this.selectProduct.valueChanges.pipe(
      startWith(''),
      // delay emits
      debounceTime(300),
      // use switch map so as to cancel previous subscribed events, before creating new once
      switchMap(value => {
        if (value !== '') {
          // lookup from github
          if (this.iconChangeType === 'assignment') {
            return this.lookupSamplePrescription(value);
          } else {
            return this.lookupProduct(value);
          }
        } else {
          // if no value is present, return null
          return of(null);
        }
      })
    );

    this.storeSer.getDetail().subscribe(res => {
      this.storeDetail = res;
      if (this.storeDetail['features'].indexOf('logo') >= 0 && this.storeDetail['logo'] !== null) {
        this.logo = this.storeDetail['logo'];
      }
    });
  }

  /**
   * Tim kiem san pham
   * @param value
   */
  lookupProduct(value: string): Observable<Product[]> {
    return this.productSer.autocompleteUnits(value).pipe(
      debounceTime(300),
      // map the item property of the github results as our return object
      map(results => {
        return results;
      }),
      // catch errors
      catchError(_ => {
        return of(null);
      })
    );
  }

  /**
   * Tim kiem lich su san pham
   * @param arr
   */
  lookupProductByHistory(arr: []): Observable<Product[]> {
    return this.productSer.autocompleteUnitsByIds(arr).pipe(
      // map the item property of the github results as our return object
      map(results => {
        return results;
      }),
      // catch errors
      catchError(_ => {
        return of(null);
      })
    );
  }

  /**
   * Don thuoc mau
   * @param value
   */
  lookupSamplePrescription(value: string): Observable<Product[]> {
    return this.samplePrescriptionService.autocomplete(value).pipe(
      debounceTime(300),
      // map the item property of the github results as our return object
      map(results => {
        return results;
      }),
      // catch errors
      catchError(_ => {
        return of(null);
      })
    );
  }

  /**
   * chon tim kiem
   * @param product
   */
  onSelectedProduct(product) {
    if (this.amountProduct === null) {
      this.amountProduct = 1;
    }

    if (this.iconChangeType === 'cached') {
      // tim san pham

      this.orderService.pushHistorySearch(product, product.store_id);

      if (
        product['quantity_of_stock'] > 0 &&
        product['quantity_of_stock'] >= this.amountProduct
      ) {
        this.handlePriceListProduct(product);
      } else {
        this.notifySer.notify('warning', 'Không đủ tồn kho.');
      }
      // console.log(product);
    } else {
      /**
       * product.id  === sample.id
       */
      this.samplePrescriptionService
        .getDetailForCart(product.id)
        .subscribe(res => {
          // tslint:disable-next-line:no-shadowed-variable
          res.forEach(element => {
            // console.log(element);
            this.handlePriceListProduct(element);
          });
        });
    }
    this.selectProduct.patchValue(null);
    this.inputSearch.nativeElement.blur(); // un focus
  }

  handlePriceListProduct(product: Product) {
    let units = product.productUnits;
    // tslint:disable-next-line:no-shadowed-variable
    units.forEach(element => {
      element.quantity_of_stock = Math.floor(
        product.quantity_of_stock / element.value
      );
    });
    // tslint:disable-next-line:no-shadowed-variable
    units = units.filter(element => element.quantity_of_stock > 0);
    product.productUnits = units;

    this.orderService.addProduct(product, this.amountProduct);
  }

  addInvoice() {
    this.orderService.addNewInvoice();
  }

  deleteInvoice(invoice_id: number) {
    this.orderService.deleteInvoice(invoice_id);
  }

  activeInvoice(invoice_id: number) {
    this.orderService.activeInvoice(invoice_id);
  }

  // Mini sidebar
  changeTypeSearch() {
    if (this.iconChangeType === 'assignment') {
      this.selectProduct.patchValue(null);
      this.placeholderSearch = 'Tìm sản phẩm';
      this.iconChangeType = 'cached';
      this.notifySer.notify('success', 'Tìm kiếm theo sản phẩm.');
    } else {
      this.selectProduct.patchValue(null);
      this.placeholderSearch = 'Tìm đơn thuốc mẫu';
      this.iconChangeType = 'assignment';
      this.notifySer.notify('success', 'Tìm kiếm đơn thuốc mẫu.');
    }
  }

  focusInputSearch(event) {
    if (this.selectProduct.value === '' || this.selectProduct.value === null) {
      if (this.iconChangeType === 'cached') {
        // tim thuoc
        const data = this.orderService.getHistorySearch(this.storeId);
        // console.log(data);
        this.productsHistory = this.lookupProductByHistory(data);
      }
    }
  }

  @HostListener('window:keydown', ['$event'])
  keyEvent(event: KeyboardEvent) {
    if (event.keyCode === 114) {
      event.preventDefault();
      this.inputSearch.nativeElement.focus();
    }
  }
}
