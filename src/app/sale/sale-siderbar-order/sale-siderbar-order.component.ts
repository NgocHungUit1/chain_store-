import { Component, OnInit } from '@angular/core';
import { OrderService } from '../order.service';
import { PriceList, PriceListFilter } from '../../price-book/price-list.model';
import { PriceListService } from '../../price-book/price-list.service';
import { FormGroup, FormBuilder } from '@angular/forms';

@Component({
  selector: 'app-sale-siderbar-order',
  templateUrl: './sale-siderbar-order.component.html',
  styleUrls: ['./sale-siderbar-order.component.css']
})
export class SaleSiderbarOrderComponent implements OnInit {

  public listProduct: any = [];
  public countProduct: number = 0;
  public priceLists: PriceList[] = [];
  public priceListCommon: PriceList;
  // public itemPriceList: PriceList;
  public form: FormGroup;

  constructor(
    private orderService: OrderService,
    private priceListSer: PriceListService,
    public fb: FormBuilder,
  ) { }

  initForm() {
    this.form = this.fb.group({
      priceBookID: [null],
    });
  }

  ngOnInit(): void {

    this.initForm();

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
    });


  }

  choosePriceBook(event: any) {
    this.orderService.addPriceBookID(this.form.controls['priceBookID'].value);
  }

}
