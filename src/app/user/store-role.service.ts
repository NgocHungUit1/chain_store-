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

  create(data) {
    const url = environment.apiUrl + '/store-role';
    return this.http.post(url, data).pipe(
      map(results => {
        return results;
      }),
      // catch errors
      catchError(err => throwError(err))
    );
  }

  getPermissionList(id): Observable<HttpResponse<any>> {
    const url = environment.apiUrl + '/store-role/get-permission-list?id=' + id;
    return this.http.get<HttpResponse<any>>(url, { observe: 'response' });
  }

  public getDetail(id: string): Observable<Object> {
    const url = environment.apiUrl + '/store-role/' + id;
    return this.http.get<Object>(url);
  }

  update(id: string, data: any) {
    const url = environment.apiUrl + '/store-role/' + id;
    return this.http.put(url, data).pipe(
      map(results => {
        return results;
      }),
      // catch errors
      catchError(err => throwError(err))
    );
  }

}




