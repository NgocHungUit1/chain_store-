import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from '../authentication/auth.service';
import {WarehouseProductParcel, WarehouseProductParcelFilter} from './warehouse-product-parcel.model';

@Injectable({
  providedIn: 'root'
})
export class WarehouseProductParcelService {

  constructor(private http: HttpClient, private auth: AuthService) {
  }

  getApiUrl(filter?: WarehouseProductParcelFilter) {
    if (!filter.page) {
      filter.page = 1;
    }

    if (!filter.pageSize) {
      filter.pageSize = 20;
    }

    let url = '/warehouse-product-parcel?per-page=' + filter.pageSize;

    url += '&' + filter.toFilterString();
    return url;
  }

  getApiUrlExpiration(filter?: WarehouseProductParcelFilter) {
    if (!filter.page) {
      filter.page = 1;
    }

    if (!filter.pageSize) {
      filter.pageSize = 20;
    }

    let url = '/warehouse-product-parcel/expiration?per-page=' + filter.pageSize;

    url += '&' + filter.toFilterString();
    return url;
  }

  getApiUrlSummaryExpiration(filter?: WarehouseProductParcelFilter) {
    if (!filter.page) {
      filter.page = 1;
    }

    if (!filter.pageSize) {
      filter.pageSize = 20;
    }

    let url = '/warehouse-product-parcel/summary-expiration?per-page=' + filter.pageSize;

    url += '&' + filter.toFilterString();
    return url;
  }

  getStateUrl(filter?: WarehouseProductParcelFilter) {

    let url = '/warehouse-product-parcel/list';
    if (!filter.page) {
      filter.page = 1;
    }
    if (!filter.pageSize) {
      filter.pageSize = 20;
    }
    url += '?' + filter.toFilterString();
    return url;
  }

  getStateUrlExpiration(filter?: WarehouseProductParcelFilter) {

    let url = '/warehouse-product-parcel/expiration';
    if (!filter.page) {
      filter.page = 1;
    }
    if (!filter.pageSize) {
      filter.pageSize = 20;
    }
    url += '?' + filter.toFilterString();
    return url;
  }

  getList(filter?: WarehouseProductParcelFilter): Observable<HttpResponse<any>> {
    const url = environment.apiUrl + this.getApiUrl(filter);
    return this.http.get<HttpResponse<any>>(url, {observe: 'response'});
  }

  getListExpiration(filter?: WarehouseProductParcelFilter): Observable<HttpResponse<any>> {
    const url = environment.apiUrl + this.getApiUrlExpiration(filter);
    return this.http.get<HttpResponse<any>>(url, {observe: 'response'});
  }

  getSummaryExpiration(filter?: WarehouseProductParcelFilter): Observable<HttpResponse<any>> {
    const url = environment.apiUrl + this.getApiUrlSummaryExpiration(filter);
    return this.http.get<HttpResponse<any>>(url, {observe: 'response'});
  }

  update(id: string, pos: any) {
    const url = environment.apiUrl + '/warehouse-product-parcel/' + id;
    return this.http.put<WarehouseProductParcel>(url, pos);
  }

  create(data) {
    const url = environment.apiUrl + '/warehouse-product-parcel';
    return this.http.post<WarehouseProductParcel>(url, data);
  }

  delete(id) {
    const url = environment.apiUrl + '/warehouse-product-parcel/' + id;
    return this.http.delete(url, {});
  }

  connect(id) {
    const url = environment.apiUrl + '/warehouse-product-parcel/connect?id=' + id;
    return this.http.post<any>(url, {});
  }

  disconnect(id) {
    const url = environment.apiUrl + '/warehouse-product-parcel/disconnect?id=' + id;
    return this.http.post<any>(url, {});
  }

  reconnect(id) {
    const url = environment.apiUrl + '/warehouse-product-parcel/connect?id=' + id + '&reconnect=1';
    return this.http.post(url, {});
  }

}




