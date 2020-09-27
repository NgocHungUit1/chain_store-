import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { WarehouseProduct, WarehouseProductFilter } from './warehouse.model';
import { resInvoicePrint } from '../sale/order.model';

@Injectable({
  providedIn: 'root'
})
export class WarehouseProductService {

  constructor(private http: HttpClient) {
  }

  getApiUrl(filter?: WarehouseProductFilter) {
    if (!filter.page) {
      filter.page = 1;
    }

    if (!filter.pageSize) {
      filter.pageSize = 20;
    }

    let url = '/warehouse-product?per-page=' + filter.pageSize;

    url += '&' + filter.toFilterString();
    return url;
  }

  getStateUrl(filter?: WarehouseProductFilter) {

    let url = '/warehouse-product/list';
    if (!filter.page) {
      filter.page = 1;
    }
    if (!filter.pageSize) {
      filter.pageSize = 20;
    }
    url += '?' + filter.toFilterString();
    return url;
  }

  getList(filter?: WarehouseProductFilter): Observable<HttpResponse<any>> {
    const url = environment.apiUrl + this.getApiUrl(filter);
    return this.http.get<HttpResponse<any>>(url, {observe: 'response'});
  }

  getDetail(id: string, expand: string) {
    const url = environment.apiUrl + '/warehouse-product/' + id + '?expand=' + expand;
    return this.http.get<WarehouseProduct>(url);
  }

  update(id: string, pos: any) {
    const url = environment.apiUrl + '/warehouse-product/' + id;
    return this.http.put(url, pos);
  }

  create(data) {
    const url = environment.apiUrl + '/warehouse-product';
    return this.http.post(url, data);
  }

  autocomplete(term: string) {
    const url = environment.apiUrl + '/warehouse-product/autocomplete?term=' + term;
    return this.http.get<WarehouseProduct[]>(url);
  }
}




