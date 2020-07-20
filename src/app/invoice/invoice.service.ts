import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { environment } from '../../environments/environment';
import { Invoice, InvoiceFilter } from './invoice.model';

@Injectable({
  providedIn: 'root'
})
export class InvoiceService {

  constructor(private http: HttpClient) {
  }

  getApiUrl(filter?: InvoiceFilter) {
    if (!filter.page) {
      filter.page = 1;
    }

    if (!filter.pageSize) {
      filter.pageSize = 20;
    }

    let url = '/invoice?per-page=' + filter.pageSize;

    url += '&' + filter.toFilterString();
    return url;
  }

  getStateUrl(filter?: InvoiceFilter) {

    let url = '/invoice/list';
    if (!filter.page) {
      filter.page = 1;
    }
    if (!filter.pageSize) {
      filter.pageSize = 20;
    }
    url += '?' + filter.toFilterString();
    return url;
  }

  getList(filter?: InvoiceFilter): Observable<HttpResponse<any>> {
    const url = environment.apiUrl + this.getApiUrl(filter);
    return this.http.get<HttpResponse<any>>(url, { observe: 'response' });
  }

  // getDetail(id: string, expand: string = '') {
  //   const url = environment.apiUrl + '/invoice/' + id + '?expand=' + expand;
  //   return this.http.get<object>(url);
  // }

  public getInvoices(id: string, expand: string = ''): Observable<Invoice> {
    const url = environment.apiUrl + '/invoice/' + id + '?expand=' + expand;
    return this.http.get<Invoice>(url);
  }

  update(id: string, pos: any) {
    const url = environment.apiUrl + '/invoice/' + id;
    return this.http.put(url, pos);
  }

  create(data) {
    const url = environment.apiUrl + '/invoice';
    return this.http.post(url, data);
  }

  delete(id: string) {
    const url = environment.apiUrl + '/invoice/delete/' + id;
    return this.http.delete(url);
  }

  autocomplete(term: string) {
    const url = environment.apiUrl + '/invoice/autocomplete?term=' + term;
    return this.http.get<Invoice[]>(url);
  }

  getDetail(invoice_id: string, price_book_id: string) {
    const url = environment.apiUrl + '/invoice/detail';
    return this.http.post(url, { invoice_id: invoice_id, price_book_id: price_book_id });
  }

}




