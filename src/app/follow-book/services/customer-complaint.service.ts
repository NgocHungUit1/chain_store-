import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CustomerComplaintService {
  private apiUrl = environment.apiUrl + '/customer-complaint';

  constructor(private http: HttpClient) { }

  getCustomerComplaintList(filter: any): Observable<any> {
    let params = new HttpParams();

    // Thêm các tham số tìm kiếm
    if (filter.page) params = params.set('page', filter.page.toString());
    if (filter.pageSize) params = params.set('per-page', filter.pageSize.toString());
    if (filter.expand) params = params.set('expand', filter.expand);

    if (filter.date_from) {
      params = params.set('CustomerComplaintSearch[date_from]', filter.date_from);
    }
    if (filter.date_to) {
      params = params.set('CustomerComplaintSearch[date_to]', filter.date_to);
    }

    if (filter.search_string) {
      params = params.set('CustomerComplaintSearch[search_string]', filter.search_string);
    }

    return this.http.get(this.apiUrl, { observe: 'response', params });
  }

  createCustomerComplaint(data: any): Observable<any> {
    return this.http.post(this.apiUrl, data);
  }

  updateCustomerComplaint(id: number, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, data);
  }

  deleteCustomerComplaint(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  exportToExcel(dateFilter: any): Observable<any> {
    let params = new HttpParams();

    if (dateFilter.date_from) {
      params = params.set('CustomerComplaintSearch[date_from]', dateFilter.date_from);
    }
    if (dateFilter.date_to) {
      params = params.set('CustomerComplaintSearch[date_to]', dateFilter.date_to);
    }

    return this.http.get(`${this.apiUrl}/export`, {
      responseType: 'blob',
      params
    });
  }

  searchCustomers(keyword: string): Observable<any> {
    let params = new HttpParams().set('keyword', keyword);
    return this.http.get(`${this.apiUrl}/search-customers`, { params });
  }
}
