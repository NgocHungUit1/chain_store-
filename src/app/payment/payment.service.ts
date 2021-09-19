import {Injectable} from '@angular/core';
import {BehaviorSubject, Observable} from 'rxjs';
import {DateFilter} from './payment.model';
import {HttpClient, HttpResponse} from '@angular/common/http';
import {PaymentFilter} from './payment.model';
import {environment} from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  constructor(
    private http: HttpClient) {
  }

  public dateFilter: BehaviorSubject<DateFilter> = new BehaviorSubject<DateFilter>(null);
  subscribeDateFilter: Observable<DateFilter> = this.dateFilter.asObservable();

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

  getApiUrlReportDebtForCustomers(filter?: PaymentFilter) {
    if (!filter.page) {
      filter.page = 1;
    }

    if (!filter.pageSize) {
      filter.pageSize = 20;
    }

    let url = '/report/customers-debt?per-page=' + filter.pageSize;

    url += '&' + filter.toFilterString();
    return url;
  }

  getListReportForCustomers(filter?: PaymentFilter): Observable<HttpResponse<any>> {
    const url = environment.apiUrl + this.getApiUrlReportDebtForCustomers(filter);
    return this.http.get<HttpResponse<any>>(url, {observe: 'response'});
  }

  getApiUrlReportDebtForSuppliers(filter?: PaymentFilter) {
    if (!filter.page) {
      filter.page = 1;
    }

    if (!filter.pageSize) {
      filter.pageSize = 20;
    }

    let url = '/report/suppliers-debt?per-page=' + filter.pageSize;

    url += '&' + filter.toFilterString();
    return url;
  }

  getListReportForSuppliers(filter?: PaymentFilter): Observable<HttpResponse<any>> {
    const url = environment.apiUrl + this.getApiUrlReportDebtForSuppliers(filter);
    return this.http.get<HttpResponse<any>>(url, {observe: 'response'});
  }
}
