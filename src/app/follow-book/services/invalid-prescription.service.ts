import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class InvalidPrescriptionService {
  private apiUrl = `${environment.apiUrl}/invalid-prescription`;

  constructor(private http: HttpClient) {}

  getInvalidPrescriptions(filter: any): Observable<any> {
    let params = new HttpParams();

    if (filter.page) {
      params = params.set('page', filter.page);
    }

    if (filter.pageSize) {
      params = params.set('pageSize', filter.pageSize);
    }

    if (filter.search_string) {
      params = params.set('search_string', filter.search_string);
    }

    if (filter.date_from) {
      params = params.set('InvalidPrescriptionSearch[date_from]', filter.date_from);
    }

    if (filter.date_to) {
      params = params.set('InvalidPrescriptionSearch[date_to]', filter.date_to);
    }

    return this.http.get<any>(this.apiUrl, {
      params,
      observe: 'response'
    });
  }

  getInvalidPrescriptionDetail(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  updateInvalidPrescription(id: number, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, data);
  }

  createInvalidPrescription(data: any): Observable<any> {
    return this.http.post(this.apiUrl, data);
  }

  deleteInvalidPrescription(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  exportToExcel(filter: any): Observable<any> {
    let params = new HttpParams();
    if (filter?.date_from) {
      params = params.set('InvalidPrescriptionSearch[date_from]', filter.date_from);
    }
    if (filter?.date_to) {
      params = params.set('InvalidPrescriptionSearch[date_to]', filter.date_to);
    }

    return this.http.get(`${this.apiUrl}/export`, {
      params,
      responseType: 'blob'
    });
  }
}
