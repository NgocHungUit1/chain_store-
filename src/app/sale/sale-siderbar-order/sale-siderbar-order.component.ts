import { Component, OnInit } from '@angular/core';
import { OrderService } from '../order.service';

@Component({
  selector: 'app-sale-siderbar-order',
  templateUrl: './sale-siderbar-order.component.html',
  styleUrls: ['./sale-siderbar-order.component.css']
})
export class SaleSiderbarOrderComponent implements OnInit {

  listProduct: any = [];
  countProduct: number = 0;

  constructor(
    private orderService: OrderService,
  ) { }

  ngOnInit(): void {
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

}
