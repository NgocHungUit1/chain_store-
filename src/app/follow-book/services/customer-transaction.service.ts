import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CustomerTransactionService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getCustomerTransactions(filter: any): Observable<any> {
    let params = new HttpParams();

    // Bỏ các tham số phân trang
    // params = params.set('per-page', filter.pageSize.toString());
    // params = params.set('page', filter.page.toString());
    // params = params.set('pageSize', filter.pageSize.toString());

    // Tham số mở rộng
    params = params.set('expand', 'customer,payment,store,user,returns,today,time,createdFormat,invoiceDetails');

    // Lọc trạng thái đơn hàng
    params = params.set('InvoiceSearch[order_status]', 'pending,done');
    params = params.set('InvoiceSearch[order_national]', 'yes,no');
    params = params.set('InvoiceSearch[group_type]', 'special');

    // Lọc theo customer_id nếu có
    if (filter.customer_id) {
      params = params.set('InvoiceSearch[customer_id]', filter.customer_id);
    }

    // Lọc theo ngày nếu có
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
      .set('InvoiceSearch[order_national]', 'yes,no')
      .set('InvoiceSearch[group_type]', 'special');

    // Lọc theo customer_id nếu có
    if (dateFilter.customer_id) {
      params = params.set('InvoiceSearch[customer_id]', dateFilter.customer_id);
    }

    // Lọc theo ngày nếu có
    if (dateFilter.date_from) {
      params = params.set('InvoiceSearch[date_from]', dateFilter.date_from);
    }

    if (dateFilter.date_to) {
      params = params.set('InvoiceSearch[date_to]', dateFilter.date_to);
    }

    // Sử dụng API endpoint mới: export-medicine-log
    return this.http.get(`${this.baseUrl}/invoice/export-medicine-log`, {
      params,
      responseType: 'blob'
    });
  }
}
