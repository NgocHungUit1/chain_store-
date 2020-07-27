import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { Order, Detail, DiscountSiderBar, PaymentSiderBar, ItemInvoice, ListInvoice, ProductInfo } from '../sale/order.model';
import { Product } from '../product/product.model';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Customer } from '../customer/customer.model';

@Injectable({
  providedIn: 'root'
})

export class OrderService {

  order_key_local = 'rs24_token_order_service';

  constructor(private http: HttpClient) {
    this.getDataInvoiceActive();
  }


  public setListInvoiceLocalStorage(data: ListInvoice) {
    this.ObjectListInvoice.next(data);
    localStorage.setItem(this.order_key_local, JSON.stringify(data));
  }

  public getListInvoiceLocalStorage() {
    const listInvoice = JSON.parse(localStorage.getItem(this.order_key_local));
    if (listInvoice == null) {
      return new ListInvoice();
    }
    this.ObjectListInvoice.next(listInvoice);
    return listInvoice;
  }


  public initListInvoice() {
    const data = new ListInvoice();
    const listItemInvoice: ItemInvoice[] = [];
    const itemInvoice = new ItemInvoice();
    itemInvoice.invoice_id = -1;
    itemInvoice.invoice_name = 'Hóa đơn';
    itemInvoice.active = true;
    listItemInvoice.push(itemInvoice);
    data.itemInvoice = listItemInvoice;
    this.ObjectListInvoice.next(data);
    this.setListInvoiceLocalStorage(data);
  }

  public addNewInvoice() {

    const data = this.getListInvoiceLocalStorage();
    const listItemInvoice = data.itemInvoice || [];
    const itemInvoice = new ItemInvoice();
    itemInvoice.invoice_id = -1;
    itemInvoice.invoice_name = 'Hóa đơn';
    itemInvoice.active = true;
    listItemInvoice.push(itemInvoice);
    data.itemInvoice = listItemInvoice;
    this.setListInvoiceLocalStorage(data);
  }

  public getDataInvoiceActive() {
    let listInvoice = this.getListInvoiceLocalStorage();
    if (Object.keys(listInvoice).length === 0) {
      this.initListInvoice();
    }
    listInvoice = this.getListInvoiceLocalStorage();
    this.ObjectOrder.next(listInvoice);
  }

  // danh sach hoa don
  public ObjectListInvoice: BehaviorSubject<ListInvoice> = new BehaviorSubject<ListInvoice>(null);
  subscribeObjectListInvoice: Observable<ListInvoice> = this.ObjectListInvoice.asObservable();

  // danh sach san pham , so luong, gia tien, ghi chu
  public ObjectOrder: BehaviorSubject<Object> = new BehaviorSubject<Object>(null);
  subscribeObjectOrder: Observable<Object> = this.ObjectOrder.asObservable();

  private loadPage: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  subscribeLoadPage: Observable<boolean> = this.loadPage.asObservable();

  // load detail
  private loadDetailPage: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  subscribeLoadDetailPage: Observable<boolean> = this.loadDetailPage.asObservable();

  // chon bang
  // private priceBookID: BehaviorSubject<string> = new BehaviorSubject<string>(null);
  // subscribePriceBookID: Observable<string> = this.priceBookID.asObservable();

  // // Luu thong tin khach hang
  // private customer: BehaviorSubject<Customer> = new BehaviorSubject<Customer>(null);
  // subscribeCustomer: Observable<Customer> = this.customer.asObservable();

  // giam gia
  private discountSiderBar: BehaviorSubject<DiscountSiderBar> = new BehaviorSubject<DiscountSiderBar>(null);
  subscribeDiscountSiderBar: Observable<DiscountSiderBar> = this.discountSiderBar.asObservable();

  // luu thanh toan khach hang
  private paymentSiderBar: BehaviorSubject<PaymentSiderBar> = new BehaviorSubject<PaymentSiderBar>(null);
  subscribePaymentSiderBar: Observable<PaymentSiderBar> = this.paymentSiderBar.asObservable();


