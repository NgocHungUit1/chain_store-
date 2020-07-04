import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { OrderService } from '../order.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-sale-detail-order',
  encapsulation: ViewEncapsulation.None,
  templateUrl: './sale-detail-order.component.html',
  styleUrls: ['./sale-detail-order.component.css']
})
export class SaleDetailOrderComponent implements OnInit {

  listProduct: any = [];
  countProduct: number = 0;
  constructor(
    private orderService: OrderService,
    private route: ActivatedRoute,
  ) { }

  ngOnInit(): void {
    this.orderService.subscribeObjectOrder.subscribe(res => {
      // this.listProduct = res['listProduct'];
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
      // console.log(this.listProduct);
    });
  }

  deleleProduct(itemProduct) {
      const id = itemProduct?.product?.id;
      this.orderService.deleteProduct(id);
  }

}
