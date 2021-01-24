import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { ExpensesOrder, ExpensesOrderFilter } from './expenses-order.model';

@Injectable({
  providedIn: 'root'
})

export class ExpensesOrderService {

  constructor(private http: HttpClient) {
  }

  getApiUrl(filter?: ExpensesOrderFilter) {
    if (!filter.page) {
      filter.page = 1;
    }

    if (!filter.pageSize) {
      filter.pageSize = 20;
    }

    let url = '/expenses-order?per-page=' + filter.pageSize;

    url += '&' + filter.toFilterString();
    return url;
  }

  getStateUrl(filter?: ExpensesOrderFilter) {

    let url = '/expenses-order/list';
    if (!filter.page) {
      filter.page = 1;
    }
    if (!filter.pageSize) {
      filter.pageSize = 20;
    }
    url += '?' + filter.toFilterString();
    return url;
  }

  getList(filter?: ExpensesOrderFilter): Observable<HttpResponse<any>> {
    const url = environment.apiUrl + this.getApiUrl(filter);
    return this.http.get<HttpResponse<any>>(url, {observe: 'response'});
  }

  getDetail(id: string) {
    const url = environment.apiUrl + '/expenses-order/' + id;
    return this.http.get<ExpensesOrder>(url);
  }

  update(id: string, pos: any) {
    const url = environment.apiUrl + '/expenses-order/' + id;
    return this.http.put(url, pos);
  }

  create(data) {
    const url = environment.apiUrl + '/expenses-order';
    return this.http.post(url, data);
  }

  delete(id: string) {
    const url = environment.apiUrl + '/expenses-order/' + id;
    return this.http.delete(url);
  }

  getRenderExpensesOrderNo() {
    const url = environment.apiUrl + '/expenses-order/render-no';
    return this.http.get<string>(url);
  }
}
