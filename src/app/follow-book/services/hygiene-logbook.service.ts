import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class HygieneLogbookService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getHygieneLogbooks(filter: any): Observable<any> {
    let params = new HttpParams();

    // Các tham số phân trang
    params = params.set('per-page', filter.pageSize.toString());
    params = params.set('page', filter.page.toString());
    params = params.set('pageSize', filter.pageSize.toString());

    // Lọc theo tháng
    if (filter.month) {
      params = params.set('month', filter.month);
    }

    return this.http.get(`${this.baseUrl}/hygiene-logbook`, {
      params,
      observe: 'response'
    }).pipe(
      catchError(this.handleError)
    );
  }

  getHygieneLogbookDetail(id: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/hygiene-logbook/${id}?expand=details`);
  }

  createHygieneLogbook(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/hygiene-logbook/create-with-details`, data)
      .pipe(catchError(this.handleError));
  }

  updateHygieneLogbook(id: number, data: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/hygiene-logbook/update-with-details?id=${id}`, data)
      .pipe(catchError(this.handleError));
  }

  deleteHygieneLogbook(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/hygiene-logbook/${id}`)
      .pipe(catchError(this.handleError));
  }

  exportToExcel(filter: any): Observable<any> {
    return this.http.get(`${this.baseUrl}/hygiene-logbook/export`, {
      params: filter,
      responseType: 'blob'
    }).pipe(catchError(this.handleError));
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Đã xảy ra lỗi khi gọi API.';

    if (error.error instanceof ErrorEvent) {
      // Lỗi client-side
      console.error('Client-side error:', error.error.message);
      errorMessage = `Lỗi: ${error.error.message}`;
    } else {
      // Lỗi server-side
      console.error(
        `Server returned code ${error.status}, ` +
        `body was:`, error.error);

      // Cố gắng lấy thông báo lỗi từ response
      if (error.error && error.error.message) {
        errorMessage = `Lỗi từ server: ${error.error.message}`;
      }
    }

    return throwError(errorMessage);
  }
}
