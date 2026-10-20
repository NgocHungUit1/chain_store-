import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MedicineRecallService {
  private apiUrl = `${environment.apiUrl}/medicine-recall`;

  constructor(private http: HttpClient) {}

  getMedicineRecalls(filter: any): Observable<any> {
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
      params = params.set('MedicineRecallSearch[date_from]', filter.date_from);
    }

    if (filter.date_to) {
      params = params.set('MedicineRecallSearch[date_to]', filter.date_to);
    }

    return this.http.get<any>(this.apiUrl, {
      params,
      observe: 'response'
    });
  }

  getMedicineRecallDetail(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  updateMedicineRecall(id: number, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, data);
  }

  createMedicineRecall(data: any): Observable<any> {
    return this.http.post(this.apiUrl, data);
  }

  deleteMedicineRecall(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  exportToExcel(filter: any): Observable<any> {
    let params = new HttpParams();
    // Thêm filter ngày
    if (filter?.date_from) {
      params = params.set('MedicineRecallSearch[date_from]', filter.date_from);
    }
    if (filter?.date_to) {
      params = params.set('MedicineRecallSearch[date_to]', filter.date_to);
    }

    return this.http.get(`${this.apiUrl}/export`, {
      params,
      responseType: 'blob'
    });
  }

  /** Các số lô của sản phẩm (để chọn khi tra cứu thu hồi) */
  getTraceLots(productId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/trace-lots`, {params: {product_id: String(productId)}});
  }

  /** Lô còn tồn ở chi nhánh nào, đã bán theo hoá đơn nào, cho ai */
  trace(productId: number, parcelNo: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/trace`, {params: {product_id: String(productId), parcel_no: parcelNo}});
  }

  traceExport(productId: number, parcelNo: string): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/trace-export`, {
      params: {product_id: String(productId), parcel_no: parcelNo},
      responseType: 'blob'
    });
  }
}
