import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { AuthService } from '../authentication/auth.service';
import { DateFilter, resStockTakePrint, StockTake, StockTakeFilter } from './stock-take.model';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class StockTakeService {

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

  getApiUrl(filter?: StockTakeFilter) {
    if (!filter.page) {
      filter.page = 1;
    }

    if (!filter.pageSize) {
      filter.pageSize = 20;
    }

    let url = '/stock-take?per-page=' + filter.pageSize;

    url += '&' + filter.toFilterString();
    return url;
  }

  getStateUrl(filter?: StockTakeFilter) {

    let url = '/stock-take/list';
    if (!filter.page) {
      filter.page = 1;
    }
    if (!filter.pageSize) {
      filter.pageSize = 20;
    }
    url += '?' + filter.toFilterString();
    return url;
  }

  getList(filter?: StockTakeFilter): Observable<HttpResponse<any>> {
    const url = environment.apiUrl + this.getApiUrl(filter);
    return this.http.get<HttpResponse<any>>(url, {observe: 'response'});
  }

  getDetail(id: string, expand: string = '') {
    const url = environment.apiUrl + '/stock-take/' + id + '?expand=' + expand;
    return this.http.get<StockTake>(url);
  }

  update(id: string, pos: any) {
    const url = environment.apiUrl + '/stock-take/' + id;
    return this.http.put<StockTake>(url, pos);
  }

  create(data) {
    const url = environment.apiUrl + '/stock-take';
    return this.http.post<StockTake>(url, data);
  }

  autocomplete(term: string) {
    const url = environment.apiUrl + '/stock-take/autocomplete?term=' + term;
    return this.http.get<StockTake[]>(url);
  }

  getRenderStockTakeNo() {
    const url = environment.apiUrl + '/stock-take/render-no';
    return this.http.get<string>(url);
  }

  updateBalanceStatus(id: string, balance_status: string) {
    const url = environment.apiUrl + '/stock-take/update-balance-status/';
    return this.http.post<StockTake>(url, {id: id, balance_status: balance_status});
  }

  getDataStockTakeToPrint(id: string) {
    const url = environment.apiUrl + '/stock-take/get-data-print/';
    return this.http.post<resStockTakePrint>(url, {id: id});
  }


}
