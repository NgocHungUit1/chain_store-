import {Injectable} from '@angular/core';
import {HttpClient, HttpResponse} from '@angular/common/http';
import {Observable, BehaviorSubject, of, throwError} from 'rxjs';
import {environment} from '../../environments/environment';
import {User, UserFilter} from './user.model';
import {catchError, map} from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class StorePermissionService {

  constructor(private http: HttpClient) {
  }

  getPermissionListWithGroup(): Observable<HttpResponse<any>> {
    const url = environment.apiUrl + '/store-permission/get-permission-list-with-group';
    return this.http.get<HttpResponse<any>>(url, { observe: 'response' });
  }

}




