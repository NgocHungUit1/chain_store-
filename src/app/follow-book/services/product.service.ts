import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Product } from '../models/product.interface';
import { Parcel } from '../models/parcel.interface';
import { QualityControlRequest } from '../models/quality-control.interface';
import { QualityCheck, QualityCheckResponse, QualityCheckFilter, QualityCheckDetail, QualityCheckUpdatePayload } from '../models/quality-check.interface';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  searchProducts(keyword: string): Observable<Product[]> {
    const params = {
      expand: 'quantity',
      'ProductSearch[stock]': 'empty,have',
      'ProductSearch[quota_stock]': '',
      'ProductSearch[status]': '10',
      'ProductSearch[product_type]': 'medicine',
      'ProductSearch[keyword]': keyword
    };

    return this.http.get<Product[]>(`${this.baseUrl}/product`, { params });
  }

  getParcelsByProduct(productId: string): Observable<Parcel[]> {
    return this.http.get<Parcel[]>(`${this.baseUrl}/quality-check-detail/get-parcels-by-product/${productId}`);
  }

  createQualityControl(data: QualityControlRequest): Observable<any> {
    return this.http.post(`${this.baseUrl}/quality-check/create-with-details`, data);
  }

  getQualityChecks(filter?: QualityCheckFilter): Observable<HttpResponse<any>> {
    const url = this.baseUrl + '/quality-check' + this.getApiUrl(filter);
    return this.http.get<HttpResponse<any>>(url, {observe: 'response'});
  }

  getApiUrl(filter?: any): string {
    if (!filter) {
      return '';
    }

    if (!filter.page) {
      filter.page = 1;
    }
    if (!filter.pageSize) {
      filter.pageSize = 15;
    }

    return '?' + filter.toFilterString();
  }

  getQualityCheckDetail(id: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/quality-check/${id}`);
  }

  deleteQualityCheck(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/quality-check/${id}`);
  }

  updateQualityCheck(id: number, payload: QualityCheckUpdatePayload): Observable<any> {
    return this.http.put(`${this.baseUrl}/quality-check/${id}/update-with-details`, payload);
  }

  exportQualityCheck(id: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/quality-check/${id}/export`, { responseType: 'blob' });
  }

  updateQualityControl(id: number, payload: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/quality-check/${id}/update-with-details`, payload);
  }

  deleteQualityControl(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/quality-check/${id}`);
  }

  exportQualityControlToExcel(id: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/quality-check/${id}/export`, {
      responseType: 'blob'
    });
  }
}
