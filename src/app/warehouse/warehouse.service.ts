import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { resWarehousePrint, Warehouse, WarehouseFilter } from './warehouse.model';
import { ResInvoicePrint } from '../sale/order.model';
import { AuthService } from '../authentication/auth.service';
import {InvoiceFilter} from '../invoice/invoice.model';

@Injectable({
  providedIn: 'root'
})
export class WarehouseService {

  constructor(private http: HttpClient, private auth: AuthService) {
  }

  getApiUrl(filter?: WarehouseFilter) {
    if (!filter.page) {
      filter.page = 1;
    }

    if (!filter.pageSize) {
      filter.pageSize = 20;
    }

    let url = '/warehouse?per-page=' + filter.pageSize;

    url += '&' + filter.toFilterString();
    return url;
  }

  getStateUrl(filter?: WarehouseFilter) {

    let url = '/warehouse/list';
    if (!filter.page) {
      filter.page = 1;
    }
    if (!filter.pageSize) {
      filter.pageSize = 20;
    }
    url += '?' + filter.toFilterString();
    return url;
  }

  getList(filter?: WarehouseFilter): Observable<HttpResponse<any>> {
    const url = environment.apiUrl + this.getApiUrl(filter);
    return this.http.get<HttpResponse<any>>(url, {observe: 'response'});
  }

  getDetail(id: string, expand: string = '') {
    const url = environment.apiUrl + '/warehouse/' + id + '?expand=' + expand;
    return this.http.get<Warehouse>(url);
  }

  update(id: string, pos: any) {
    const url = environment.apiUrl + '/warehouse/' + id;
    return this.http.put<Warehouse>(url, pos);
  }

  create(data) {
    const url = environment.apiUrl + '/warehouse';
    return this.http.post<Warehouse>(url, data);
  }

  autocomplete(term: string) {
    const url = environment.apiUrl + '/warehouse/autocomplete?term=' + term;
    return this.http.get<Warehouse[]>(url);
  }

  activate(id) {
    const url = environment.apiUrl + '/warehouse/activate?id=' + id;
    return this.http.post(url, {});
  }

  lock(id) {
    const url = environment.apiUrl + '/warehouse/lock?id=' + id;
    return this.http.post(url, {});
  }

  delete(id) {
    const url = environment.apiUrl + '/warehouse/' + id;
    return this.http.delete(url, {});
  }

  connect(id) {
    const url = environment.apiUrl + '/warehouse/connect?id=' + id;
    return this.http.post<any>(url, {});
  }

  disconnect(id) {
    const url = environment.apiUrl + '/warehouse/disconnect?id=' + id;
    return this.http.post<any>(url, {});
  }

  reconnect(id) {
    const url = environment.apiUrl + '/warehouse/connect?id=' + id + '&reconnect=1';
    return this.http.post(url, {});
  }

  getRenderWarehouseNo() {
    const url = environment.apiUrl + '/warehouse/render-warehouse-no';
    return this.http.get<string>(url);
  }

  /**
   * Get data warehouse to print
   * @param id
   */
  getDataWarehouseToPrint(id: string) {
    const url = environment.apiUrl + '/warehouse/get-data-warehouse-print/';
    return this.http.post<resWarehousePrint>(url, {id: id});
  }

  /**
   * Use on Invoice Import Excel
   */
  getDownloadTemplateLink() {
    const _token = this.auth.getToken();
    const url = environment.apiUrl + '/warehouse/download-template?token=' + _token;
    return url;
  }

  upload(data) {
    const url = environment.apiUrl + '/warehouse/upload';
    return this.http.post(url, data);
  }

  /**
   * get Export excel link
   * @param filter
   */
  getDownloadLink(filter?: WarehouseFilter) {
    const _token = this.auth.getToken();

    return environment.apiUrl + '/warehouse/export-raw?' + filter.toFilterString() + '&token=' + _token;
  }
}




