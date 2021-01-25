import { Injectable } from '@angular/core';
import {BehaviorSubject, Observable} from 'rxjs';
import {HttpClient, HttpResponse} from '@angular/common/http';
import {environment} from '../../environments/environment';
import {PaySheet, PaySheetFilter} from './pay-sheet.model';

@Injectable({
  providedIn: 'root'
})
export class PaySheetService {

  private loadPaySheet: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  subscribeLoadPaySheet: Observable<boolean> = this.loadPaySheet.asObservable();

  setLoadPaySheet(action: boolean) {
    this.loadPaySheet.next(action);
  }

  constructor(private http: HttpClient) { }

  getApiUrl(filter?: PaySheetFilter) {
    if (!filter.page) {
      filter.page = 1;
    }

    if (!filter.pageSize) {
      filter.pageSize = 20;
    }

    let url = '/pay-sheet?per-page=' + filter.pageSize;

    url += '&' + filter.toFilterString();
    return url;
  }

  getStateUrl(filter?: PaySheetFilter) {

    let url = '/pay-sheet/list';
    if (!filter.page) {
      filter.page = 1;
    }
    if (!filter.pageSize) {
      filter.pageSize = 20;
    }
    url += '?' + filter.toFilterString();
    return url;
  }

  getList(filter?: PaySheetFilter): Observable<HttpResponse<any>> {
    const url = environment.apiUrl + this.getApiUrl(filter);
    return this.http.get<HttpResponse<any>>(url, { observe: 'response' });
  }

  getDetail(id: string) {
    const url = environment.apiUrl + '/pay-sheet/' + id;
    return this.http.get<PaySheet>(url);
  }

  update(id: string, pos: any) {
    const url = environment.apiUrl + '/pay-sheet/' + id;
    return this.http.put<PaySheet>(url, pos);
  }

  create(data) {
    const url = environment.apiUrl + '/pay-sheet';
    return this.http.post(url, data);
  }

  delete(id: string) {
    const url = environment.apiUrl + '/pay-sheet/' + id;
    return this.http.delete(url);
  }
}
