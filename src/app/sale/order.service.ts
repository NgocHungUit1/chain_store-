import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import {
  Order,
  Detail,
  DiscountSiderBar,
  PaymentSiderBar,
  ItemInvoice,
  ListInvoice,
  ProductInfo,
  resInvoicePrint,
  resReturnsPrint
} from '../sale/order.model';
import { Product } from '../product/product.model';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Customer } from '../customer/customer.model';
import { element } from 'protractor';

@Injectable({
  providedIn: 'root'
})

export class OrderService {

  order_key_local = 'rs24_token_order_service';

  rx20_history = 'rx20_history';

  constructor(private http: HttpClient) {
    this.getDataInvoiceActive();
  }

  public initListInvoice() {
    const data = new ListInvoice();
    const listItemInvoice: ItemInvoice[] = [];
    const itemInvoice = new ItemInvoice();
    itemInvoice.invoice_id = -1;
    itemInvoice.invoice_name = 'Hóa đơn';
    itemInvoice.active = true;
    itemInvoice.is_return = false;
    listItemInvoice.push(itemInvoice);
    data.itemInvoice = listItemInvoice;
    this.ObjectListInvoice.next(data);
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

  public addNewInvoice() {
    const data = this.getListInvoiceLocalStorage();
    const listItemInvoice = data.itemInvoice || [];
    let min_invoice_id = 0;
    listItemInvoice.forEach(element => {
      element.active = false;
      if (element.invoice_id < min_invoice_id) {
        min_invoice_id = element.invoice_id;
      }
    });
    const itemInvoice = new ItemInvoice();
    itemInvoice.invoice_id = min_invoice_id - 1;
    itemInvoice.invoice_name = 'Hóa đơn';
    itemInvoice.active = true;
    itemInvoice.is_return = false;
    listItemInvoice.push(itemInvoice);
    data.itemInvoice = listItemInvoice;
    this.setListInvoiceLocalStorage(data);
    this.setListInvoiceLocalStorage(data);
  }

  public deleteInvoice(invoice_id: number) {
    const data = this.getListInvoiceLocalStorage();
    const listItemInvoice = data.itemInvoice || [];
    const aItemInvoice: ItemInvoice[] = [];
    let acticeNull = 1;
    listItemInvoice.forEach(element => {
      if (element.invoice_id !== invoice_id) {
        aItemInvoice.push(element);
        if (element.active === true) {
          acticeNull = 0;
        }
      }
    });
    if (acticeNull === 1) {
      let lastItem: ItemInvoice = aItemInvoice.pop();
      if (lastItem === undefined) {
        lastItem = new ItemInvoice();
        lastItem.invoice_name = 'Hóa Đơn';
        lastItem.invoice_id = -1;
      }
      lastItem.active = true;
      aItemInvoice.push(lastItem);
    }
    data.itemInvoice = aItemInvoice;
    this.setListInvoiceLocalStorage(data);

  }

  public activeInvoice(invoice_id: number) {
    const data = this.getListInvoiceLocalStorage();
    const listItemInvoice = data.itemInvoice || [];
    listItemInvoice.forEach(element => {
      if (element.invoice_id !== invoice_id) {
        element.active = false;
      } else {
        element.active = true;
      }
    });
    data.itemInvoice = listItemInvoice;
    this.setListInvoiceLocalStorage(data);
  }

  public getInvoiceActive(): ItemInvoice {
    const listInvoice = this.getListInvoiceLocalStorage();
    const listItemInvoice = listInvoice.itemInvoice;
    listItemInvoice.forEach(element => {
      if (element.active === true) {
        return element;
      }
    });
    return null;
  }


  // danh sach hoa don
  public ObjectListInvoice: BehaviorSubject<ListInvoice> = new BehaviorSubject<ListInvoice>(null);
  subscribeObjectListInvoice: Observable<ListInvoice> = this.ObjectListInvoice.asObservable();

  // danh sach san pham , so luong, gia tien, ghi chu
  public ObjectOrder: BehaviorSubject<Object> = new BehaviorSubject<Object>(null);
  subscribeObjectOrder: Observable<Object> = this.ObjectOrder.asObservable();

  private loadPage: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  subscribeLoadPage: Observable<boolean> = this.loadPage.asObservable();

  /**
   * Action True to load detail Cart
   */
  private loadDetailPage: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  subscribeLoadDetailPage: Observable<boolean> = this.loadDetailPage.asObservable();


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
      let lastItemInvoice = listNew[listNew.length - 1];
      lastItemInvoice.active = true;
      listNew[listNew.length - 1] = lastItemInvoice;
      this.setListInvoiceLocalStorage(listInvoice);
    }

  }

  setLoadProduct(action: boolean) {
    this.loadPage.next(action);
  }

  setLoadDetailPage(action: boolean) {
    this.loadDetailPage.next(action);
  }

  addProduct(object: Product, amountProduct = 1) {
    const ListInvoice = this.getListInvoiceLocalStorage();
    const listItemInvoice = ListInvoice.itemInvoice;
    let mItemInvoice = new ItemInvoice();

    mItemInvoice = listItemInvoice.find(element => element.active === true);
    if (mItemInvoice.listProduct === undefined || mItemInvoice.listProduct.length === 0) {
      const listProduct: ProductInfo[] = [];
      const mProductInfo = new ProductInfo();
      mProductInfo.product_id = object.id;
      mProductInfo.product = object;
      mProductInfo.product_unit_id = object.product_unit_id;
      mProductInfo.product_unit_value = object.product_unit_value;
      mProductInfo.base_unit = object.base_unit;
      mProductInfo.amount = (object.amount === undefined || object.amount === null) ? amountProduct : object.amount;
      listProduct.unshift(mProductInfo);
      mItemInvoice.listProduct = listProduct;
    } else {
      const listProduct = mItemInvoice.listProduct;
      // them san pham da ton tai
      let newItem = 1;
      listProduct.forEach(eProductInfo => {
        if (eProductInfo.product_id === object.id && eProductInfo.product_unit_id === object.product_unit_id) {
          newItem = 0;
          eProductInfo.amount = eProductInfo.amount + amountProduct;
        }
      });
      if (newItem === 1) {
        const mProductInfo = new ProductInfo();
        mProductInfo.product_id = object.id;
        mProductInfo.product = object;
        mProductInfo.product_unit_id = object.product_unit_id;
        mProductInfo.product_unit_value = object.product_unit_value;
        mProductInfo.base_unit = object.base_unit;
        mProductInfo.amount = amountProduct;
        listProduct.unshift(mProductInfo);
      }
    }
    this.setListInvoiceLocalStorage(ListInvoice);
  }

  deleteProduct(i: any) {
    let ListInvoice = this.getListInvoiceLocalStorage();
    const listItemInvoice = ListInvoice.itemInvoice;
    let mItemInvoice = new ItemInvoice();

    mItemInvoice = listItemInvoice.find(element => element.active === true);

    if (mItemInvoice.listProduct === undefined || mItemInvoice.listProduct.length === 0) {
    } else {
      let listProduct = mItemInvoice.listProduct;
      const resultListProduct = [];
      listProduct.forEach((eProductInfo, index) => {
        if (i !== index) {
          resultListProduct.push(eProductInfo);
        }
      });
      mItemInvoice.listProduct = resultListProduct;
    }
    this.setListInvoiceLocalStorage(ListInvoice);
  }

  /*
  Thay doi so luong san pham
  */
  upAmountProduct(product: Product, i: any) {
    let ListInvoice = this.getListInvoiceLocalStorage();
    const listItemInvoice = ListInvoice.itemInvoice;
    let mItemInvoice = new ItemInvoice();

    mItemInvoice = listItemInvoice.find(element => element.active === true);

    if (mItemInvoice.listProduct === undefined || mItemInvoice.listProduct.length === 0) {
    } else {
      let listProduct = mItemInvoice.listProduct;
      listProduct[i]['amount'] = Number(listProduct[i]['amount']) + 1;
      mItemInvoice.listProduct = listProduct;
    }
    this.setListInvoiceLocalStorage(ListInvoice);
  }

  upAmountProductReturn(product: Product, i: any) {
    let ListInvoice = this.getListInvoiceLocalStorage();
    const listItemInvoice = ListInvoice.itemInvoice;
    let mItemInvoice = new ItemInvoice();

    mItemInvoice = listItemInvoice.find(element => element.active === true);

    if (mItemInvoice.listProduct === undefined || mItemInvoice.listProduct.length === 0) {
    } else {
      let listProduct = mItemInvoice.listProduct;
      if (listProduct[i]['amount'] < listProduct[i]['max_amount_return']) {
        listProduct[i]['amount'] = Number(listProduct[i]['amount']) + 1;
      }

      mItemInvoice.listProduct = listProduct;
    }
    this.setListInvoiceLocalStorage(ListInvoice);
  }

  downAmountProduct(product: Product, i: any) {
    let ListInvoice = this.getListInvoiceLocalStorage();
    const listItemInvoice = ListInvoice.itemInvoice;
    let mItemInvoice = new ItemInvoice();

    mItemInvoice = listItemInvoice.find(element => element.active === true);

    if (mItemInvoice.listProduct === undefined || mItemInvoice.listProduct.length === 0) {
    } else {
      let listProduct = mItemInvoice.listProduct;
      let result = [];
      listProduct[i]['amount'] = Number(listProduct[i]['amount']) - 1;
      listProduct.forEach(eProduct => {
        if (eProduct.amount > 0) {
          result.push(eProduct);
        }
      });
      mItemInvoice.listProduct = result;
    }
    this.setListInvoiceLocalStorage(ListInvoice);
  }

  updateNoteDetailOrder(i: any, note_detail_sale: string) {
    let ListInvoice = this.getListInvoiceLocalStorage();
    const listItemInvoice = ListInvoice.itemInvoice;
    let mItemInvoice = new ItemInvoice();
    mItemInvoice = listItemInvoice.find(element => element.active === true);
    if (mItemInvoice.listProduct === undefined || mItemInvoice.listProduct.length === 0) {
    } else {
      let listProduct = mItemInvoice.listProduct;
      listProduct[i]['product']['note_detail_sale'] = note_detail_sale;
      mItemInvoice.listProduct = listProduct;
    }
    this.setListInvoiceLocalStorage(ListInvoice);

  }

  updateProduct(i: any, product: Product) {
    let ListInvoice = this.getListInvoiceLocalStorage();
    const listItemInvoice = ListInvoice.itemInvoice;
    let mItemInvoice = new ItemInvoice();

    mItemInvoice = listItemInvoice.find(element => element.active === true);
    if (mItemInvoice.listProduct === undefined || mItemInvoice.listProduct.length === 0) {
    } else {
      let listProduct = mItemInvoice.listProduct;
      listProduct[i]['product'] = product;
      mItemInvoice.listProduct = listProduct;
    }
    this.setListInvoiceLocalStorage(ListInvoice);
  }

  inputAmountProduct(i: any, value: number) {
    let ListInvoice = this.getListInvoiceLocalStorage();
    const listItemInvoice = ListInvoice.itemInvoice;
    let mItemInvoice = new ItemInvoice();

    mItemInvoice = listItemInvoice.find(element => element.active === true);
    if (mItemInvoice.listProduct === undefined || mItemInvoice.listProduct.length === 0) {
    } else {
      let listProduct = mItemInvoice.listProduct;
      if (value >= 0) {
        listProduct[i]['amount'] = Number(value);
      }
      mItemInvoice.listProduct = listProduct;
    }
    this.setListInvoiceLocalStorage(ListInvoice);
  }

  inputAmountProductReturn(i: any, value: number) {
    let ListInvoice = this.getListInvoiceLocalStorage();
    const listItemInvoice = ListInvoice.itemInvoice;
    let mItemInvoice = new ItemInvoice();

    mItemInvoice = listItemInvoice.find(element => element.active === true);
    if (mItemInvoice.listProduct === undefined || mItemInvoice.listProduct.length === 0) {
    } else {
      let listProduct = mItemInvoice.listProduct;
      if (value >= 0 && value <= listProduct[i]['max_amount_return']) {
        listProduct[i]['amount'] = Number(value);
      }
      mItemInvoice.listProduct = listProduct;
    }
    this.setListInvoiceLocalStorage(ListInvoice);
  }

  /**
   * API post sale order to the Invoice
   * @param data
   */
  saleOrder(data) {
    const url = environment.apiUrl + '/invoice/sale-order';
    return this.http.post(url, data);
  }


  /**
   * API post returns order to the Invoice
   * @param data
   */
  returnsOrder(data) {
    const url = environment.apiUrl + '/invoice/returns-order';
    return this.http.post(url, data);
  }

  updateOrder(data) {
    const url = environment.apiUrl + '/invoice/update-order';
    return this.http.post(url, data);
  }

  /**
   * Add a invoice to update in to list cart
   * @param mItemInvoice
   */
  addItemInvoiceUpdate(mItemInvoice: ItemInvoice) {
    let ListInvoice = this.getListInvoiceLocalStorage();
    const listItemInvoice = ListInvoice.itemInvoice;
    const listNew: ItemInvoice[] = [];

    listItemInvoice.forEach(element => {
      element.active = false;
      if (element.invoice_id !== mItemInvoice.invoice_id) {
        listNew.push(element);
      }
    });
    listNew.push(mItemInvoice);

    ListInvoice.itemInvoice = listNew;
    this.setListInvoiceLocalStorage(ListInvoice);
  }

  /**
   * API get data to print invoice
   * @param invoice_id
   */
  getDataInvoiceToPrint(invoice_id: number) {
    const url = environment.apiUrl + '/invoice/get-data-invoice-print/';
    return this.http.post<resInvoicePrint>(url, {invoice_id: invoice_id});
  }

  /**
   * API get data to print returns
   * @param returns_id
   */
  getDataReturnsToPrint(returns_id: number) {
    const url = environment.apiUrl + '/invoice/get-data-returns-print/';
    return this.http.post<resReturnsPrint>(url, {returns_id: returns_id});
  }

  /**
   * Get info Returns
   */
  getReturns(invoice_id: number) {
    const url = environment.apiUrl + '/invoice/get-returns/';
    return this.http.post<any[]>(url, {invoice_id: invoice_id});
  }

  pushHistorySearch(product: any, store_id) {
    let history = JSON.parse(localStorage.getItem(this.rx20_history + store_id));
    if (history === null || history === undefined) {
      history = [];
    }
    if (history.includes(product.id) !== true) {
      history.unshift(product.id);
    }

    if (history.length > 10) {
      // console.log(history.length);
      history.splice(history.length - 1, 1);
    }

    localStorage.setItem(this.rx20_history + store_id, JSON.stringify(history));
  }

  getHistorySearch(store_id) {
    return JSON.parse(localStorage.getItem(this.rx20_history + store_id));
  }

}

