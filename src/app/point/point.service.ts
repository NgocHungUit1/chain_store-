import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { PointFilter } from "./point.model";

@Injectable({
  providedIn: 'root'
})
export class PointService {

  constructor(private http: HttpClient) {
  }

  getApiUrl(filter?: PointFilter) {
    if (!filter.page) {
      filter.page = 1;
    }

    if (!filter.pageSize) {
      filter.pageSize = 20;
    }

    let url = '/point?per-page=' + filter.pageSize;
    url += '&' + filter.toFilterString();
    return url;
  }

  getList(filter?: PointFilter): Observable<HttpResponse<any>> {
    const url = environment.apiUrl + this.getApiUrl(filter);
    return this.http.get<HttpResponse<any>>(url, { observe: 'response' });
  }
}



