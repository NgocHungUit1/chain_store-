import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from '../authentication/auth.service';
import { MoveDetailFilter } from './move.model';

@Injectable({
  providedIn: 'root'
})
export class MoveDetailService {

  constructor(
    private http: HttpClient,
    private auth: AuthService
  ) {
  }

  getApiUrl(filter?: MoveDetailFilter) {
    if (!filter.page) {
      filter.page = 1;
    }

    if (!filter.pageSize) {
      filter.pageSize = 20;
    }

    let url = '/move-detail?per-page=' + filter.pageSize;

    url += '&' + filter.toFilterString();
    return url;
  }

  getStateUrl(filter?: MoveDetailFilter) {

    let url = '/move-detail/list';
    if (!filter.page) {
      filter.page = 1;
    }
    if (!filter.pageSize) {
      filter.pageSize = 20;
    }
    url += '?' + filter.toFilterString();
    return url;
  }

  getList(filter?: MoveDetailFilter): Observable<HttpResponse<any>> {
    const url = environment.apiUrl + this.getApiUrl(filter);
    return this.http.get<HttpResponse<any>>(url, {observe: 'response'});
  }

  update(id: string, pos: any) {
    const url = environment.apiUrl + '/move/' + id;
    return this.http.put(url, pos);
  }

  create(data) {
    const url = environment.apiUrl + '/move';
    return this.http.post(url, data);
  }

  delete(id: string) {
    const url = environment.apiUrl + '/move/delete-invoice';
    return this.http.post(url, {invoice_id: id});
  }

}




