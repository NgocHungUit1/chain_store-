import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Customer, CustomerFilter } from '../customer/customer.model';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Doctor, DoctorFilter } from './doctor.model';
import { DateFilter } from '../supplier/supplier.model';

@Injectable({
  providedIn: 'root'
})
export class DoctorService {
  public dateFilter: BehaviorSubject<DateFilter> = new BehaviorSubject<DateFilter>(null);
  constructor(private http: HttpClient) { }

  getApiUrl(filter?: DoctorFilter) {
    if (!filter.page) {
      filter.page = 1;
    }

    if (!filter.pageSize) {
      filter.pageSize = 20;
    }

    let url = '/doctor?per-page=' + filter.pageSize;

    url += '&' + filter.toFilterString();
    return url;
  }

  getStateUrl(filter?: DoctorFilter) {

    let url = '/doctor/list';
    if (!filter.page) {
      filter.page = 1;
    }
    if (!filter.pageSize) {
      filter.pageSize = 20;
    }
    url += '?' + filter.toFilterString();
    return url;
  }

  getList(filter?: DoctorFilter): Observable<HttpResponse<any>> {
    const url = environment.apiUrl + this.getApiUrl(filter);
    return this.http.get<HttpResponse<any>>(url, { observe: 'response' });
  }

  getDetail(id: string, expand: string) {
    const url = environment.apiUrl + '/doctor/' + id + '?expand=' + expand;
    return this.http.get<Doctor>(url);
  }

  update(id: string, pos: any) {
    const url = environment.apiUrl + '/doctor/' + id;
    return this.http.put(url, pos);
  }

  create(data) {
    const url = environment.apiUrl + '/doctor';
    return this.http.post(url, data);
  }

  autocomplete(term: string) {
    const url = environment.apiUrl + '/doctor/autocomplete?term=' + term;
    return this.http.get<Doctor[]>(url);
  }

  getRenderNo() {
    const url = environment.apiUrl + '/doctor/render-no';
    return this.http.get<string>(url);
  }

  activate(id) {
    const url = environment.apiUrl + '/doctor/activate?id=' + id;
    return this.http.post(url, {});
  }

  lock(id) {
    const url = environment.apiUrl + '/doctor/lock?id=' + id;
    return this.http.post(url, {});
  }



  setDateFilter(obj: DateFilter) {
    this.dateFilter.next(obj);
  }

  getDateFilter() {
    return this.dateFilter.value;
  }

  convertDateYYYYMMDD(date: Date) {
    const month = date.getMonth() + 1;
    return date.getFullYear() + '-' + month + '-' + date.getDate();
  }
}
