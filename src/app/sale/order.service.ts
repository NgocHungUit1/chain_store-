import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { Order } from '../sale/order.model';

@Injectable({
  providedIn: 'root'
})

export class OrderService {

  public ObjectOrder: BehaviorSubject<Order> = new BehaviorSubject<Order>(null);
  subscribeObjectOrder: Observable<Order> = this.ObjectOrder.asObservable();

  setLoadProduct(action: Order) { // @NGHIA
    this.ObjectOrder.next(action);
  }

  constructor() { }
}
