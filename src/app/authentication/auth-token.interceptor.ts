import { Injectable} from '@angular/core';
import {HTTP_INTERCEPTORS, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpResponse} from '@angular/common/http';
import {AuthService} from './auth.service';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthTokenInterceptor implements HttpInterceptor {
  constructor(
    public auth: AuthService
  ) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    console.log('START AUTH TOKEN INTERCEPTOR');
    const _token = this.auth.getToken();

    if (_token) {
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${this.auth.getToken()}`
        }
      });
    }
    return next.handle(request);

  }
}

export let authTokenInterceptorProvider = {
  provide: HTTP_INTERCEPTORS,
  useClass: AuthTokenInterceptor,
  multi: true
};
