import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { environment } from '../../environments/environment';
import { Customer, CustomerFilter } from './customer.model';
import { ResponseModel } from '../common/response.model';

@Injectable({
  providedIn: 'root'
})
export class CustomerService {

  private loadCustomer: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  subscribeLoadCustomer: Observable<boolean> = this.loadCustomer.asObservable();

  setLoadCustmer(action: boolean) {
    this.loadCustomer.next(action);
  }

  constructor(private http: HttpClient) {
  }

  getApiUrl(filter?: CustomerFilter) {
    if (!filter.page) {
      filter.page = 1;
    }

    if (!filter.pageSize) {
      filter.pageSize = 20;
    }

    let url = '/customer?per-page=' + filter.pageSize;

    url += '&' + filter.toFilterString();
    return url;
  }

  getStateUrl(filter?: CustomerFilter) {

    let url = '/customer/list';
    if (!filter.page) {
      filter.page = 1;
    }
    if (!filter.pageSize) {
      filter.pageSize = 20;
    }
    url += '?' + filter.toFilterString();
    return url;
  }

  getList(filter?: CustomerFilter): Observable<HttpResponse<any>> {
    const url = environment.apiUrl + this.getApiUrl(filter);
    return this.http.get<HttpResponse<any>>(url, {observe: 'response'});
  }

  getDetail(id: string, expand: string) {
    const url = environment.apiUrl + '/customer/' + id + '?expand=' + expand;
    return this.http.get<Customer>(url);
  }

  update(id: string, pos: any) {
    const url = environment.apiUrl + '/customer/' + id;
    return this.http.put(url, pos);
  }

  create(data) {
    const url = environment.apiUrl + '/customer';
    return this.http.post(url, data);
  }

  autocomplete(term: string) {
    const url = environment.apiUrl + '/customer/autocomplete?term=' + term;
    return this.http.get<Customer[]>(url);
  }

  activate(id) {
    const url = environment.apiUrl + '/customer/activate?id=' + id;
    return this.http.post(url, {});
  }

  lock(id) {
    const url = environment.apiUrl + '/customer/lock?id=' + id;
    return this.http.post(url, {});
  }

  delete(id: string) {
    // const url = environment.apiUrl + '/customer/delete-customer';
    // return this.http.post(url, { customer_id: id });
    const url = environment.apiUrl + '/customer/delete-customer?id=' + id;
    return this.http.post<ResponseModel>(url, {});
  }

  getNameStore(show = 1) {
    const url = environment.apiUrl + '/customer/name-store?show=' + show;
    return this.http.get<string>(url);
  }
}
