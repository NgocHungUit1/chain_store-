import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { Order, Detail, DiscountSiderBar, PaymentSiderBar } from '../sale/order.model';
import { Product } from '../product/product.model';
import { log } from 'console';

@Injectable({
  providedIn: 'root'
})

export class OrderService {

  // danh sach san pham , so luong, gia tien, ghi chu
  public ObjectOrder: BehaviorSubject<Object> = new BehaviorSubject<Object>(null);
  subscribeObjectOrder: Observable<Object> = this.ObjectOrder.asObservable();

  private loadPage: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  subscribeLoadPage: Observable<boolean> = this.loadPage.asObservable();

  // chon bang
  private priceBookID: BehaviorSubject<string> = new BehaviorSubject<string>(null);
  subscribePriceBookID: Observable<string> = this.priceBookID.asObservable();

  // Luu thong tin khach hang
  private customer: BehaviorSubject<object> = new BehaviorSubject<object>(null);
  subscribeCustomer: Observable<object> = this.customer.asObservable();

  // ghi chu khach hang
  private note: BehaviorSubject<string> = new BehaviorSubject<string>(null);
  subscribeNote: Observable<string> = this.note.asObservable();

  // giam gia
  private discountSiderBar: BehaviorSubject<DiscountSiderBar> = new BehaviorSubject<DiscountSiderBar>(null);
  subscribeDiscountSiderBar: Observable<DiscountSiderBar> = this.discountSiderBar.asObservable();

  // luu thanh toan khach hang
  private paymentSiderBar: BehaviorSubject<PaymentSiderBar> = new BehaviorSubject<PaymentSiderBar>(null);
  subscribePaymentSiderBar: Observable<PaymentSiderBar> = this.paymentSiderBar.asObservable();

  //
  setPaymentSiderBar(obj: PaymentSiderBar) {
    this.paymentSiderBar.next(obj);
  }

  getPaymentSiderBar() {
    return this.paymentSiderBar.value;
  }

  //
  setDiscountSiderBar(obj: DiscountSiderBar) {
    this.discountSiderBar.next(obj);
  }
  getDiscountSiderBar() {
    return this.discountSiderBar.value;
  }

  addCustomer(customerObj: object) {
    this.customer.next(customerObj);
  }

  setLoadProduct(action: boolean) {
    this.loadPage.next(action);
  }

  addPriceBookID(priceBookID: string) {
    this.priceBookID.next(priceBookID);
  }

  getPriceBookID() {
    return this.priceBookID.value;
  }

  addProduct(object: Product) {
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

  deleteProduct(id: string) {
    if (this.ObjectOrder.value !== null) {
      const order = this.ObjectOrder.value;
      delete order['listProduct'][id];
      this.ObjectOrder.next(order);
    }
  }

  upAmountProduct(id: string) {
    if (this.ObjectOrder.value !== null) {
      const order = this.ObjectOrder.value;
      order['listProduct'][id]['amount']++;
      this.ObjectOrder.next(order);
    }
  }

  downAmountProduct(id: string) {
    if (this.ObjectOrder.value !== null) {
      const order = this.ObjectOrder.value;
      if (order['listProduct'][id]['amount'] <= 1) {
        delete order['listProduct'][id];
      } else {
        order['listProduct'][id]['amount']--;
      }
      this.ObjectOrder.next(order);
    }
  }

  updateNoteDetailOrder(id: string, note_detail_sale: string) {
    const order = this.ObjectOrder.value;
    order['listProduct'][id]['product']['note_detail_sale'] = note_detail_sale;
    this.ObjectOrder.next(order);
  }

  updateProduct(id: string, product: Product) {
    const order = this.ObjectOrder.value;
    order['listProduct'][id]['product'] = product;
    this.ObjectOrder.next(order);
  }

  inputAmountProduct(id: string, value: number) {
    if (this.ObjectOrder.value !== null) {
      const order = this.ObjectOrder.value;
      if (value <= 0) {
        delete order['listProduct'][id];
      } else {
        order['listProduct'][id]['amount'] = value;
      }
      this.ObjectOrder.next(order);
    }
  }

  constructor() { }
}
