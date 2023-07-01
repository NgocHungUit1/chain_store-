import {Injectable} from '@angular/core';
import {HttpClient, HttpResponse} from '@angular/common/http';
import {Observable, BehaviorSubject, of, throwError} from 'rxjs';
import {environment} from '../../environments/environment';
import {User, UserFilter} from './user.model';
import {catchError, map} from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class StoreRoleService {

  constructor(private http: HttpClient) {
  }

  getApiUrl(filter?: UserFilter) {
    if (!filter.page) {
      filter.page = 1;
    }

    if (!filter.pageSize) {
      filter.pageSize = 20;
    }

    let url = '/user?per-page=' + filter.pageSize;

    url += '&' + filter.toFilterString();
    return url;
  }

  getStateUrl(filter?: UserFilter) {

    let url = '/user/list';
    if (!filter.page) {
      filter.page = 1;
    }
    if (!filter.pageSize) {
      filter.pageSize = 20;
    }
    url += '?' + filter.toFilterString();
    return url;
  }

  getPermissionList(id): Observable<HttpResponse<any>> {
    const url = environment.apiUrl + '/store-role/get-permission-list?id=' + id;
    return this.http.get<HttpResponse<any>>(url, { observe: 'response' });
  }

}




