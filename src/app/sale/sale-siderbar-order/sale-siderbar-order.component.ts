import { Component, OnInit } from '@angular/core';
import { OrderService } from '../order.service';
import { Observable } from 'rxjs';
import { PriceList, PriceListFilter } from '../../price-book/price-list.model';
import { PriceListService } from '../../price-book/price-list.service';
import { FormGroup, FormBuilder, FormControl } from '@angular/forms';
import { PriceListProductService } from '../../price-book/price-list-product.service';
import { Customer } from '../../customer/customer.model';
import { catchError, debounceTime, map, startWith, switchMap } from 'rxjs/operators';
import { of } from 'rxjs/internal/observable/of';
import { CustomerService } from '../../customer/customer.service';

@Component({
  selector: 'app-sale-siderbar-order',
  templateUrl: './sale-siderbar-order.component.html',
  styleUrls: ['./sale-siderbar-order.component.css'],
})
export class SaleSiderbarOrderComponent implements OnInit {

  today: number = Date.now();
  public listProduct: any = [];
  public countProduct: number = 0;
  public sumPrice: number = 0;
  public priceLists: PriceList[] = [];
  public priceListCommon: PriceList;
  public form: FormGroup;
  selectCustomer = new FormControl();

  public filteredCustomers: Observable<Customer[]>;

  constructor(
    private orderService: OrderService,
    private priceListSer: PriceListService,
    public fb: FormBuilder,
    private priceListProductSer: PriceListProductService,
    public customerService: CustomerService,
  ) { }

  initForm() {
    this.form = this.fb.group({
      priceBookID: [null],
    });
  }

  onSelectedCustomer(customer) {
    this.orderService.addCustomer(customer);
    this.selectCustomer.patchValue(customer.name);
  }

  loadData() {
    const priceListFilter = new PriceListFilter();
    this.priceListSer.getList(priceListFilter).subscribe(res => {
      this.priceLists = res.body;
      this.priceLists.forEach((element, index) => {
        if (element.is_default === 1) {
          this.form.patchValue({
            priceBookID: element.id,
          });
          this.orderService.addPriceBookID(element.id);
          this.priceListCommon = element;
        }
      });
    });


    this.orderService.subscribeObjectOrder.subscribe(res => {
      if (res !== null && res['listProduct'] !== undefined) {
        const obj = res['listProduct'];
        this.listProduct = [];
        this.countProduct = 0;
        for (const prop of Object.keys(obj)) {
          this.listProduct.push(obj[prop]);
          this.countProduct++;
        }
        this.listProduct.reverse();
      }

      // sum price khi khoi tao
      const priceBookID = this.form.controls['priceBookID'].value;
      const list = this.listProduct;
      if (priceBookID !== null && Array.isArray(list)) {

        const listProductChoose = list.map(obj => obj.product.id);
        const common_id = priceBookID;
        // // tien hanh xu ly add common vao list
        this.priceListProductSer.getListProductCommon(common_id, listProductChoose).subscribe(resCommon => {
          if (Array.isArray(resCommon)) {
            const priceListProductCommonExist = resCommon;
            // code group array by key
            const group = priceListProductCommonExist.reduce((r, a) => {
              r[a.product_id] = [...r[a.product_id] || [], a];
              return r;
            }, {});
            // add common || null
            // neu co gia chung se chon common_price 
            this.sumPrice = 0;
            this.listProduct.forEach(elementData => {
              if (group[elementData.product.id] !== undefined) {
                this.sumPrice += group[elementData.product.id][0]['price'] * elementData.amount; // gia chung * so luong
              } else {
                this.sumPrice += elementData.product.sell_price * elementData.amount; // gia ban * so luong
              }
            });
          }
        });
      }

    });

    // sum price

    this.orderService.subscribePriceBookID.subscribe(pricebookID => {

      const priceBookID = pricebookID;
      const list = this.listProduct;
      if (priceBookID !== null && Array.isArray(list)) {

        const listProductChoose = list.map(obj => obj.product.id);
        const common_id = priceBookID;
        // // tien hanh xu ly add common vao list
        this.priceListProductSer.getListProductCommon(common_id, listProductChoose).subscribe(resCommon => {
          if (Array.isArray(resCommon)) {
            const priceListProductCommonExist = resCommon;
            // code group array by key
            const group = priceListProductCommonExist.reduce((r, a) => {
              r[a.product_id] = [...r[a.product_id] || [], a];
              return r;
            }, {});
            // add common || null
            // neu co gia chung se chon common_price 
            this.sumPrice = 0;
            this.listProduct.forEach(elementData => {
              if (group[elementData.product.id] !== undefined) {
                this.sumPrice += group[elementData.product.id][0]['price'] * elementData.amount; // gia chung * so luong
              } else {
                this.sumPrice += elementData.product.sell_price * elementData.amount; // gia ban * so luong
              }
            });
          }
        });
      }

    });

  }


  ngOnInit(): void {
    this.initForm();
    this.loadData();

    this.filteredCustomers = this.selectCustomer.valueChanges.pipe(
      startWith(''),
      // delay emits
      debounceTime(300),
      // use switch map so as to cancel previous subscribed events, before creating new once
      switchMap(value => {
        if (value !== '') {
          // lookup from github
          return this.lookupCustomer(value);
        } else {
          // if no value is present, return null
          return of(null);
        }
      })
    );
  }

  lookupCustomer(value: string): Observable<Customer[]> {
    return this.customerService.autocomplete(value).pipe(
      // map the item property of the github results as our return object
      map(results => results),
      // catch errors
      catchError(_ => {
        return of(null);
      })
    );
  }

  choosePriceBook(event: any) {
    this.orderService.addPriceBookID(this.form.controls['priceBookID'].value);
  }

}
