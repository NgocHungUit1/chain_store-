import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from '../authentication/auth.service';
import { NotifierService } from 'angular-notifier';
import { ProductFilter } from '../product/product.model';
import { InvoiceFilter } from '../invoice/invoice.model';

@Injectable({
  providedIn: 'root'
})
export class ProductReportService {

  constructor(
    private http: HttpClient,
    private auth: AuthService,
    public notifySer: NotifierService,
  ) {
  }

  /*
   *API for Report Sale
   */
  getApiUrlReportSale(filter?: ProductFilter) {
    if (!filter.page) {
      filter.page = 1;
    }

    if (!filter.pageSize) {
      filter.pageSize = 20;
    }

    let url = '/report/product-sale?per-page=' + filter.pageSize;

    url += '&' + filter.toFilterString();
    return url;
  }

  getListReportSale(filter?: ProductFilter): Observable<HttpResponse<any>> {
    const url = environment.apiUrl + this.getApiUrlReportSale(filter);
    return this.http.get<HttpResponse<any>>(url, {observe: 'response'});
  }

  /*
   *API for Report Stock
   */
  getApiUrlReportStock(filter?: ProductFilter) {
    if (!filter.page) {
      filter.page = 1;
    }

    if (!filter.pageSize) {
      filter.pageSize = 20;
    }

    let url = '/report/stock?per-page=' + filter.pageSize;

    url += '&' + filter.toFilterString();
    return url;
  }

  getListReportStock(filter?: ProductFilter): Observable<HttpResponse<any>> {
    const url = environment.apiUrl + this.getApiUrlReportStock(filter);
    return this.http.get<HttpResponse<any>>(url, {observe: 'response'});
  }

  /**
   * Export report excel
   * @param filter
   */
  exportExcel(filter?: ProductFilter): Observable<HttpResponse<any>> {
    const url = environment.apiUrl + '/report/export?' + filter.toFilterString();
    return this.http.get<HttpResponse<any>>(url, {observe: 'response'});
  }

  downloadFileExcel(type: string) {
    const _token = this.auth.getToken();
    const url = environment.apiUrl + '/report/download-template?token=' + _token + '&type=' + type;
    return url;
  }
}




