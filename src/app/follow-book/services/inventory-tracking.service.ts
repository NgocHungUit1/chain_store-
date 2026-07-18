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

    params = params.set('per-page', filter.pageSize.toString());
    params = params.set('page', filter.page.toString());
    params = params.set('pageSize', filter.pageSize.toString());

    params = params.set('expand', 'product,warehouse,warehouse.supplier');

    params = params.set('WarehouseProductParcelSearch[hasStock]', '1');


    if (filter.date_from) {
      params = params.set('WarehouseProductParcelSearch[date_from]', filter.date_from);
    }

    if (filter.date_to) {
      params = params.set('WarehouseProductParcelSearch[date_to]', filter.date_to);
    }

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });

    return this.http.get(`${this.baseUrl}/warehouse-product-parcel/tracking`, {
      params,
      observe: 'response'
    });
  }

  exportToExcel(dateFilter: any): Observable<any> {
    let params = new HttpParams()
      .set('WarehouseProductParcelSearch[hasStock]', '1')

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

  getProductStockCardDetails(filter: any): Observable<any> {
    let params = new HttpParams()
      .set('per-page', filter.pageSize.toString())
      .set('page', filter.page.toString())
      .set('pageSize', filter.pageSize.toString())
      .set('StockCardSearch[product_id]', filter.product_id.toString())
      // parcel + expiration_date: lấy hạn dùng theo từng lô cho cột "Hạn dùng"
      .set('expand', 'supplier,parcel,expiration_date');

    return this.http.get(`${this.baseUrl}/stock-card`, {
      params,
      observe: 'response'
    });
  }

  exportStockCardToExcel(productId: number): Observable<any> {
    let params = new HttpParams()
      .set('StockCardSearch[product_id]', productId.toString())
      .set('expand', 'supplier,product');

    return this.http.get(`${this.baseUrl}/stock-card/export`, {
      params,
      responseType: 'blob'
    });
  }
}
