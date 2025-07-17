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
import { NationalPrescription } from '../../national-prescription/national-prescription.model';
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
import { NationalPrescriptionService } from '../../national-prescription/national-prescription.service';


import { element } from 'protractor';
import { CustomerService } from '../../customer/customer.service';
import {StoreService} from '../../store/store.service';
import {OptionStoreService} from '../../common/option-store.service';
import { AuthService } from '../../authentication/auth.service';
import { MatSidenav } from '@angular/material/sidenav';
import { SaleColumnVisibilityService } from '../../shared/sale-column-visibility.service';
import { MatAutocompleteTrigger } from '@angular/material/autocomplete';

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
  barcode: string;
  isAnimating = false;
  public showSearch = false;

  public config: PerfectScrollbarConfigInterface = {};
  private _mobileQueryListener: () => void;

  selectProduct = new FormControl();
  public filteredProducts: Observable<any[]>;
  public productsHistory: Observable<Product[]>;
  listmItemInvoice: ItemInvoice[] = [];

  selectedProductValue: Product

  //
  activeLink = 0;

  storeId: number;

  amountProduct = 1;

  searchMode = false;

  public storeDetail: object = null;
  logo = 'assets/images/Rx20_16x16_op1-1207.png';

  public showProductImage:    boolean = true;  // maps to key 'image'
  public showProductCode:     boolean = true;  // maps to key 'product_no'
  public showSalePrice:       boolean = true;  // maps to key 'price'
  public showDiscount:        boolean = true;  // maps to key 'discount'
  public allowEditAsMoney:    boolean = true;  // maps to key 'edit_as_money'
  public showLastSalePrice:   boolean = true;  // maps to key 'last_sale_price'
  public allowAddRow:         boolean = true;  // maps to key 'add_row'
  public allowQuantityOfStock:         boolean = false;  // maps to key 'quantity_of_stock'
  public enableNote:          boolean = false;  // maps to key 'note'

  @ViewChild('inputSearch') inputSearch: ElementRef;
  @ViewChild('inputQuantity') inputQuantity: ElementRef;
  @ViewChild('end') settingsSidenav: MatSidenav;
  @ViewChild('visibilitySidenav') visibilitySidenav: MatSidenav;
  @ViewChild(MatAutocompleteTrigger) autocompleteTrigger: MatAutocompleteTrigger;

  canNegativeStock: boolean = false;

  constructor(
    changeDetectorRef: ChangeDetectorRef,
    media: MediaMatcher,
    public menuItems: MenuItems,
    public router: Router,
    private orderService: OrderService,
    private productSer: ProductService,
    private samplePrescriptionService: SamplePrescriptionService,
    private nationalPrescriptionService: NationalPrescriptionService,
    private priceListSer: PriceListService,
    private notifySer: NotifierService,
    private optionStoreService: OptionStoreService,
    private storeSer: StoreService,
    private authSer: AuthService,
    private route: Router,
    public saleColumnVisibilityService: SaleColumnVisibilityService,
    protected customerService: CustomerService,
  ) {
    this.mobileQuery = media.matchMedia('(min-width: 768px)');
    this._mobileQueryListener = () => changeDetectorRef.detectChanges();
    this.mobileQuery.addListener(this._mobileQueryListener);

    this.optionStoreService.getValue('sale_negative_stock').subscribe(res => {
      this.canNegativeStock = res.value === 'yes';
    });
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
        if(typeof value == 'object') value = '';
        value = (value || '').trim();
        if (value !== '') {
          // lookup from github
          switch(this.iconChangeType) {
            case 'assignment':
              return this.lookupSamplePrescription(value);
            case 'nation':
              return this.lookupNationalPrescription(value);
            case 'cached':
              return this.lookupProduct(value);
            default:
              return [];
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

    // Seed each local boolean from the service’s current map:
    this.showProductImage    = this.saleColumnVisibilityService.isColumnVisibleNow('image');
    this.showProductCode     = this.saleColumnVisibilityService.isColumnVisibleNow('product_no');
    this.showSalePrice       = this.saleColumnVisibilityService.isColumnVisibleNow('price');
    this.showDiscount        = this.saleColumnVisibilityService.isColumnVisibleNow('discount');
    this.allowEditAsMoney    = this.saleColumnVisibilityService.isColumnVisibleNow('edit_as_money');
    this.showLastSalePrice   = this.saleColumnVisibilityService.isColumnVisibleNow('last_sale_price');
    this.allowAddRow         = this.saleColumnVisibilityService.isColumnVisibleNow('add_row');
    this.allowQuantityOfStock         = this.saleColumnVisibilityService.isColumnVisibleNow('quantity_of_stock');
    this.enableNote         = this.saleColumnVisibilityService.isColumnVisibleNow('note');
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
   * Search national prescription
   * @param value
   * @returns
   */
  lookupNationalPrescription(value: string): Observable<NationalPrescription[]> {
    return this.nationalPrescriptionService.autocomplete(value).pipe(
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

    if(this.searchMode){
      this.selectedProductValue = product;
      this.inputQuantity.nativeElement.select();
      return;
    }

    this.addProduct(product);

    this.selectProduct.patchValue(null);
    this.inputSearch.nativeElement.blur(); // un focus
  }

  getListProducts() {
    let mItemInvoice = new ItemInvoice();
    this.orderService.subscribeObjectListInvoice.subscribe(ListInvoice => {
      const listItemInvoice = ListInvoice.itemInvoice;
      listItemInvoice.forEach(element => {
        if (element.active === true) {
          mItemInvoice = element;
        }
      });
    });
    return mItemInvoice.listProduct;
  }

  addProduct(product, amountProduct = 1){

    const listProducts = this.getListProducts();
    const existingQuantity = listProducts?.find(item=>item.product_id == product.id)?.amount ?? 0;

    switch(this.iconChangeType) {
      case 'cached':
        // tim san pham
        this.orderService.pushHistorySearch(product, product.store_id);

        console.log(this.canNegativeStock);
        if (
          this.canNegativeStock || (product['quantity_of_stock'] > 0 &&
          product['quantity_of_stock'] >= amountProduct + existingQuantity
        )) {
          product.amount = amountProduct;
          this.handlePriceListProduct(product);
        } else {
          this.notifySer.notify('warning', 'Không đủ tồn kho.');
        }
        this.resetUserInput();
        break;
      case 'assignment':
        /**
         * product.id  === sample.id
         */
        this.samplePrescriptionService
        .getDetailForCart(product.id)
        .subscribe(res => {
          this.orderService.setOrderSumPrice(res['total_amount']);
          // tslint:disable-next-line:no-shadowed-variable
          res['items'].forEach(element => {
            // console.log(element);
            element.amount*= amountProduct
            this.handlePriceListProduct(element, product.id);
          });
          this.resetUserInput();
        });
        break;
      case 'nation':
        this.nationalPrescriptionService
        .addToCart(product.nationalPrescriptionId)
        .subscribe(res => {
          this.orderService.addNationalPrescriptionInvoice(product.prescriptionId, product.nationalPrescriptionId);
          res.forEach(element => {
            this.handlePriceListProduct(element);
          });
          this.resetUserInput();
        });
        break;
      default:
    }
  }

  handlePriceListProduct(product: Product, samplePrescriptionId = null) {
    product.amount = parseInt(String(product.amount), 10);
    if (!Number.isInteger(product.amount)) {
      product.amount = 1;
    }

    let units = product.productUnits;
    // tslint:disable-next-line:no-shadowed-variable
    units.forEach(element => {
      element.quantity_of_stock = Math.floor(
        product.quantity_of_stock / element.value
      );
    });
    product.productUnits = units;
    this.orderService.addProduct(product, product.amount, samplePrescriptionId);
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
  changeTypeSearch(currentSearchType) {
    switch(currentSearchType) {
      case 'cached':
        this.selectProduct.patchValue(null);
        this.placeholderSearch = 'Tìm đơn thuốc mẫu';
        this.iconChangeType = 'assignment';
        this.notifySer.notify('success', 'Tìm kiếm đơn thuốc mẫu.');
        break;
      case 'assignment':
        this.selectProduct.patchValue(null);
        this.placeholderSearch = 'Tìm đơn thuốc quốc gia';
        this.iconChangeType = 'nation';
        this.notifySer.notify('success', 'Tìm kiếm đơn thuốc quốc gia.');
        break;
      case 'nation':
        this.selectProduct.patchValue(null);
        this.placeholderSearch = 'Tìm sản phẩm';
        this.iconChangeType = 'cached';
        this.notifySer.notify('success', 'Tìm kiếm theo sản phẩm.');
        break;
      default:
    }
  }

  focusInputSearch(event) {
    if (this.selectProduct.value === '' || this.selectProduct.value === null) {
      if (this.iconChangeType === 'cached') {
        // tim thuoc
        const data = this.orderService.getHistorySearch(this.storeId);
        if (data) {
          this.productsHistory = this.lookupProductByHistory(data);
        }
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

  focusInput() {
    // This will programmatically focus the input field
    this.inputSearch.nativeElement.focus();

    this.searchMode = !this.searchMode;
    // this.selectedProducts = [];
  }

  onQuantityEnter() {
    // Read input value directly from native element and parse to int
    const val = this.inputQuantity.nativeElement.value;
    const parsedAmount = parseInt(val, 10);

    if (!parsedAmount || parsedAmount < 1) {
      this.amountProduct = 1;
    } else {
      this.amountProduct = parsedAmount;
    }

    console.log('onQuantityEnter - final amountProduct:', this.amountProduct);

    this.addProduct(this.selectedProductValue, this.amountProduct);
  }

  resetUserInput(){
    this.selectedProductValue = null;
    this.selectProduct.patchValue(null);
    this.amountProduct = 1;
    this.inputSearch.nativeElement.focus();
  }

  displayProductFn(product: any): string {
    if (!product) return ''; // Handle null/undefined
    return product.product_name; // Show only the product name
  }


  onkeydown($event) {
    // Check if not bar code, return
    if (isNaN($event.target.value) || $event.target.value.length < 8) {
      return;
    }
    this.barcode = $event.target.value;
    // console.log(this.barcode);
    this.productSer.addproductBarcode(this.barcode).subscribe(res => {
      // console.log(res);
      if (res['errors']) {
        this.notifySer.notify('warning', res['errors']);
      }
      if (res !== null) {
        if (this.amountProduct === null) {
          this.amountProduct = 1;
        }

        if (this.searchMode) {
          this.selectedProductValue = res;
          // this.inputQuantity.nativeElement.focus();
          this.inputQuantity.nativeElement.select();
          return;
        } else {
          this.handlePriceListProduct(res);
        }
      }
      this.autocompleteTrigger.closePanel();
    });
    $event.target.value = '';
  }

  logout() {
    this.authSer.logout().subscribe((res) => {
      if (res) {
        this.route.navigate(['/', 'authentication', 'login']);
      }
    });
  }

  /**
   * When one panel opens, close the other one immediately.
   * We rely on the (openedStart) event so that by the time it fully slides
   * in, the other panel has already been asked to close.
   */
  closeOther(openedPanel: 'settings' | 'visibility') {
    if (openedPanel === 'settings' && this.visibilitySidenav.opened) {
      this.visibilitySidenav.close();
    }
    if (openedPanel === 'visibility' && this.settingsSidenav.opened) {
      this.settingsSidenav.close();
    }
  }

  /**
   * Called when the user clicks the “Settings” (gear) button.
   * • If an animation is in progress, do nothing.
   * • If “Settings” is already open, close it.
   * • Else if “Visibility” is open, wait for it to finish closing before opening “Settings.”
   * • Otherwise open “Settings” immediately.
   */
  onSettingsClick(): void {
    // 1) If an open/close animation is still running, ignore this click
    if (this.isAnimating) {
      return;
    }

    // 2) If “Settings” is already open, just close it
    if (this.settingsSidenav.opened) {
      this.settingsSidenav.close();
      return;
    }

    // 3) If “Visibility” is open, wait until it finishes closing (openedChange → false)
    if (this.visibilitySidenav.opened) {
      const sub = this.visibilitySidenav.openedChange.subscribe((opened) => {
        if (!opened) {
          sub.unsubscribe();
          this.settingsSidenav.open();
        }
      });
      this.visibilitySidenav.close();
      return;
    }

    // 4) Otherwise, open “Settings” immediately
    this.settingsSidenav.open();
  }

  /**
   * Called when the user clicks the “Visibility” toggle (app-header-cart).
   * • If an animation is in progress, do nothing.
   * • If “Visibility” is already open, close it.
   * • Else if “Settings” is open, wait for it to finish closing before opening “Visibility.”
   * • Otherwise open “Visibility” immediately.
   */
  onVisibilityClick(): void {
    // 1) If an open/close animation is still running, ignore this click
    if (this.isAnimating) {
      return;
    }

    // 2) If “Visibility” is already open, just close it
    if (this.visibilitySidenav.opened) {
      this.visibilitySidenav.close();
      return;
    }

    // 3) If “Settings” is open, wait until it finishes closing (openedChange → false)
    if (this.settingsSidenav.opened) {
      const sub = this.settingsSidenav.openedChange.subscribe((opened) => {
        if (!opened) {
          sub.unsubscribe();
          this.visibilitySidenav.open();
        }
      });
      this.settingsSidenav.close();
      return;
    }

    // 4) Otherwise, open “Visibility” immediately
    this.visibilitySidenav.open();
  }
}
