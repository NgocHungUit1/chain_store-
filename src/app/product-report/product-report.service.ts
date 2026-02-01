import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from '../authentication/auth.service';
import { NotifierService } from 'angular-notifier';
import { ProductFilter } from '../product/product.model';
import { InvoiceFilter } from '../invoice/invoice.model';
import {CustomerFilter} from '../customer/customer.model';

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

  getApiUrlReportProfit(filter?: ProductFilter) {
    if (!filter.page) {
      filter.page = 1;
    }

    if (!filter.pageSize) {
      filter.pageSize = 20;
    }

    let url = '/report/profit?per-page=' + filter.pageSize;

    url += '&' + filter.toFilterString();
    return url;
  }

  getApiUrlReportStaff(filter?: ProductFilter) {
    if (!filter.page) {
      filter.page = 1;
    }

    if (!filter.pageSize) {
      filter.pageSize = 20;
    }

    let url = '/report/staff?per-page=' + filter.pageSize;

    url += '&' + filter.toFilterString();
    return url;
  }
  getApiUrlReportCustomer(filter?: ProductFilter) {
    if (!filter.page) {
      filter.page = 1;
    }

    if (!filter.pageSize) {
      filter.pageSize = 20;
    }

    let url = '/report/customer?per-page=' + filter.pageSize;

    url += '&' + filter.toFilterString();
    return url;
  }

  getApiUrlReportSaleSummary(filter?: ProductFilter) {
    if (!filter.page) {
      filter.page = 1;
    }

    if (!filter.pageSize) {
      filter.pageSize = 20;
    }

    let url = '/report/product-sale-summary?per-page=' + filter.pageSize;

    url += '&' + filter.toFilterString();
    return url;
  }

  getApiUrlExportImportSummary(filter?: ProductFilter) {
    if (!filter.page) {
      filter.page = 1;
    }

    if (!filter.pageSize) {
      filter.pageSize = 20;
    }

    let url = '/report/export-import-summary?per-page=' + filter.pageSize;

    url += '&' + filter.toFilterString();
    return url;
  }

  getApiUrlExportImportDetailSummary(filter?: ProductFilter) {
    if (!filter.page) {
      filter.page = 1;
    }

    if (!filter.pageSize) {
      filter.pageSize = 20;
    }

    let url = '/report/export-import-detail-summary?per-page=' + filter.pageSize;

    url += '&' + filter.toFilterString();
    return url;
  }

  getListReportSale(filter?: ProductFilter): Observable<HttpResponse<any>> {
    const url = environment.apiUrl + this.getApiUrlReportSale(filter);
    return this.http.get<HttpResponse<any>>(url, {observe: 'response'});
  }

  getListReportProfit(filter?: ProductFilter): Observable<HttpResponse<any>> {
    const url = environment.apiUrl + this.getApiUrlReportProfit(filter);
    return this.http.get<HttpResponse<any>>(url, {observe: 'response'});
  }

  getListReportStaff(filter?: ProductFilter): Observable<HttpResponse<any>> {
    const url = environment.apiUrl + this.getApiUrlReportStaff(filter);
    return this.http.get<HttpResponse<any>>(url, {observe: 'response'});
  }
  getListReportCustomer(filter?: ProductFilter): Observable<HttpResponse<any>> {
    const url = environment.apiUrl + this.getApiUrlReportCustomer(filter);
    return this.http.get<HttpResponse<any>>(url, {observe: 'response'});
  }

  getListReportSaleSummary(filter?: ProductFilter): Observable<HttpResponse<any>> {
    const url = environment.apiUrl + this.getApiUrlReportSaleSummary(filter);
    return this.http.get<HttpResponse<any>>(url, {observe: 'response'});
  }

  getExportImportSummary(filter?: ProductFilter): Observable<HttpResponse<any>> {
    const url = environment.apiUrl + this.getApiUrlExportImportSummary(filter);
    return this.http.get<HttpResponse<any>>(url, {observe: 'response'});
  }

  getExportImportDetailSummary(filter?: ProductFilter): Observable<HttpResponse<any>> {
    const url = environment.apiUrl + this.getApiUrlExportImportDetailSummary(filter);
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

  getApiUrlReportStockSummary(filter?: ProductFilter) {
    if (!filter.page) {
      filter.page = 1;
    }

    if (!filter.pageSize) {
      filter.pageSize = 20;
    }

    let url = '/report/stock-summary?per-page=' + filter.pageSize;

    url += '&' + filter.toFilterString();
    return url;
  }

  getListReportStock(filter?: ProductFilter): Observable<HttpResponse<any>> {
    const url = environment.apiUrl + this.getApiUrlReportStock(filter);
    return this.http.get<HttpResponse<any>>(url, {observe: 'response'});
  }

  getListReportStockSummary(filter?: ProductFilter): Observable<HttpResponse<any>> {
    const url = environment.apiUrl + this.getApiUrlReportStockSummary(filter);
    return this.http.get<HttpResponse<any>>(url, {observe: 'response'});
  }

  /**
   * API for Report Xuat nhap ton
   */
  getApiUrlReportExportImport(filter?: ProductFilter) {
    if (!filter.page) {
      filter.page = 1;
    }

    if (!filter.pageSize) {
      filter.pageSize = 20;
    }

    let url = '/report/export-import?per-page=' + filter.pageSize;

    url += '&' + filter.toFilterString();
    return url;
  }

  getListReportExportImport(filter?: ProductFilter): Observable<HttpResponse<any>> {
    const url = environment.apiUrl + this.getApiUrlReportExportImport(filter);
    return this.http.get<HttpResponse<any>>(url, {observe: 'response'});
  }


  /**
   * API for Report Xuat nhap ton chi tiet
   *
   */
  getApiUrlReportExportImportDetail(filter?: ProductFilter) {
    if (!filter.page) {
      filter.page = 1;
    }

    if (!filter.pageSize) {
      filter.pageSize = 20;
    }

    let url = '/report/export-import-detail?per-page=' + filter.pageSize;

    url += '&' + filter.toFilterString();
    return url;
  }

  getListReportExportImportDetail(filter?: ProductFilter): Observable<HttpResponse<any>> {
    const url = environment.apiUrl + this.getApiUrlReportExportImportDetail(filter);
    return this.http.get<HttpResponse<any>>(url, {observe: 'response'});
  }

  /**
   * API for Report Tồn kho
   *
   */
  getApiUrlReportExpirationDate(filter?: ProductFilter) {
    if (!filter.page) {
      filter.page = 1;
    }

    if (!filter.pageSize) {
      filter.pageSize = 20;
    }

    let url = '/report/expiration-date?per-page=' + filter.pageSize;

    url += '&' + filter.toFilterString();
    return url;
  }
  getListReportExpirationDate(filter?: ProductFilter): Observable<HttpResponse<any>> {
    const url = environment.apiUrl + this.getApiUrlReportExpirationDate(filter);
    return this.http.get<HttpResponse<any>>(url, {observe: 'response'});
  }

  /**
   * API for Report Tồn kho
   *
   */
  getApiUrlReportSupplier(filter?: ProductFilter) {
    if (!filter.page) {
      filter.page = 1;
    }

    if (!filter.pageSize) {
      filter.pageSize = 20;
    }

    let url = '/report/supplier?per-page=' + filter.pageSize;

    url += '&' + filter.toFilterString();
    return url;
  }
  getListReportSupplier(filter?: ProductFilter): Observable<HttpResponse<any>> {
    const url = environment.apiUrl + this.getApiUrlReportSupplier(filter);
    return this.http.get<HttpResponse<any>>(url, {observe: 'response'});
  }

  /**
   * Export report excel
   * @param filter
   */
  exportExcel(filter?: ProductFilter): Observable<HttpResponse<any>> {
    const url = environment.apiUrl + '/report/export?' + filter.toFilterString();
    return this.http.get(url, {
      observe: 'response',
      responseType: 'blob'
    });
  }

  downloadFileExcel(type: string) {
    const _token = this.auth.getToken();
    const url = environment.apiUrl + '/report/download-template?token=' + _token + '&type=' + type;
    return url;
  }

  /**
   * get Export excel profit link
   * @param filter
   */
  getDownloadLinkProfit(filter?: ProductFilter) {
    const _token = this.auth.getToken();

    return environment.apiUrl + '/report/export-profit?' + filter.toFilterString() + '&token=' + _token;
  }

  /**
   * get Export excel sale link
   * @param filter
   */
  getDownloadLinkSale(filter?: ProductFilter) {
    const _token = this.auth.getToken();

    return environment.apiUrl + '/report/export-sale?' + filter.toFilterString() + '&token=' + _token;
  }

  /**
   * get Export excel sale by customer link
   * @param filter
   */
  getDownloadLinkSaleCustomer(filter?: ProductFilter) {
    const _token = this.auth.getToken();

    return environment.apiUrl + '/report/export-sale-customer?' + filter.toFilterString() + '&token=' + _token;
  }

  /**
   * get Export excel sale by customer link
   * @param filter
   */
  getDownloadLinkSaleEmployee(filter?: ProductFilter) {
    const _token = this.auth.getToken();

    return environment.apiUrl + '/report/export-sale-employee?' + filter.toFilterString() + '&token=' + _token;
  }
}




