import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from '../authentication/auth.service';
import { NotifierService } from 'angular-notifier';
import {InvoiceFilter} from '../invoice/invoice.model';


@Injectable({
  providedIn: 'root'
})
export class InvoiceReportService {

  constructor(
    private http: HttpClient,
    private auth: AuthService,
    public notifySer: NotifierService,
  ) {
  }

  /*
   *API for Report Sale
   */
  getApiUrlReportRevenue(filter?: InvoiceFilter) {
    if (!filter.page) {
      filter.page = 1;
    }

    if (!filter.pageSize) {
      filter.pageSize = 20;
    }

    let url = '/invoice-report/revenue?per-page=' + filter.pageSize;

    url += '&' + filter.toFilterString();
    return url;
  }

  getApiUrlSummaryReportRevenue(filter?: InvoiceFilter) {
    if (!filter.page) {
      filter.page = 1;
    }

    if (!filter.pageSize) {
      filter.pageSize = 20;
    }

    let url = '/invoice-report/summary-revenue?per-page=' + filter.pageSize;

    url += '&' + filter.toFilterString();
    return url;
  }

  getApiUrlReportProfit(filter?: InvoiceFilter) {
    if (!filter.page) {
      filter.page = 1;
    }

    if (!filter.pageSize) {
      filter.pageSize = 20;
    }

    let url = '/invoice-report/profit?per-page=' + filter.pageSize;

    url += '&' + filter.toFilterString();
    return url;
  }

  getApiUrlReportCommission(filter?: InvoiceFilter) {
    if (!filter.page) {
      filter.page = 1;
    }

    if (!filter.pageSize) {
      filter.pageSize = 20;
    }

    let url = '/invoice-report/commission?per-page=' + filter.pageSize;

    url += '&' + filter.toFilterString();
    return url;
  }

  getApiUrlSummaryReportProfit(filter?: InvoiceFilter) {
    if (!filter.page) {
      filter.page = 1;
    }

    if (!filter.pageSize) {
      filter.pageSize = 20;
    }

    let url = '/invoice-report/summary?per-page=' + filter.pageSize;

    url += '&' + filter.toFilterString();
    return url;
  }

  getApiUrlSummaryReportCommission(filter?: InvoiceFilter) {
    if (!filter.page) {
      filter.page = 1;
    }

    if (!filter.pageSize) {
      filter.pageSize = 20;
    }

    let url = '/invoice-report/summary?per-page=' + filter.pageSize;

    url += '&' + filter.toFilterString();
    return url;
  }

  getListReportRevenue(filter?: InvoiceFilter): Observable<HttpResponse<any>> {
    const url = environment.apiUrl + this.getApiUrlReportRevenue(filter);
    return this.http.get<HttpResponse<any>>(url, {observe: 'response'});
  }

  getSummaryReportRevenue(filter?: InvoiceFilter): Observable<HttpResponse<any>> {
    const url = environment.apiUrl + this.getApiUrlSummaryReportRevenue(filter);
    return this.http.get<HttpResponse<any>>(url, {observe: 'response'});
  }

  getListReportProfit(filter?: InvoiceFilter): Observable<HttpResponse<any>> {
    const url = environment.apiUrl + this.getApiUrlReportProfit(filter);
    return this.http.get<HttpResponse<any>>(url, {observe: 'response'});
  }

  getSummaryReportProfit(filter?: InvoiceFilter): Observable<HttpResponse<any>> {
    const url = environment.apiUrl + this.getApiUrlSummaryReportProfit(filter);
    return this.http.get<HttpResponse<any>>(url, {observe: 'response'});
  }

  getListReportCommission(filter?: InvoiceFilter): Observable<HttpResponse<any>> {
    const url = environment.apiUrl + this.getApiUrlReportCommission(filter);
    return this.http.get<HttpResponse<any>>(url, {observe: 'response'});
  }

  getSummaryReportCommission(filter?: InvoiceFilter): Observable<HttpResponse<any>> {
    const url = environment.apiUrl + this.getApiUrlSummaryReportCommission(filter);
    return this.http.get<HttpResponse<any>>(url, {observe: 'response'});
  }

}




