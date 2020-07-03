import { Component, OnInit } from '@angular/core';
import { OrderService } from '../order.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-sale-detail-order',
  templateUrl: './sale-detail-order.component.html',
  styleUrls: ['./sale-detail-order.component.css']
})
export class SaleDetailOrderComponent implements OnInit {

  listProduct: {};
  constructor(
    private orderService: OrderService,
    private route: ActivatedRoute,
  ) { }

  ngOnInit(): void {
    this.orderService.subscribeObjectOrder.subscribe(res => {
      // this.listProduct = res['listProduct'];
      if (res !== null && res['listProduct'] !== undefined) {
        const obj = res['listProduct'];
        this.listProduct = Object.keys(obj).map((k) => obj[k]);
      }
      console.log(this.listProduct);
      
    });
  }

}
