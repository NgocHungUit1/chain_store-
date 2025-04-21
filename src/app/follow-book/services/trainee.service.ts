import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TraineeService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getTraineeList(filter: any): Observable<any> {
    let params = new HttpParams();

    // Các tham số phân trang
    params = params.set('per-page', filter.pageSize.toString());
    params = params.set('page', filter.page.toString());
    params = params.set('pageSize', filter.pageSize.toString());

    // Tham số mở rộng
    params = params.set('expand', 'details');

    // Lọc theo ngày nếu có
    if (filter.date_from) {
      params = params.set('TraineeSearch[date_from]', filter.date_from);
    }

    if (filter.date_to) {
      params = params.set('TraineeSearch[date_to]', filter.date_to);
    }

    return this.http.get(`${this.baseUrl}/trainee`, {
      params,
      observe: 'response'
    }).pipe(
      catchError(this.handleError)
    );
  }

  createTrainee(traineeData: any): Observable<any> {
    // Log dữ liệu trước khi gửi để debug
    console.log('Dữ liệu gửi đi:', JSON.stringify(traineeData));

    return this.http.post(`${this.baseUrl}/trainee/create-with-details`, traineeData)
      .pipe(catchError(this.handleError));
  }

  updateTrainee(id: number, traineeData: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/trainee/update-with-details?id=${id}`, traineeData)
      .pipe(catchError(this.handleError));
  }

  deleteTrainee(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/trainee/${id}`)
      .pipe(catchError(this.handleError));
  }

  exportToExcel(filter: any): Observable<any> {
    let params = new HttpParams();

    // Thêm id nếu có (thay vì trainee_id)
    if (filter.trainee_id) {
      params = params.set('id', filter.trainee_id.toString());
    }

    // Lọc theo ngày nếu có (giữ lại nếu cần)
    if (filter.date_from) {
      params = params.set('TraineeSearch[date_from]', filter.date_from);
    }

    if (filter.date_to) {
      params = params.set('TraineeSearch[date_to]', filter.date_to);
    }

    // Sửa endpoint sang /export
    return this.http.get(`${this.baseUrl}/trainee/export`, {
      params,
      responseType: 'blob'
    }).pipe(catchError(this.handleError));
  }

  getTraineeDetail(id: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/trainee/${id}?expand=details`)
      .pipe(catchError(this.handleError));
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

    // Trả về error message cho người dùng
    return throwError(errorMessage);
  }
}
