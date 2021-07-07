import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import {Observable, BehaviorSubject, of, throwError} from 'rxjs';
import { environment } from '../../environments/environment';
import {catchError, map} from 'rxjs/operators';
import { CashFlow, CashFlowFilter } from './cash-flow.model';

@Injectable({
  providedIn: 'root'
})
export class CashFlowService {


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



  activate(id) {
    const url = environment.apiUrl + '/user/activate?id=' + id;
    return this.http.post(url, {});
  }

  lock(id) {
    const url = environment.apiUrl + '/user/lock?id=' + id;
    return this.http.post(url, {});
  }


}




