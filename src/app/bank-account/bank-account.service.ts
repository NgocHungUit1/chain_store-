import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { BankAccount, BankAccountFilter } from './bank-account.model';
import { DateFilter } from '../supplier/supplier.model';

@Injectable({
  providedIn: 'root'
})
export class BankAccountService {
  public dateFilter: BehaviorSubject<DateFilter> = new BehaviorSubject<DateFilter>(null);
  constructor(private http: HttpClient) { }

  getApiUrl(filter?: BankAccountFilter) {
    if (!filter.page) {
      filter.page = 1;
    }

    if (!filter.pageSize) {
      filter.pageSize = 20;
    }

    let url = '/bank-account?per-page=' + filter.pageSize;

    url += '&' + filter.toFilterString();
    return url;
  }

  getStateUrl(filter?: BankAccountFilter) {

    let url = '/bank-account/list';
    if (!filter.page) {
      filter.page = 1;
    }
    if (!filter.pageSize) {
      filter.pageSize = 20;
    }
    url += '?' + filter.toFilterString();
    return url;
  }

  getList(filter?: BankAccountFilter): Observable<HttpResponse<any>> {
    const url = environment.apiUrl + this.getApiUrl(filter);
    return this.http.get<HttpResponse<any>>(url, { observe: 'response' });
  }

  getDetail(id: string, expand: string = '') {
    const url = environment.apiUrl + '/bank-account/' + id + '?expand=' + expand;
    return this.http.get<BankAccount>(url);
  }

  update(id: string, pos: any) {
    const url = environment.apiUrl + '/bank-account/' + id;
    return this.http.put(url, pos);
  }

  create(data) {
    const url = environment.apiUrl + '/bank-account';
    return this.http.post(url, data);
  }

  autocomplete(term: string) {
    const url = environment.apiUrl + '/bank-account/autocomplete?term=' + term;
    return this.http.get<BankAccount[]>(url);
  }

  getRenderNo() {
    const url = environment.apiUrl + '/bank-account/render-no';
    return this.http.get<string>(url);
  }

  activate(id) {
    const url = environment.apiUrl + '/bank-account/activate?id=' + id;
    return this.http.post(url, {});
  }

  lock(id) {
    const url = environment.apiUrl + '/bank-account/lock?id=' + id;
    return this.http.post(url, {});
  }
}
