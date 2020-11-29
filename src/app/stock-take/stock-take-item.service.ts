import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { AuthService } from '../authentication/auth.service';
import { StockTakeItem, StockTakeItemFilter } from './stock-take.model';
import { DateFilter, Invoice, InvoiceFilter } from '../invoice/invoice.model';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Warehouse } from '../warehouse/warehouse.model';

@Injectable({
  providedIn: 'root'
})
export class StockTakeItemService {

  public dateFilter: BehaviorSubject<DateFilter> = new BehaviorSubject<DateFilter>(null);
  subscribeDateFilter: Observable<DateFilter> = this.dateFilter.asObservable();

  constructor(
    private http: HttpClient,
    private auth: AuthService
  ) {
  }

  setDateFilter(obj: DateFilter) {
    this.dateFilter.next(obj);
  }

  getDateFilter() {
    return this.dateFilter.value;
  }

  convertDateYYYYMMDD(date: Date) {
    const month = date.getMonth() + 1;
    return date.getFullYear() + '-' + month + '-' + date.getDate();
  }

  getApiUrl(filter?: StockTakeItemFilter) {
    if (!filter.page) {
      filter.page = 1;
    }

    if (!filter.pageSize) {
      filter.pageSize = 20;
    }

    let url = '/stock-take-item?per-page=' + filter.pageSize;

    url += '&' + filter.toFilterString();
    return url;
  }

  getStateUrl(filter?: StockTakeItemFilter) {

    let url = '/stock-take-item/list';
    if (!filter.page) {
      filter.page = 1;
    }
    if (!filter.pageSize) {
      filter.pageSize = 20;
    }
    url += '?' + filter.toFilterString();
    return url;
  }

  getList(filter?: StockTakeItemFilter): Observable<HttpResponse<any>> {
    const url = environment.apiUrl + this.getApiUrl(filter);
    return this.http.get<HttpResponse<any>>(url, {observe: 'response'});
  }

  getDetail(id: string, expand: string = '') {
    const url = environment.apiUrl + '/stock-take-item/' + id + '?expand=' + expand;
    return this.http.get<StockTakeItem>(url);
  }

  update(id: string, pos: any) {
    const url = environment.apiUrl + '/stock-take-item/' + id;
    return this.http.put<StockTakeItem>(url, pos);
  }

  create(data) {
    const url = environment.apiUrl + '/stock-take-item';
    return this.http.post<StockTakeItem>(url, data);
  }



}
