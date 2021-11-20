import {Injectable} from '@angular/core';
import {HttpClient, HttpResponse} from '@angular/common/http';
import {Observable} from 'rxjs';
import {environment} from '../../environments/environment';
import {NotificationFilter} from './notification.model';


@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  constructor(private http: HttpClient) {
  }

  getApiUrl(filter?: NotificationFilter) {
    if (!filter.page) {
      filter.page = 1;
    }

    if (!filter.pageSize) {
      filter.pageSize = 20;
    }

    let url = '/notification?per-page=' + filter.pageSize;

    url += '&' + filter.toFilterString();
    return url;
  }

  getStateUrl(filter?: NotificationFilter) {

    let url = '/notification/list';
    if (!filter.page) {
      filter.page = 1;
    }
    if (!filter.pageSize) {
      filter.pageSize = 20;
    }
    url += '?' + filter.toFilterString();
    return url;
  }

  getList(filter?: NotificationFilter): Observable<HttpResponse<any>> {
    const url = environment.apiUrl + this.getApiUrl(filter);
    return this.http.get<HttpResponse<any>>(url, {observe: 'response'});
  }

  getDetail(id: string) {
    const url = environment.apiUrl + '/notification/' + id;
    return this.http.get<object>(url);
  }

  update(id: string, pos: any) {
    const url = environment.apiUrl + '/notification/' + id;
    return this.http.put(url, pos);
  }

  create(data) {
    const url = environment.apiUrl + '/notification';
    return this.http.post(url, data);
  }

  delete(id: string) {
    const url = environment.apiUrl + '/notification/' + id;
    return this.http.delete(url);
  }
}




