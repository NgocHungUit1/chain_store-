import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {environment} from '../../environments/environment';
import {Observable} from 'rxjs';
import {User} from '../user/user.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  auth_token_key = 'rs24_token';
  auth_permission_key = 'rx20_permission_key';

  constructor(
    private httpClient: HttpClient,
  ) {
  }

  public getToken(): string {
    return localStorage.getItem(this.auth_token_key);
  }

  public setToken(token: string) {
    return localStorage.setItem(this.auth_token_key, token);
  }

  public getPermissionsFromLocalStorage(): string[] {
    const permissionStr = localStorage.getItem(this.auth_permission_key);
    return JSON.parse(permissionStr);
  }

  public setPermissions(permissions: string[]) {
    const permissionsStr = JSON.stringify(permissions);
    return localStorage.setItem(this.auth_permission_key, permissionsStr);
  }

  public clearToken() {
    return localStorage.removeItem(this.auth_token_key);
  }

  public getAuthStatus(): Observable<any> {
    const url = environment.apiUrl + '/auth/status';
    return this.httpClient.get<any>(url);
  }

  public getPermissions() {
    const url = environment.apiUrl + '/auth/all-permission';
    return this.httpClient.get<string[]>(url);
  }

  private getSubDomain() {
    const domain = window.location.hostname;
    let subDomain = '';
    if (domain.indexOf('.') < 0 ||
      domain.split('.')[0] === 'example' || domain.split('.')[0] === 'lvh' || domain.split('.')[0] === 'www') {
      subDomain = '';
    } else {
      subDomain = domain.split('.')[0];
    }
    return subDomain;
  }

  login(username: string, password: string, remember?: boolean): Observable<any> {
    const subDomain = this.getSubDomain();
    const url = environment.apiUrl + '/auth/login';
    return this.httpClient.post(url, {username: username, password: password, remember: remember, subdomain: subDomain});
  }

  logout(): Observable<boolean> {
    const url = environment.apiUrl + '/auth/logout';
    return this.httpClient.get<boolean>(url);
  }

  checkStatus() {
    const url = environment.apiUrl + '/auth/login-status';
    return this.httpClient.get(url);
  }

  passwordResetRequest(email: string) {
    // const url = environment.apiUrl + '/auth/password-reset-request';
    // return this.httpClient.post(url, {email});
    // return this.httpClient.post<any>(
    //   environment.apiUrl + '/auth/password-reset-request', {email},
    //   {
    //     headers: {Accept: 'application/json', 'Authorization': 'Bearer ' + this.getToken()}
    //   },
    // )
    //   .pipe(
    //     map(
    //       (result) => {
    //         return result;
    //       },
    //       (error) => {
    //         return error;
    //       }
    //     )
    //   );
  }
}
