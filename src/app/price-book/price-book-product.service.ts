import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { environment } from '../../environments/environment';
import { PriceBookProduct, PriceBookProductFilter } from "./price-book-product.model";

@Injectable({
  providedIn: 'root'
})
export class PriceBookProductService {

  private loadProduct: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  subscribeLoadProduct: Observable<boolean> = this.loadProduct.asObservable();

  setLoadProduct(action: boolean) {
    this.loadProduct.next(action);
  }

  constructor(private http: HttpClient) {
  }

  getApiUrl(filter?: PriceBookProductFilter) {
    if (!filter.page) {
      filter.page = 1;
    }

    if (!filter.pageSize) {
      filter.pageSize = 20;
    }

    let url = '/product?per-page=' + filter.pageSize;

    url += '&' + filter.toFilterString();
    return url;
  }

  getStateUrl(filter?: PriceBookProductFilter) {

    let url = '/product/list';
    if (!filter.page) {
      filter.page = 1;
    }
    if (!filter.pageSize) {
      filter.pageSize = 20;
    }
    url += '?' + filter.toFilterString();
    return url;
  }

  getList(filter?: PriceBookProductFilter): Observable<HttpResponse<any>> {
    const url = environment.apiUrl + this.getApiUrl(filter);
    return this.http.get<HttpResponse<any>>(url, { observe: 'response' });
  }

  getDetail(id: string, expand: string = '') {
    const url = environment.apiUrl + '/product/' + id + '?expand=' + expand;
    return this.http.get<object>(url);
  }

  public getProducts(id: string, expand: string = ''): Observable<PriceBookProduct> {
    const url = environment.apiUrl + '/product/' + id + '?expand=' + expand;
    // return this.http.get<object>(url);
    return this.http.get<PriceBookProduct>(url);
  }

  update(id: string, pos: any) {
    const url = environment.apiUrl + '/product/' + id;
    return this.http.put(url, pos);
  }

  create(data) {
    const url = environment.apiUrl + '/product';
    return this.http.post(url, data);
  }

  uploadImage(formData) {
    const url = environment.apiUrl + '/product/upload-image';
    return this.http.post(url, formData);
  }

  removeImage(id: string, imageId: string) {
    const url = environment.apiUrl + '/product/remove-image';
    return this.http.post(url, { product_id: id, image_id: id });
  }

  delete(id: string) {
    const url = environment.apiUrl + '/product/delete-product';
    return this.http.post(url, { product_id: id });

    // const url = environment.apiUrl + '/product/delete/' + id;A
    // return this.http.delete(url);
  }
}




