import { Injectable } from '@angular/core';
import {BehaviorSubject, Observable} from 'rxjs';
import {HttpClient, HttpResponse} from '@angular/common/http';
import {environment} from '../../environments/environment';
import {Clocking, ClockingFilter} from './clocking.model';

@Injectable({
  providedIn: 'root'
})
export class ClockingService {


  private loadClocking: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  subscribeLoadClocking: Observable<boolean> = this.loadClocking.asObservable();

  setLoadClocking(action: boolean) {
    this.loadClocking.next(action);
  }

  constructor(private http: HttpClient) { }

  getApiUrl(filter?: ClockingFilter) {
    if (!filter.page) {
      filter.page = 1;
    }

    if (!filter.pageSize) {
      filter.pageSize = 20;
    }

    let url = '/clocking?per-page=' + filter.pageSize;

    url += '&' + filter.toFilterString();
    return url;
  }

  getStateUrl(filter?: ClockingFilter) {

    let url = '/clocking/list';
    if (!filter.page) {
      filter.page = 1;
    }
    if (!filter.pageSize) {
      filter.pageSize = 20;
    }
    url += '?' + filter.toFilterString();
    return url;
  }

  getList(filter?: ClockingFilter): Observable<HttpResponse<any>> {
    const url = environment.apiUrl + this.getApiUrl(filter);
    return this.http.get<HttpResponse<any>>(url, { observe: 'response' });
  }

  getDetail(id: string) {
    const url = environment.apiUrl + '/clocking/' + id;
    return this.http.get<Clocking>(url);
  }

  update(id: string, pos: any) {
    const url = environment.apiUrl + '/clocking/' + id;
    return this.http.put(url, pos);
  }

  create(data) {
    const url = environment.apiUrl + '/clocking';
    return this.http.post(url, data);
  }

  delete(id: string) {
    const url = environment.apiUrl + '/clocking/' + id;
    return this.http.delete(url);
  }
}
