import {Injectable} from '@angular/core';
import {HttpClient, HttpResponse} from '@angular/common/http';
import {Observable, BehaviorSubject, of, throwError} from 'rxjs';
import {environment} from '../../environments/environment';
import {User, UserFilter} from './user.model';
import {catchError, map} from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private loadUser: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  subscribeLoadUser: Observable<boolean> = this.loadUser.asObservable();

  setLoadUser(action: boolean) {
    this.loadUser.next(action);
  }

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

  getList(filter?: UserFilter): Observable<HttpResponse<any>> {
    const url = environment.apiUrl + this.getApiUrl(filter);
    return this.http.get<HttpResponse<any>>(url, {observe: 'response'});
  }

  getListShort(): Observable<HttpResponse<any>> {
    const filter = new UserFilter();
    filter.page = 1;
    filter.pageSize = 100;

    const url = environment.apiUrl + this.getApiUrl(filter);
    return this.http.get<HttpResponse<any>>(url, { observe: 'response' });
  }

  public getUser(id: string): Observable<User> {
    const url = environment.apiUrl + '/user/' + id;
    return this.http.get<User>(url);
  }

  updatePermission(id: string, data: any) {
    const url = environment.apiUrl + '/user/update-permission?id=' + id;
    return this.http.post<boolean>(url, data);
  }

  update(id: string, pos: any) {
    const url = environment.apiUrl + '/user/' + id;
    return this.http.put(url, pos).pipe(
      map(results => {
        return results;
      }),
      // catch errors
      catchError(err => throwError(err))
    );
  }

  create(data) {
    const url = environment.apiUrl + '/user';
    return this.http.post(url, data).pipe(
      map(results => {
        return results;
      }),
      // catch errors
      catchError(err => throwError(err))
    );
  }

  delete(id: string) {
    const url = environment.apiUrl + '/user/' + id;
    return this.http.delete(url);
  }

  autocomplete(term: string) {
    const url = environment.apiUrl + '/user/autocomplete?term=' + term;
    return this.http.get<User[]>(url);
  }

  getUserLogin() {
    const url = environment.apiUrl + '/user/login';
    return this.http.get<User>(url);
  }

  activate(id) {
    const url = environment.apiUrl + '/user/activate?id=' + id;
    return this.http.post(url, {});
  }

  lock(id) {
    const url = environment.apiUrl + '/user/lock?id=' + id;
    return this.http.post(url, {});
  }

  getUserRole() {
    const url = environment.apiUrl + '/user/roles';
    return this.http.get<any>(url);
  }

  getStoreRoleList() {
    const url = environment.apiUrl + '/user/store-role-list';
    return this.http.get<HttpResponse<any>>(url, {observe: 'response'});
  }

  getStoreBranchList() {
    const url = environment.apiUrl + '/user/branch-list';
    return this.http.get<HttpResponse<any>>(url, {observe: 'response'});
  }

  getBranchLogin() {
    const url = environment.apiUrl + '/user/branch-login';
    return this.http.get<number>(url);
  }

  updateBranchLogin(data) {
    const url = environment.apiUrl + '/user/update-branch-login';
    return this.http.post(url, data);
  }

  getRemainingExpiryDate() {
    const url = environment.apiUrl + '/user/remaining-expiry-date';
    return this.http.get<number>(url);
  }

  getAllPermission() {
    const url = environment.apiUrl + '/user/all-permission';
    return this.http.get<HttpResponse<any>>(url);
  }

  isAdminStore() {
    const url = environment.apiUrl + '/user/is-admin-store';
    return this.http.get<boolean>(url);
  }

  getNationalPharmacyInfo() {
    const url = environment.apiUrl + '/user/national-pharmacy-info';
    return this.http.get<HttpResponse<any>>(url, {observe: 'response'});
  }

  getProfile(): Observable<{}> {
    const url = environment.apiUrl + '/user/get-profile';
    return this.http.get<{}>(url);
  }

  updateProfile(data) {
    const url = environment.apiUrl + '/user/update-profile';
    return this.http.post<boolean>(url, data);
  }
}




