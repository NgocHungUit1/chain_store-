import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormControl, FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { NotifierService } from 'angular-notifier';
import { Observable } from 'rxjs';
import { Product } from '../../product/product.model';
import { OrderService } from '../order.service';
import { catchError, debounceTime, map, startWith, switchMap } from 'rxjs/operators';
import { ProductService } from '../../product/product.service';
import { of } from 'rxjs/internal/observable/of';
import { PriceListFilter } from '../../price-book/price-list.model';
import { PriceListService } from '../../price-book/price-list.service';

@Component({
  selector: 'app-sale-main',
  encapsulation: ViewEncapsulation.None,
  templateUrl: './sale-main.component.html',
  styleUrls: ['./sale-main.component.css']
})
export class SaleMainComponent implements OnInit {

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private dialog: MatDialog,
    private notifySer: NotifierService,
    private orderService: OrderService,
    private productSer: ProductService,
    private priceListSer: PriceListService,

  ) {
    // super();
  }

  selectProduct = new FormControl();
  public filteredProducts: Observable<Product[]>;
  isLoadingResults = true;

  ngOnInit(): void {
    this.isLoadingResults = false;

    this.orderService.subscribeLoadPage.subscribe(action => {
      this.isLoadingResults = action;
    });

    //@NGHIA
    // const priceListFilter = new PriceListFilter();
    // this.priceListSer.getList(priceListFilter).subscribe(res => {
    //   const priceLists = res.body;
    //   priceLists.forEach((element, index) => {
    //     if (element.is_default === 1) {
    //       this.orderService.addPriceBookID(element.id);
    //     }
    //   });
    // });
    

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


  onSelectedProduct(product) {

    this.handlePriceListProduct(product);
    this.selectProduct.patchValue(null);
  }

  handlePriceListProduct(product: any) {
    this.orderService.addProduct(product);
  }

}
