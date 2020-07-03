import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { Order, Detail } from '../sale/order.model';
import { Product } from '../product/product.model';
import { log } from 'console';

@Injectable({
  providedIn: 'root'
})

export class OrderService {

  public ObjectOrder: BehaviorSubject<Object> = new BehaviorSubject<Object>(null);
  subscribeObjectOrder: Observable<Object> = this.ObjectOrder.asObservable();

  addProduct(object: Product) { // @NGHIA
    if (this.ObjectOrder.value === null) {
      const listProduct = {};
      const order = {};
      listProduct[object.id] = { 'product': object, 'amount': 1 };
      order['listProduct'] = listProduct;
      this.ObjectOrder.next(order);

    } else {
      const order = this.ObjectOrder.value;
      const listProduct = order['listProduct'];

      if (listProduct[object.id] === undefined) {
        // them san pham moi
        listProduct[object.id] = { 'product': object, 'amount': 1 };
        order['listProduct'] = listProduct;
        this.ObjectOrder.next(order);
      } else {
        // them san pham da ton tai
        listProduct[object.id] = { 'product': object, 'amount': listProduct[object.id]['amount'] + 1 };
        order['listProduct'] = listProduct;
        this.ObjectOrder.next(order);
      }
    }

  }

  constructor() { }
}
