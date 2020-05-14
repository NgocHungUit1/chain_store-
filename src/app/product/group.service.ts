import {Injectable} from '@angular/core';
import {HttpClient, HttpResponse} from '@angular/common/http';
import {Observable} from 'rxjs';
import {environment} from '../../environments/environment';
import {GroupFilter} from "./group.model";

@Injectable({
  providedIn: 'root'
})
export class GroupService {

  constructor(private http: HttpClient) {
  }

  getApiUrl(filter?: GroupFilter) {
    if (!filter.page) {
      filter.page = 1;
    }

    if (!filter.pageSize) {
      filter.pageSize = 20;
    }

    let url = '/group?per-page=' + filter.pageSize;

    url += '&' + filter.toFilterString();
    return url;
  }

  getStateUrl(filter?: GroupFilter) {

    let url = '/group/list';
    if (!filter.page) {
      filter.page = 1;
    }
    if (!filter.pageSize) {
      filter.pageSize = 20;
    }
    url += '?' + filter.toFilterString();
    return url;
  }

  getList(filter?: GroupFilter): Observable<HttpResponse<any>> {
    const url = environment.apiUrl + this.getApiUrl(filter);
    return this.http.get<HttpResponse<any>>(url, {observe: 'response'});
  }

  getDetail(id: string) {
    const url = environment.apiUrl + '/group/' + id;
    return this.http.get<object>(url);
  }

  update(id: string, pos: any) {
    const url = environment.apiUrl + '/group/' + id;
    return this.http.put(url, pos);
  }

  create(data) {
    const url = environment.apiUrl + '/group';
    return this.http.post(url, data);
  }
}




