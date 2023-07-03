import {Injectable} from '@angular/core';
import {HttpClient, HttpResponse} from '@angular/common/http';
import {Observable, BehaviorSubject, of, throwError} from 'rxjs';
import {environment} from '../../environments/environment';
import {User, UserFilter} from './user.model';
import {catchError, map} from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class StoreUserPermissionService {

  constructor(private http: HttpClient) {
  }

  getPermissionByUser(id): Observable<HttpResponse<any>> {
    const url = environment.apiUrl + '/store-user-permission/get-by-user?id=' + id;
    return this.http.get<HttpResponse<any>>(url, { observe: 'response' });
  }

  updatePermission(id: string, data: any) {
    const url = environment.apiUrl + '/store-user-permission/update-user?id=' + id;
    return this.http.post<boolean>(url, data);
  }

}