  removeActive() {
    let listInvoice = this.getListInvoiceLocalStorage();
    const listItemInvoice = listInvoice.itemInvoice;
    const listNew: ItemInvoice[] = [];
    listItemInvoice.forEach(element => {
      if (element.active !== true) {
        listNew.push(element);
      }
    });
    listInvoice.itemInvoice = listNew;
    if (listNew.length === 0) {
      this.initListInvoice();
    } else {
      this.setListInvoiceLocalStorage(listInvoice);
    }
    // this.ObjectOrder.next(null);
    // this.customer.next(null);
    // this.paymentSiderBar.next(null);
    // this.discountSiderBar.next(null);
  }

  //   this.paymentSiderBar.next(obj);
  // }

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

  // addCustomer(customerObj: Customer) {
  //   this.customer.next(customerObj);
  // }

  // getCustomer() {
  //   return this.customer.value;
  // }

  setLoadProduct(action: boolean) {
    this.loadPage.next(action);
  }

  setLoadDetailPage(action: boolean) {
    this.loadDetailPage.next(action);
  }

  // addPriceBookID(priceBookID: string) {
  //   this.priceBookID.next(priceBookID);
  // }

  // getPriceBookID() {
  //   return this.priceBookID.value;
  // }

  addProduct(object: Product) {
    const ListInvoice = this.ObjectListInvoice.value;
    const listItemInvoice = ListInvoice.itemInvoice;
    let mItemInvoice = new ItemInvoice();
    listItemInvoice.forEach(element => {
      if (element.active === true) {
        mItemInvoice = element;
      }
    });
    if (mItemInvoice.listProduct === undefined || mItemInvoice.listProduct.length === 0) {
      const listProduct: ProductInfo[] = [];
      const mProductInfo = new ProductInfo();
      mProductInfo.product_id = object.id;
      mProductInfo.product = object;
      mProductInfo.amount = 1;
      listProduct.push(mProductInfo);
      mItemInvoice.listProduct = listProduct;
    } else {
      const listProduct = mItemInvoice.listProduct;
      // them san pham da ton tai
      let newItem = 1;
      listProduct.forEach(eProductInfo => {
        if (eProductInfo.product_id === object.id) {
          newItem = 0;
          eProductInfo.amount = eProductInfo.amount + 1;
        }
      });
      if (newItem === 1) {
        const mProductInfo = new ProductInfo();
        mProductInfo.product_id = object.id;
        mProductInfo.product = object;
        mProductInfo.amount = 1;
        listProduct.push(mProductInfo);
      }
    }
    this.setListInvoiceLocalStorage(ListInvoice);
    //


    // if (this.ObjectOrder.value === null) {
    //   const listProduct = {};
    //   const order = {};
    //   listProduct[object.id] = { 'product': object, 'amount': 1 };
    //   order['listProduct'] = listProduct;
    //   this.ObjectOrder.next(order);
    // } else {
    //   const order = this.ObjectOrder.value;
    //   const listProduct = order['listProduct'];

    //   if (listProduct[object.id] === undefined) {
    //     // them san pham moi
    //     listProduct[object.id] = { 'product': object, 'amount': 1 };
    //     order['listProduct'] = listProduct;
    //     this.ObjectOrder.next(order);
    //   } else {
    //     // them san pham da ton tai
    //     listProduct[object.id] = { 'product': object, 'amount': listProduct[object.id]['amount'] + 1 };
    //     order['listProduct'] = listProduct;
    //     this.ObjectOrder.next(order);
    //   }
    // }

  }

  deleteProduct(id: string) {
    let ListInvoice = this.ObjectListInvoice.value;
    const listItemInvoice = ListInvoice.itemInvoice;
    let mItemInvoice = new ItemInvoice();
    listItemInvoice.forEach(element => {
      if (element.active === true) {
        mItemInvoice = element;
      }
    });
    if (mItemInvoice.listProduct === undefined || mItemInvoice.listProduct.length === 0) {
    } else {
      const listProduct = mItemInvoice.listProduct;
      const resultListProduct = [];
      listProduct.forEach(eProductInfo => {
        if (eProductInfo.product_id !== id) {
          resultListProduct.push(eProductInfo);
        }
      });
      mItemInvoice.listProduct = resultListProduct;
    }
    this.setListInvoiceLocalStorage(ListInvoice);
  }

