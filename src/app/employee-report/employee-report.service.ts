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

  getListReportRevenue(filter?: EmployeeFilter): Observable<HttpResponse<any>> {
    const url = environment.apiUrl + this.getApiUrlReportRevenue(filter);
    return this.http.get<HttpResponse<any>>(url, {observe: 'response'});
  }

  getListReportProfit(filter?: EmployeeFilter): Observable<HttpResponse<any>> {
    const url = environment.apiUrl + this.getApiUrlReportProfit(filter);
    return this.http.get<HttpResponse<any>>(url, {observe: 'response'});
  }
}




