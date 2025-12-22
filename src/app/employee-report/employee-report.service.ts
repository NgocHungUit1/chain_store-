import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from '../authentication/auth.service';
import { NotifierService } from 'angular-notifier';
import {EmployeeFilter} from '../employee/employee.model';


@Injectable({
  providedIn: 'root'
})
export class EmployeeReportService {

  constructor(
    private http: HttpClient,
    private auth: AuthService,
    public notifySer: NotifierService,
  ) {
  }

  /*
   *API for Report Sale
   */
  getApiUrlReportRevenue(filter?: EmployeeFilter) {
    if (!filter.page) {
      filter.page = 1;
    }

    if (!filter.pageSize) {
      filter.pageSize = 20;
    }

    let url = '/employee-report/revenue?per-page=' + filter.pageSize;

    url += '&' + filter.toFilterString();
    return url;
  }

  getApiUrlSummaryReportRevenue(filter?: EmployeeFilter) {
    if (!filter.page) {
      filter.page = 1;
    }

    if (!filter.pageSize) {
      filter.pageSize = 20;
    }

    let url = '/employee-report/summary-revenue?per-page=' + filter.pageSize;

    url += '&' + filter.toFilterString();
    return url;
  }

  getApiUrlReportProfit(filter?: EmployeeFilter) {
    if (!filter.page) {
      filter.page = 1;
    }

    if (!filter.pageSize) {
      filter.pageSize = 20;
    }

    let url = '/employee-report/profit?per-page=' + filter.pageSize;

    url += '&' + filter.toFilterString();
    return url;
  }

  getApiUrlReportCommission(filter?: EmployeeFilter) {
    if (!filter.page) {
      filter.page = 1;
    }

    if (!filter.pageSize) {
      filter.pageSize = 20;
    }

    let url = '/employee-report/commission?per-page=' + filter.pageSize;

    url += '&' + filter.toFilterString();
    return url;
  }

  getApiUrlReportSale(filter?: EmployeeFilter) {
    if (!filter.page) {
      filter.page = 1;
    }

    if (!filter.pageSize) {
      filter.pageSize = 20;
    }

    let url = '/employee-report/sale?per-page=' + filter.pageSize;

    url += '&' + filter.toFilterString();
    return url;
  }

  getApiUrlSummaryReportProfit(filter?: EmployeeFilter) {
    if (!filter.page) {
      filter.page = 1;
    }

    if (!filter.pageSize) {
      filter.pageSize = 20;
    }

    let url = '/employee-report/summary-profit?per-page=' + filter.pageSize;

    url += '&' + filter.toFilterString();
    return url;
  }

  getApiUrlSummaryReportCommission(filter?: EmployeeFilter) {
    if (!filter.page) {
      filter.page = 1;
    }

    if (!filter.pageSize) {
      filter.pageSize = 20;
    }

    let url = '/employee-report/summary-commission?per-page=' + filter.pageSize;

    url += '&' + filter.toFilterString();
    return url;
  }

  getApiUrlSummaryReportSale(filter?: EmployeeFilter) {
    if (!filter.page) {
      filter.page = 1;
    }

    if (!filter.pageSize) {
      filter.pageSize = 20;
    }

    let url = '/employee-report/summary-sale?per-page=' + filter.pageSize;

    url += '&' + filter.toFilterString();
    return url;
  }

  getListReportRevenue(filter?: EmployeeFilter): Observable<HttpResponse<any>> {
    const url = environment.apiUrl + this.getApiUrlReportRevenue(filter);
    return this.http.get<HttpResponse<any>>(url, {observe: 'response'});
  }

  getSummaryReportRevenue(filter?: EmployeeFilter): Observable<HttpResponse<any>> {
    const url = environment.apiUrl + this.getApiUrlSummaryReportRevenue(filter);
    return this.http.get<HttpResponse<any>>(url, {observe: 'response'});
  }

  getListReportProfit(filter?: EmployeeFilter): Observable<HttpResponse<any>> {
    const url = environment.apiUrl + this.getApiUrlReportProfit(filter);
    return this.http.get<HttpResponse<any>>(url, {observe: 'response'});
  }

  getSummaryReportProfit(filter?: EmployeeFilter): Observable<HttpResponse<any>> {
    const url = environment.apiUrl + this.getApiUrlSummaryReportProfit(filter);
    return this.http.get<HttpResponse<any>>(url, {observe: 'response'});
  }

  getListReportCommission(filter?: EmployeeFilter): Observable<HttpResponse<any>> {
    const url = environment.apiUrl + this.getApiUrlReportCommission(filter);
    return this.http.get<HttpResponse<any>>(url, {observe: 'response'});
  }

  getSummaryReportCommission(filter?: EmployeeFilter): Observable<HttpResponse<any>> {
    const url = environment.apiUrl + this.getApiUrlSummaryReportCommission(filter);
    return this.http.get<HttpResponse<any>>(url, {observe: 'response'});
  }

  getListReportSale(filter?: EmployeeFilter): Observable<HttpResponse<any>> {
    const url = environment.apiUrl + this.getApiUrlReportSale(filter);
    return this.http.get<HttpResponse<any>>(url, {observe: 'response'});
  }

  getSummaryReportSale(filter?: EmployeeFilter): Observable<HttpResponse<any>> {
    const url = environment.apiUrl + this.getApiUrlSummaryReportSale(filter);
    return this.http.get<HttpResponse<any>>(url, {observe: 'response'});
  }

}




