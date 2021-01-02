import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { ExpensesTransactionFilter, ExpensesTransaction } from './expenses-transaction.model';

@Injectable({
  providedIn: 'root'
})
export class ExpensesTransactionService {

  constructor(private http: HttpClient) {
  }

  getApiUrl(filter?: ExpensesTransactionFilter) {
    if (!filter.page) {
      filter.page = 1;
    }

    if (!filter.pageSize) {
      filter.pageSize = 20;
    }

    let url = '/expenses-transaction?per-page=' + filter.pageSize;

    url += '&' + filter.toFilterString();
    return url;
  }

  getStateUrl(filter?: ExpensesTransactionFilter) {

    let url = '/expenses-transaction/list';
    if (!filter.page) {
      filter.page = 1;
    }
    if (!filter.pageSize) {
      filter.pageSize = 20;
    }
    url += '?' + filter.toFilterString();
    return url;
  }

  getList(filter?: ExpensesTransactionFilter): Observable<HttpResponse<any>> {
    const url = environment.apiUrl + this.getApiUrl(filter);
    return this.http.get<HttpResponse<any>>(url, {observe: 'response'});
  }

  getDetail(id: string) {
    const url = environment.apiUrl + '/expenses-transaction/' + id;
    return this.http.get<ExpensesTransaction>(url);
  }

  update(id: string, pos: any) {
    const url = environment.apiUrl + '/expenses-transaction/' + id;
    return this.http.put(url, pos);
  }

  create(data) {
    const url = environment.apiUrl + '/expenses-transaction';
    return this.http.post(url, data);
  }

  delete(id: string) {
    const url = environment.apiUrl + '/expenses-transaction/' + id;
    return this.http.delete(url);
  }

  getRenderExpensesTransactionNo() {
    const url = environment.apiUrl + '/expenses-transaction/render-no';
    return this.http.get<string>(url);
  }
}
