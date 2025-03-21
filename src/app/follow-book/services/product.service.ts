import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Product } from '../models/product.interface';
import { Parcel } from '../models/parcel.interface';
import { QualityControlRequest } from '../models/quality-control.interface';
import { QualityCheck, QualityCheckResponse, QualityCheckFilter, QualityCheckDetail, QualityCheckUpdatePayload } from '../models/quality-check.interface';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private baseUrl = 'http://localhost:31080/v1';

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

  getQualityChecks(filter: QualityCheckFilter): Observable<QualityCheckResponse> {
    return this.http.get<QualityCheckResponse>(`${this.baseUrl}/quality-check`, { params: filter as any });
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
