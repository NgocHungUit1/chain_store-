import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient, HttpResponse } from '@angular/common/http';
import {BehaviorSubject, Observable} from 'rxjs';
import {Timesheet, TimesheetFilter} from './timesheet.model';

@Injectable({
  providedIn: 'root'
})
export class TimesheetService {

  private loadTimesheet: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  subscribeLoadTimesheet: Observable<boolean> = this.loadTimesheet.asObservable();

  setLoadTimesheet(action: boolean) {
    this.loadTimesheet.next(action);
  }

  constructor(private http: HttpClient) { }

  getApiUrl(filter?: TimesheetFilter) {
    if (!filter.page) {
      filter.page = 1;
    }

    if (!filter.pageSize) {
      filter.pageSize = 20;
    }

    let url = '/timesheet?per-page=' + filter.pageSize;

    url += '&' + filter.toFilterString();
    return url;
  }

  getStateUrl(filter?: TimesheetFilter) {

    let url = '/timesheet/list';
    if (!filter.page) {
      filter.page = 1;
    }
    if (!filter.pageSize) {
      filter.pageSize = 20;
    }
    url += '?' + filter.toFilterString();
    return url;
  }

  getList(filter?: TimesheetFilter): Observable<HttpResponse<any>> {
    const url = environment.apiUrl + this.getApiUrl(filter);
    return this.http.get<HttpResponse<any>>(url, { observe: 'response' });
  }

  getDetail(id: string) {
    const url = environment.apiUrl + '/timesheet/' + id;
    return this.http.get<Timesheet>(url);
  }

  update(id: string, pos: any) {
    const url = environment.apiUrl + '/timesheet/' + id;
    return this.http.put(url, pos);
  }

  create(data) {
    const url = environment.apiUrl + '/timesheet';
    return this.http.post(url, data);
  }

  createMultipleEmployee(data) {
    const url = environment.apiUrl + '/timesheet/create-multiple-employee';
    return this.http.post(url, data);
  }

  delete(id: string) {
    const url = environment.apiUrl + '/timesheet/' + id;
    return this.http.delete(url);
  }

  getShiftsList() {
    const url = environment.apiUrl + '/timesheet/shifts-list';
    return this.http.get<HttpResponse<any>>(url, { observe: 'response' });
  }

  deleteClocking(data) {
    const url = environment.apiUrl + '/timesheet/delete-clocking';
    return this.http.post(url, data);
  }

}
