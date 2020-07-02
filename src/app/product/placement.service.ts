import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { PlacementFilter } from "./placement.model";

@Injectable({
  providedIn: 'root'
})
export class PlacementService {

  constructor(private http: HttpClient) {
  }

  getApiUrl(filter?: PlacementFilter) {
    if (!filter.page) {
      filter.page = 1;
    }

    if (!filter.pageSize) {
      filter.pageSize = 20;
    }

    let url = '/placement?per-page=' + filter.pageSize;

    url += '&' + filter.toFilterString();
    return url;
  }

  getStateUrl(filter?: PlacementFilter) {

    let url = '/placement/list';
    if (!filter.page) {
      filter.page = 1;
    }
    if (!filter.pageSize) {
      filter.pageSize = 20;
    }
    url += '?' + filter.toFilterString();
    return url;
  }

  getList(filter?: PlacementFilter): Observable<HttpResponse<any>> {
    const url = environment.apiUrl + this.getApiUrl(filter);
    return this.http.get<HttpResponse<any>>(url, { observe: 'response' });
  }

  getDetail(id: string) {
    const url = environment.apiUrl + '/placement/' + id;
    return this.http.get<object>(url);
  }

  update(id: string, pos: any) {
    const url = environment.apiUrl + '/placement/' + id;
    return this.http.put(url, pos);
  }

  create(data) {
    const url = environment.apiUrl + '/placement';
    return this.http.post(url, data);
  }
}




