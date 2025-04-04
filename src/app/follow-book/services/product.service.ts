import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse, HttpParams } from '@angular/common/http';
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

  getAllParcels(): Observable<any> {
    return this.http.get(`${this.baseUrl}/quality-check-detail/get-all-parcels`);
  }

  createQualityControl(data: QualityControlRequest): Observable<any> {
    return this.http.post(`${this.baseUrl}/quality-check/create-with-details`, data);
  }

  getQualityChecks(filter: QualityCheckFilter): Observable<any> {
    let params = new HttpParams();

    // Thêm các tham số cơ bản
    params = params.set('page', filter.page.toString());
    params = params.set('pageSize', filter.pageSize.toString());
    params = params.set('expand', filter.expand);

    if (filter.status !== undefined) {
      params = params.set('QualityCheckSearch[status]', filter.status.toString());
    }

    // Thêm search string nếu có
    if (filter.search_string) {
      params = params.set('QualityCheckSearch[search]', filter.search_string);
    }

    // Chỉ thêm filter date khi có giá trị
    if (filter.date_from) {
      params = params.set('QualityCheckSearch[date_from]', filter.date_from);
    }

    if (filter.date_to) {
      params = params.set('QualityCheckSearch[date_to]', filter.date_to);
    }

    return this.http.get(`${this.baseUrl}/quality-check`, {
      params,
      observe: 'response'
    });
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

  /**
   * Lấy thông tin chi tiết của phiếu kiểm soát chất lượng
   * @param id ID của phiếu kiểm soát chất lượng
   * @returns Observable chứa thông tin chi tiết của phiếu
   */
  getQualityCheckDetail(id: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/quality-check/${id}?expand=details`);
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
