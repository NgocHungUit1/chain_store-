import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { MedicineTrackingFilter } from '../models/medicine-tracking.interface';

@Injectable({
  providedIn: 'root'
})
export class MedicineTrackingService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getMedicineTrackingList(filter: MedicineTrackingFilter): Observable<any> {
    let params = new HttpParams();

    params = params.set('per-page', filter.pageSize.toString());
    params = params.set('page', filter.page.toString());
    params = params.set('pageSize', filter.pageSize.toString());
    params = params.set('expand', filter.expand);

    params = params.set('InvoiceSearch[order_status]', 'pending,done');
    params = params.set('InvoiceSearch[order_national]', 'yes,no');

    if (filter.search_string) {
      params = params.set('InvoiceSearch[search]', filter.search_string);
    }

    if (filter.date_from) {
      params = params.set('InvoiceSearch[date_from]', filter.date_from);
    }

    if (filter.date_to) {
      params = params.set('InvoiceSearch[date_to]', filter.date_to);
    }

    return this.http.get(`${this.baseUrl}/invoice`, {
      params,
      observe: 'response'
    });
  }

  exportToExcel(dateFilter: any): Observable<any> {
    let params = new HttpParams()
      .set('InvoiceSearch[order_status]', 'pending,done')
      .set('InvoiceSearch[order_national]', 'yes,no');

    // Thêm filter ngày
    if (dateFilter?.date_from) {
      params = params.set('InvoiceSearch[date_from]', dateFilter.date_from);
    }
    if (dateFilter?.date_to) {
      params = params.set('InvoiceSearch[date_to]', dateFilter.date_to);
    }

    return this.http.get(`${this.baseUrl}/invoice/export-prescription-log`, {
      params,
      responseType: 'blob'
    });
  }
}
