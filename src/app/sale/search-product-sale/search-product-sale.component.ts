import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { NotifierService } from 'angular-notifier';
import { Observable } from 'rxjs';
import { catchError, debounceTime, map, startWith, switchMap } from 'rxjs/operators';
import { PriceListFilter } from '../../price-book/price-list.model';
import { PriceListService } from '../../price-book/price-list.service';
import { Product } from '../../product/product.model';
import { ProductService } from '../../product/product.service';
import { OrderService } from '../order.service';
import { of } from 'rxjs/internal/observable/of';

@Component({
  selector: 'app-search-product-sale',
  templateUrl: './search-product-sale.component.html',
  styleUrls: ['./search-product-sale.component.css']
})
export class SearchProductSaleComponent implements OnInit {

  constructor(
    private dialog: MatDialog,
    private notifySer: NotifierService,
    private orderService: OrderService,
    private productSer: ProductService,
    private priceListSer: PriceListService,
  ) { }

  selectProduct = new FormControl();
  public filteredProducts: Observable<Product[]>;


  ngOnInit(): void {

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
