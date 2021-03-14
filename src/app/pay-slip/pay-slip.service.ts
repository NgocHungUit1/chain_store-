import { Injectable } from '@angular/core';
import {BehaviorSubject, Observable} from 'rxjs';
import {HttpClient, HttpResponse} from '@angular/common/http';
import {environment} from '../../environments/environment';
import {PaySlip, PaySlipFilter} from './pay-slip.model';
import {PaySheet} from '../pay-sheet/pay-sheet.model';

@Injectable({
  providedIn: 'root'
})
export class PaySlipService {

  private loadPaySlip: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  subscribeLoadPaySlip: Observable<boolean> = this.loadPaySlip.asObservable();

  setLoadPaySlip(action: boolean) {
    this.loadPaySlip.next(action);
  }

  constructor(private http: HttpClient) { }

  getApiUrl(filter?: PaySlipFilter) {
    if (!filter.page) {
      filter.page = 1;
    }

    if (!filter.pageSize) {
      filter.pageSize = 5;
    }

    let url = '/pay-slip?per-page=' + filter.pageSize;

    url += '&' + filter.toFilterString();
    return url;
  }

  getStateUrl(filter?: PaySlipFilter) {

    let url = '/pay-slip/list';
    if (!filter.page) {
      filter.page = 1;
    }
    if (!filter.pageSize) {
      filter.pageSize = 5;
    }
    url += '?' + filter.toFilterString();
    return url;
  }

  getList(filter?: PaySlipFilter): Observable<HttpResponse<any>> {
    const url = environment.apiUrl + this.getApiUrl(filter);
    return this.http.get<HttpResponse<any>>(url, { observe: 'response' });
  }

  getDetail(id: string) {
    const url = environment.apiUrl + '/pay-slip/' + id;
    return this.http.get<PaySlip>(url);
  }

  update(id: string, pos: any) {
    const url = environment.apiUrl + '/pay-slip/' + id;
    return this.http.put<any>(url, pos);
  }

  delete(id: string) {
    const url = environment.apiUrl + '/pay-slip/' + id;
    return this.http.delete(url);
  }

  updateMultiplePaySlip(data) {
    const url = environment.apiUrl + '/pay-slip/update-multiple-pay-slip';
    return this.http.post(url, data);
  }

}
