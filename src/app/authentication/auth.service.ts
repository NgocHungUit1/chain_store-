import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../environments/environment';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  auth_token_key = 'rs24_token';

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

  public clearToken() {
    return localStorage.removeItem(this.auth_token_key);
  }

  public getAuthStatus(): Observable<any> {
    const url = environment.apiUrl + '/auth/status';
    return this.httpClient.get<any>(url);
  }

  public getPermissions() {
    const url = environment.apiUrl + '/auth/all-permission';
    return this.httpClient.get<String[]>(url);
  }

  login(username: string, password: string, remember?: boolean): Observable<any> {
    const url = environment.apiUrl + '/auth/login';
    return this.httpClient.post(url, {username: username, password: password, remember: remember});
  }

  logout(): Observable<boolean> {
    const url = environment.apiUrl + '/auth/logout';
    return this.httpClient.get<boolean>(url);
  }

  checkStatus() {
    const url = environment.apiUrl + '/auth/login-status';
    return this.httpClient.get(url);
  }
}