  upAmountProduct(id: string) {
    let ListInvoice = this.ObjectListInvoice.value;
    const listItemInvoice = ListInvoice.itemInvoice;
    let mItemInvoice = new ItemInvoice();
    listItemInvoice.forEach(element => {
      if (element.active === true) {
        mItemInvoice = element;
      }
    });
    if (mItemInvoice.listProduct === undefined || mItemInvoice.listProduct.length === 0) {
    } else {
      const listProduct = mItemInvoice.listProduct;
      const resultListProduct = [];
      listProduct.forEach(eProductInfo => {
        if (eProductInfo.product_id === id) {
          eProductInfo.amount++;
        }
        resultListProduct.push(eProductInfo);
      });
      mItemInvoice.listProduct = resultListProduct;
    }
    this.setListInvoiceLocalStorage(ListInvoice);
  }

  downAmountProduct(id: string) {
    let ListInvoice = this.ObjectListInvoice.value;
    const listItemInvoice = ListInvoice.itemInvoice;
    let mItemInvoice = new ItemInvoice();
    listItemInvoice.forEach(element => {
      if (element.active === true) {
        mItemInvoice = element;
      }
    });
    if (mItemInvoice.listProduct === undefined || mItemInvoice.listProduct.length === 0) {
    } else {
      const listProduct = mItemInvoice.listProduct;
      const resultListProduct = [];
      listProduct.forEach(eProductInfo => {
        if (eProductInfo.product_id === id) {
          eProductInfo.amount--;
          if (eProductInfo.amount > 0) {
            resultListProduct.push(eProductInfo);
          }
        } else {
          resultListProduct.push(eProductInfo);
        }
      });
      mItemInvoice.listProduct = resultListProduct;
    }
    this.setListInvoiceLocalStorage(ListInvoice);
  }

  updateNoteDetailOrder(id: string, note_detail_sale: string) {
    let ListInvoice = this.ObjectListInvoice.value;
    const listItemInvoice = ListInvoice.itemInvoice;
    let mItemInvoice = new ItemInvoice();
    listItemInvoice.forEach(element => {
      if (element.active === true) {
        mItemInvoice = element;
      }
    });
    if (mItemInvoice.listProduct === undefined || mItemInvoice.listProduct.length === 0) {
    } else {
      const listProduct = mItemInvoice.listProduct;
      const resultListProduct = [];
      listProduct.forEach(eProductInfo => {
        if (eProductInfo.product_id === id) {
          eProductInfo.product.note_detail_sale = note_detail_sale;
        }
        resultListProduct.push(eProductInfo);
      });
      mItemInvoice.listProduct = resultListProduct;
    }
    this.setListInvoiceLocalStorage(ListInvoice);

  }

  updateProduct(id: string, product: Product) {
    let ListInvoice = this.ObjectListInvoice.value;
    const listItemInvoice = ListInvoice.itemInvoice;
    let mItemInvoice = new ItemInvoice();
    listItemInvoice.forEach(element => {
      if (element.active === true) {
        mItemInvoice = element;
      }
    });
    if (mItemInvoice.listProduct === undefined || mItemInvoice.listProduct.length === 0) {
    } else {
      const listProduct = mItemInvoice.listProduct;
      const resultListProduct = [];
      listProduct.forEach(eProductInfo => {
        if (eProductInfo.product_id === id) {
          eProductInfo.product = product;
        }
        resultListProduct.push(eProductInfo);
      });
      mItemInvoice.listProduct = resultListProduct;
    }
    this.setListInvoiceLocalStorage(ListInvoice);
  }

  inputAmountProduct(id: string, value: number) {
    let ListInvoice = this.ObjectListInvoice.value;
    const listItemInvoice = ListInvoice.itemInvoice;
    let mItemInvoice = new ItemInvoice();
    listItemInvoice.forEach(element => {
      if (element.active === true) {
        mItemInvoice = element;
      }
    });
    if (mItemInvoice.listProduct === undefined || mItemInvoice.listProduct.length === 0) {
    } else {
      const listProduct = mItemInvoice.listProduct;
      const resultListProduct = [];
      listProduct.forEach(eProductInfo => {
        if (eProductInfo.product_id === id) {
          if (value >= 0) {
            eProductInfo.amount = value;
            resultListProduct.push(eProductInfo);
          }
        } else {
          resultListProduct.push(eProductInfo);
        }
      });
      mItemInvoice.listProduct = resultListProduct;
    }
    this.setListInvoiceLocalStorage(ListInvoice);
  }



  saleOrder(data) {
    const url = environment.apiUrl + '/invoice/sale-order';
    return this.http.post(url, data);
  }
}
