import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient, HttpResponse } from '@angular/common/http';
import {BehaviorSubject, Observable} from 'rxjs';
import {Shifts, ShiftsFilter} from './shifts.model';

@Injectable({
  providedIn: 'root'
})
export class ShiftsService {

  private loadShifts: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  subscribeLoadShifts: Observable<boolean> = this.loadShifts.asObservable();

  setLoadShifts(action: boolean) {
    this.loadShifts.next(action);
  }

  constructor(private http: HttpClient) { }

  getApiUrl(filter?: ShiftsFilter) {
    if (!filter.page) {
      filter.page = 1;
    }

    if (!filter.pageSize) {
      filter.pageSize = 20;
    }

    let url = '/shifts?per-page=' + filter.pageSize;

    url += '&' + filter.toFilterString();
    return url;
  }

  getStateUrl(filter?: ShiftsFilter) {

    let url = '/shifts/list';
    if (!filter.page) {
      filter.page = 1;
    }
    if (!filter.pageSize) {
      filter.pageSize = 20;
    }
    url += '?' + filter.toFilterString();
    return url;
  }

  getList(filter?: ShiftsFilter): Observable<HttpResponse<any>> {
    const url = environment.apiUrl + this.getApiUrl(filter);
    return this.http.get<HttpResponse<any>>(url, { observe: 'response' });
  }

  getDetail(id: string) {
    const url = environment.apiUrl + '/shifts/' + id;
    return this.http.get<Shifts>(url);
  }

  update(id: string, pos: any) {
    const url = environment.apiUrl + '/shifts/' + id;
    return this.http.put(url, pos);
  }

  create(data) {
    const url = environment.apiUrl + '/shifts';
    return this.http.post(url, data);
  }

  delete(id: string) {
    const url = environment.apiUrl + '/shifts/' + id;
    return this.http.delete(url);
  }
}
