import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { environment } from '../../environments/environment';
import { DateFilter, Invoice, InvoiceFilter } from './invoice.model';
import { AuthService } from '../authentication/auth.service';

@Injectable({
  providedIn: 'root'
})
export class InvoiceService {

  public dateFilter: BehaviorSubject<DateFilter> = new BehaviorSubject<DateFilter>(null);
  subscribeDateFilter: Observable<DateFilter> = this.dateFilter.asObservable();

  private loadInvoice: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  subscribeLoadInvoice: Observable<boolean> = this.loadInvoice.asObservable();

  setLoadInvoice(action: boolean) {
    this.loadInvoice.next(action);
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

  constructor(
    private http: HttpClient,
    private auth: AuthService
  ) {
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
    return this.http.get<HttpResponse<any>>(url, {observe: 'response'});
  }


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
    // const url = environment.apiUrl + '/invoice/delete/' + id;
    // return this.http.delete(url);
    const url = environment.apiUrl + '/invoice/delete-invoice';
    return this.http.post(url, {invoice_id: id});
  }

  autocomplete(term: string) {
    const url = environment.apiUrl + '/invoice/autocomplete?term=' + term;
    return this.http.get<Invoice[]>(url);
  }

  getDetail(invoice_id: string, price_book_id: string) {
    const url = environment.apiUrl + '/invoice/detail';
    return this.http.post(url, {invoice_id: invoice_id, price_book_id: price_book_id});
  }

  getApiUrlSumaryInvoice(filter?: InvoiceFilter) {
    if (!filter.page) {
      filter.page = 1;
    }

    if (!filter.pageSize) {
      filter.pageSize = 20;
    }

    let url = '/invoice/index-sumary?per-page=' + filter.pageSize;

    url += '&' + filter.toFilterString();
    return url;
  }

  getSumaryInvoice(filter?: InvoiceFilter): Observable<HttpResponse<any>> {
    const url = environment.apiUrl + this.getApiUrlSumaryInvoice(filter);
    return this.http.get<HttpResponse<any>>(url, {observe: 'response'});
  }

  connect(id) {
    const url = environment.apiUrl + '/invoice/connect?id=' + id;
    return this.http.post(url, {});
  }

  disconnect(id) {
    const url = environment.apiUrl + '/invoice/disconnect?id=' + id;
    return this.http.post(url, {});
  }

  reconnect(id) {
    const url = environment.apiUrl + '/invoice/connect?id=' + id + '&reconnect=1';
    return this.http.post(url, {});
  }

  payTheDebt(id) {
    const url = environment.apiUrl + '/invoice/pay-the-debt';
    return this.http.post<boolean>(url, {invoice_id: id});
  }

  /**
   * Export report excel
   * @param filter
   */
  exportExcel(filter?: InvoiceFilter): Observable<HttpResponse<any>> {
    const url = environment.apiUrl + '/invoice/export?' + filter.toFilterString();
    return this.http.get<HttpResponse<any>>(url, {observe: 'response'});
  }

  downloadFileExcel() {
    const _token = this.auth.getToken();
    const url = environment.apiUrl + '/invoice/download-template?token=' + _token;
    return url;
  }
}




