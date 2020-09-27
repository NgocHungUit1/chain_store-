import { Injectable } from '@angular/core';
import {BehaviorSubject, Observable} from 'rxjs';
import {HttpClient, HttpResponse} from '@angular/common/http';
import {environment} from '../../environments/environment';
import {Employee, EmployeeFilter} from './employee.model';

@Injectable({
  providedIn: 'root'
})
export class EmployeeService {


  private loadEmployees: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  subscribeLoadEmployees: Observable<boolean> = this.loadEmployees.asObservable();

  setLoadEmployees(action: boolean) {
    this.loadEmployees.next(action);
  }

  constructor(private http: HttpClient) { }

  getApiUrl(filter?: EmployeeFilter) {
    if (!filter.page) {
      filter.page = 1;
    }

    if (!filter.pageSize) {
      filter.pageSize = 20;
    }

    let url = '/employee?per-page=' + filter.pageSize;

    url += '&' + filter.toFilterString();
    return url;
  }

  getStateUrl(filter?: EmployeeFilter) {

    let url = '/employee/list';
    if (!filter.page) {
      filter.page = 1;
    }
    if (!filter.pageSize) {
      filter.pageSize = 20;
    }
    url += '?' + filter.toFilterString();
    return url;
  }

  getList(filter?: EmployeeFilter): Observable<HttpResponse<any>> {
    const url = environment.apiUrl + this.getApiUrl(filter);
    return this.http.get<HttpResponse<any>>(url, { observe: 'response' });
  }

  getDetail(id: string, expand: string) {
    const url = environment.apiUrl + '/employee/' + id + '?expand=' + expand;
    return this.http.get<Employee>(url);
  }

  update(id: string, pos: any) {
    const url = environment.apiUrl + '/employee/' + id;
    return this.http.put(url, pos);
  }

  create(data) {
    const url = environment.apiUrl + '/employee';
    return this.http.post(url, data);
  }

  delete(id: string) {
    const url = environment.apiUrl + '/employee/' + id;
    return this.http.delete(url);
  }
}
