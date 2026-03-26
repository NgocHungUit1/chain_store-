import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Product, ProductSearchFilter } from '../models/product.interface';
import { StockCard, StockCardFilter } from '../models/stock-card.interface';

@Injectable({
  providedIn: 'root'
})
export class AccountingBookService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getAllProducts(): Observable<Product[]> {
    const params = new HttpParams()
      .set('per-page', '20')
      .set('page', '1')
      .set('pageSize', '20')
      .set('expand', 'quantity')
      .set('ProductSearch[status]', '10,9')
      .set('ProductSearch[product_type]', 'medicine,merchandise')
      .set('ProductSearch[stock]', 'empty,have')
      .set('ProductSearch[quota_stock]', '');

    return this.http.get<Product[]>(`${this.baseUrl}/product`, { params });
  }

  searchProductsForDialog(keyword: string): Observable<Product[]> {
    const params = new HttpParams()
      .set('per-page', '20')
      .set('page', '1')
      .set('pageSize', '20')
      .set('expand', 'quantity')
      .set('ProductSearch[status]', '10,9')
      .set('ProductSearch[keyword]', keyword)
      .set('ProductSearch[product_type]', 'medicine,merchandise')
      .set('ProductSearch[stock]', 'empty,have')
      .set('ProductSearch[quota_stock]', '');

    return this.http.get<Product[]>(`${this.baseUrl}/product`, { params });
  }

  searchProducts(keyword: string): Observable<Product[]> {
    const params = new HttpParams()
      .set('expand', 'quantity')
      .set('ProductSearch[stock]', 'empty,have')
      .set('ProductSearch[quota_stock]', '')
      .set('ProductSearch[status]', '10')
      .set('ProductSearch[product_type]', 'medicine')
      .set('ProductSearch[keyword]', keyword);

    return this.http.get<Product[]>(`${this.baseUrl}/product`, { params });
  }

  getStockCard(filter: StockCardFilter): Observable<StockCard[]> {
    let params = new HttpParams()
      .set('StockCardSearch[product_id]', filter.product_id.toString());

    if (filter.date_from) {
      params = params.set('StockCardSearch[date_from]', filter.date_from);
    }

    if (filter.date_to) {
      params = params.set('StockCardSearch[date_to]', filter.date_to);
    }

    if (filter.parcel_no) {
      params = params.set('StockCardSearch[parcel_no]', filter.parcel_no);
    }

    return this.http.get<StockCard[]>(`${this.baseUrl}/stock-card`, { params });
  }

  getParcelsByProduct(productId: number): Observable<any[]> {
    const params = new HttpParams()
      .set('WarehouseProductParcelSearch[product_id]', productId.toString())
      .set('WarehouseProductParcelSearch[hasStock]', '1');

    return this.http.get<any[]>(`${this.baseUrl}/warehouse-product-parcel/group-by-product`, { params });
  }

  exportToExcel(productId: number, dateFrom: string, dateTo: string, parcelNo: string): Observable<Blob> {
    let params = new HttpParams()
      .set('StockCardSearch[product_id]', productId.toString())
      .set('StockCardSearch[date_from]', dateFrom)
      .set('StockCardSearch[date_to]', dateTo);

    if (parcelNo) {
      params = params.set('StockCardSearch[parcel_no]', parcelNo);
    }

    return this.http.get(`${this.baseUrl}/stock-card/export-s2`, {
      params,
      responseType: 'blob'
    });
  }

  getCashFlow(filter: { date_from?: string; date_to?: string }, page: number = 1, pageSize: number = 20): Observable<any> {
    let params = new HttpParams()
      .set('per-page', pageSize.toString())
      .set('page', page.toString())
      .set('pageSize', pageSize.toString())
      .set('expand', 'createdFormat,code,items,balance')
      .set('CashFlowSearch[type]', 'payment,receipt')
      .set('type_money', 'money');

    if (filter?.date_from) {
      params = params.set('CashFlowSearch[date_from]', filter.date_from);
    }

    if (filter?.date_to) {
      params = params.set('CashFlowSearch[date_to]', filter.date_to);
    }

    return this.http.get<any>(`${this.baseUrl}/cash-flow`, { params, observe: 'response' });
  }

  getCashFlowSummary(filter: { date_from?: string; date_to?: string }): Observable<any> {
    let params = new HttpParams()
      .set('per-page', '20')
      .set('page', '1')
      .set('pageSize', '20')
      .set('expand', 'createdFormat,code,items')
      .set('CashFlowSearch[type]', 'payment,receipt')
      .set('type_money', 'money');

    if (filter?.date_from) {
      params = params.set('CashFlowSearch[date_from]', filter.date_from);
    }

    if (filter?.date_to) {
      params = params.set('CashFlowSearch[date_to]', filter.date_to);
    }

    return this.http.get<any>(`${this.baseUrl}/cash-flow/summary`, { params });
  }

  exportCashFlow(filter: { date_from?: string; date_to?: string }): Observable<Blob> {
    let params = new HttpParams()
      .set('CashFlowSearch[type]', 'payment,receipt')
      .set('type_money', 'money');

    if (filter?.date_from) {
      params = params.set('CashFlowSearch[date_from]', filter.date_from);
    }

    if (filter?.date_to) {
      params = params.set('CashFlowSearch[date_to]', filter.date_to);
    }

    return this.http.get(`${this.baseUrl}/cash-flow/export-s6`, {
      params,
      responseType: 'blob'
    });
  }

  getBankFlow(filter: { date_from?: string; date_to?: string }, page: number = 1, pageSize: number = 20): Observable<any> {
    let params = new HttpParams()
      .set('per-page', pageSize.toString())
      .set('page', page.toString())
      .set('pageSize', pageSize.toString())
      .set('expand', 'createdFormat,code,items,balance')
      .set('CashFlowSearch[type]', 'payment,receipt')
      .set('type_money', 'bank');

    if (filter?.date_from) {
      params = params.set('CashFlowSearch[date_from]', filter.date_from);
    }

    if (filter?.date_to) {
      params = params.set('CashFlowSearch[date_to]', filter.date_to);
    }

    return this.http.get<any>(`${this.baseUrl}/cash-flow`, { params, observe: 'response' });
  }

  getBankFlowSummary(filter: { date_from?: string; date_to?: string }): Observable<any> {
    let params = new HttpParams()
      .set('per-page', '20')
      .set('page', '1')
      .set('pageSize', '20')
      .set('expand', 'createdFormat,code,items')
      .set('CashFlowSearch[type]', 'payment,receipt')
      .set('type_money', 'bank');

    if (filter?.date_from) {
      params = params.set('CashFlowSearch[date_from]', filter.date_from);
    }

    if (filter?.date_to) {
      params = params.set('CashFlowSearch[date_to]', filter.date_to);
    }

    return this.http.get<any>(`${this.baseUrl}/cash-flow/summary`, { params });
  }

  exportSaleRevenue(dateFrom: string, dateTo: string, quarter: number, year: number, orderStatus?: string): Observable<Blob> {
    let params = new HttpParams()
      .set('InvoiceSearch[date_from]', dateFrom)
      .set('InvoiceSearch[date_to]', dateTo)
      .set('quarter', quarter.toString())
      .set('year', year.toString());

    if (orderStatus) {
      params = params.set('InvoiceSearch[order_status]', orderStatus);
    }

    return this.http.get(`${this.baseUrl}/invoice/export-revenue-log`, {
      params,
      responseType: 'blob'
    });
  }

  exportBankFlow(filter: { date_from?: string; date_to?: string }): Observable<Blob> {
    let params = new HttpParams()
      .set('CashFlowSearch[type]', 'payment,receipt')
      .set('type_money', 'bank');

    if (filter?.date_from) {
      params = params.set('CashFlowSearch[date_from]', filter.date_from);
    }

    if (filter?.date_to) {
      params = params.set('CashFlowSearch[date_to]', filter.date_to);
    }

    return this.http.get(`${this.baseUrl}/cash-flow/export-s7`, {
      params,
      responseType: 'blob'
    });
  }
}
