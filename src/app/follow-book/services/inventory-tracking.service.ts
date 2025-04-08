import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class InventoryTrackingService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getInventoryTrackingList(filter: any): Observable<any> {
    let params = new HttpParams();

    // Các tham số phân trang
    params = params.set('per-page', filter.pageSize.toString());
    params = params.set('page', filter.page.toString());
    params = params.set('pageSize', filter.pageSize.toString());

    // Tham số mở rộng để lấy thông tin sản phẩm, kho và nhà cung cấp
    params = params.set('expand', 'product,warehouse,warehouse.supplier');

    // Lọc chỉ lấy các sản phẩm có số lượng > 0
    params = params.set('WarehouseProductParcelSearch[hasStock]', '1');

    // Lọc theo nhóm thuốc kiểm soát đặc biệt
    // params = params.set('WarehouseProductParcelSearch[group_id]', '32459');

    // Lọc theo ngày nếu có
    if (filter.date_from) {
      params = params.set('WarehouseProductParcelSearch[date_from]', filter.date_from);
    }

    if (filter.date_to) {
      params = params.set('WarehouseProductParcelSearch[date_to]', filter.date_to);
    }

    // Thêm headers tương tự như requests đang hoạt động
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });

    // Thử dùng endpoint khác
    return this.http.get(`${this.baseUrl}/warehouse-product-parcel/tracking`, {
      params,
      observe: 'response'
    });
  }

  exportToExcel(dateFilter: any): Observable<any> {
    let params = new HttpParams()
      .set('WarehouseProductParcelSearch[hasStock]', '1')
      .set('group_id', '32459');

    // Thêm filter ngày
    if (dateFilter?.date_from) {
      params = params.set('WarehouseProductParcelSearch[date_from]', dateFilter.date_from);
    }
    if (dateFilter?.date_to) {
      params = params.set('WarehouseProductParcelSearch[date_to]', dateFilter.date_to);
    }

    return this.http.get(`${this.baseUrl}/warehouse-product-parcel/export-special-medicine`, {
      params,
      responseType: 'blob'
    });
  }
}
