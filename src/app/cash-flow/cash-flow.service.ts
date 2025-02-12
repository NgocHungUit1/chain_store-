import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import {Observable, BehaviorSubject, of, throwError} from 'rxjs';
import { environment } from '../../environments/environment';
import {catchError, map} from 'rxjs/operators';
import { CashFlow, CashFlowFilter } from './cash-flow.model';
import { Branch } from '../branch/branch.model';
import {EmployeeFilter} from '../employee/employee.model';
import {DateFilter} from '../invoice/invoice.model';

@Injectable({
  providedIn: 'root'
})
export class CashFlowService {

  public dateFilter: BehaviorSubject<DateFilter> = new BehaviorSubject<DateFilter>(null);
  subscribeDateFilter: Observable<DateFilter> = this.dateFilter.asObservable();

  constructor(private http: HttpClient) {
  }

  getApiUrl(filter?: CashFlowFilter) {
    if (!filter.page) {
      filter.page = 1;
    }

    if (!filter.pageSize) {
      filter.pageSize = 20;
    }

    let url = '/cash-flow?per-page=' + filter.pageSize;

    url += '&' + filter.toFilterString();
    return url;
  }

  getStateUrl(filter?: CashFlowFilter) {

    let url = '/cash-flow/list';
    if (!filter.page) {
      filter.page = 1;
    }
    if (!filter.pageSize) {
      filter.pageSize = 20;
    }
    url += '?' + filter.toFilterString();
    return url;
  }

  getList(filter?: CashFlowFilter): Observable<HttpResponse<any>> {
    const url = environment.apiUrl + this.getApiUrl(filter);
    return this.http.get<HttpResponse<any>>(url, { observe: 'response' });
  }

  getApiUrlSummary(filter?: CashFlowFilter) {
    if (!filter.page) {
      filter.page = 1;
    }

    if (!filter.pageSize) {
      filter.pageSize = 20;
    }

    let url = '/cash-flow/summary?per-page=' + filter.pageSize;

    url += '&' + filter.toFilterString();
    return url;
  }

  getSummary(filter?: CashFlowFilter): Observable<HttpResponse<any>> {
    const url = environment.apiUrl + this.getApiUrlSummary(filter);
    return this.http.get<HttpResponse<any>>(url, {observe: 'response'});
  }

  public getUser(id: string): Observable<CashFlow> {
    const url = environment.apiUrl + '/cash-flow/' + id;
    return this.http.get<CashFlow>(url);
  }

  update(id: string, pos: any) {
    const url = environment.apiUrl + '/cash-flow/' + id;
    return this.http.put(url, pos).pipe(
      map(results => {
        return results;
      }),
      // catch errors
      catchError(err => throwError(err))
    );
  }

  create(data) {
    const url = environment.apiUrl + '/cash-flow';
    return this.http.post(url, data).pipe(
      map(results => {
        return results;
      }),
      // catch errors
      catchError(err => throwError(err))
    );
  }

  delete(id: string) {
    const url = environment.apiUrl + '/cash-flow/' + id;
    return this.http.delete(url);
  }

  autocomplete(term: string) {
    const url = environment.apiUrl + '/cash-flow/autocomplete?term=' + term;
    return this.http.get<CashFlow[]>(url);
  }

  getRenderNo() {
    const url = environment.apiUrl + '/cash-flow/render-no';
    return this.http.get<string>(url);
  }

  getDetail(id: string, expand = '') {
    const url = environment.apiUrl + '/cash-flow/' + id + '?expand=' + expand;
    return this.http.get<CashFlow>(url);
  }

  setDateFilter(obj: DateFilter) {
    this.dateFilter.next(obj);
  }

  getDateFilter() {
    return this.dateFilter.value;
  }
}




