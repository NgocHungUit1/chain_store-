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
  Directive
} from '@angular/core';

import { MenuItems } from '../../shared/menu-items/menu-items';
import { AppHeaderCartComponent } from './header/header-cart.component';
// import { AppSidebarComponent } from './sidebar/sidebar.component';
// import { AppBreadcrumbComponent } from './breadcrumb/breadcrumb.component';
import { PerfectScrollbarConfigInterface } from 'ngx-perfect-scrollbar';
import { Observable } from 'rxjs';
import { Product } from '../../product/product.model';
import { PriceListFilter } from '../../price-book/price-list.model';
import { catchError, debounceTime, map, startWith, switchMap } from 'rxjs/operators';
import { of } from 'rxjs/internal/observable/of';
import { PriceListService } from '../../price-book/price-list.service';
import { ProductService } from '../../product/product.service';
import { OrderService } from '../../sale/order.service';
import { ItemInvoice } from '../../sale/order.model';
import { NotifierService } from 'angular-notifier';

/** @title Responsive sidenav */
@Component({
  selector: 'app-cart-layout',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css'],
})
export class CartComponent implements OnDestroy {

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

  public showSearch = false;

  public config: PerfectScrollbarConfigInterface = {};
  private _mobileQueryListener: () => void;

  selectProduct = new FormControl();
  public filteredProducts: Observable<Product[]>;
  listmItemInvoice: ItemInvoice[] = [];

  //
  activeLink = 0;

  constructor(
    changeDetectorRef: ChangeDetectorRef,
    media: MediaMatcher,
    public menuItems: MenuItems,
    public router: Router,
    private orderService: OrderService,
    private productSer: ProductService,
    private priceListSer: PriceListService,
    private notifySer: NotifierService
  ) {
    this.mobileQuery = media.matchMedia('(min-width: 768px)');
    this._mobileQueryListener = () => changeDetectorRef.detectChanges();
    this.mobileQuery.addListener(this._mobileQueryListener);
  }

  ngOnDestroy(): void {
    this.mobileQuery.removeListener(this._mobileQueryListener);
  }

  ngOnInit(): void {

    this.orderService.subscribeObjectListInvoice.subscribe(listInvoice => {
      const listItemInvoice = listInvoice.itemInvoice;
      this.listmItemInvoice = [];
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
          return this.lookupProduct(value);
        } else {
          // if no value is present, return null
          return of(null);
        }
      })
    );

  }

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


  onSelectedProduct(product) {
    if (product['quantity_of_stock'] > 0) {
      this.handlePriceListProduct(product);
    } else {
      this.notifySer.notify('warning', 'Không đủ tồn kho.');
    }
    this.selectProduct.patchValue(null);

  }

  handlePriceListProduct(product: Product) {
    let units = product.productUnits;
    units.forEach(element => {
      element.quantity_of_stock = Math.floor(product.quantity_of_stock / element.value);
    });
    units = units.filter(element => element.quantity_of_stock > 0);
    product.productUnits = units;

    this.orderService.addProduct(product);
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


}
