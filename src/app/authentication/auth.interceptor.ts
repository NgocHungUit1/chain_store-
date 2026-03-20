import { Injectable } from '@angular/core';
import {
  HTTP_INTERCEPTORS,
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';
import { NotifierService } from 'angular-notifier';

@Injectable({
  providedIn: 'root',
})
export class AuthInterceptor implements HttpInterceptor {
  constructor(
    private router: Router,
    private auth: AuthService,
    private notify: NotifierService
  ) {
  }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // console.log('START AUTH INTERCEPTOR'); // @AUTH
    // request = request.clone({
    //   withCredentials: true
    // });

    return next.handle(request)
      .pipe(
        tap(event => {
          // console.log(event);
        }, error => {
          if (error instanceof HttpErrorResponse) {
            return this.handleAuthError(error);
          }
        })
      );
  }

  private handleAuthError(err: HttpErrorResponse): Observable<any> {
    switch (err.status) {
      case 401:
        this.auth.clearToken();
        // localStorage.removeItem('auth_token');
        // return of (this.router.navigate(['auth/login']));
        return of(this.router.navigate(['authentication/login']));

      case 403:
        // localStorage.removeItem('auth_token');
        // return of (this.router.navigate(['auth/login']));
        this.notify.notify('error', 'Bạn không có quyền truy cập tính năng này.');
        return of(this.router.navigate(['/']));
      case 406:
        return of(this.router.navigate(['/authentication/temporarily-locked']));
      case 410:
        return of(this.router.navigate(['/authentication/expiration']));
      case 422:
        const error = err.error;
        if (error.message !== undefined) {
          this.notify.notify('error', error['message']);
          return;
        }
        if (error[0]['message'] !== undefined) {
          this.notify.notify('error', error[0]['message']);
          return throwError(err);
        } else {
          this.notify.notify('error', err.statusText);
          return throwError(err);
        }

      default:
        console.log(err);
        this.notify.notify('error', err.statusText);
        return;
      // throwError(err);
    }
  }
}

export let authInterceptorProvider = {
  provide: HTTP_INTERCEPTORS,
  useClass: AuthInterceptor,
  multi: true
};
