import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { environment } from '../../environments/environment';
import { ReturnsFilter, Returns, ReturnedItemStatistics } from './returns.model';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ReturnsService {


  constructor(private http: HttpClient) {
  }

  getApiUrl(filter?: ReturnsFilter) {
    if (!filter.page) {
      filter.page = 1;
    }

    if (!filter.pageSize) {
      filter.pageSize = 20;
    }

    let url = '/returns?per-page=' + filter.pageSize;

    url += '&' + filter.toFilterString();
    return url;
  }

  getStateUrl(filter?: ReturnsFilter) {

    let url = '/returns/list';
    if (!filter.page) {
      filter.page = 1;
    }
    if (!filter.pageSize) {
      filter.pageSize = 20;
    }
    url += '?' + filter.toFilterString();
    return url;
  }

  getList(filter?: ReturnsFilter): Observable<HttpResponse<any>> {
    const url = environment.apiUrl + this.getApiUrl(filter);
    return this.http.get<HttpResponse<any>>(url, { observe: 'response' });
  }

  /**
   * Thống kê số lượng trả theo từng loại thuốc trong kỳ.
   * Server gộp sẵn theo đúng bộ lọc đang áp, nên số là của TRỌN kỳ chứ không
   * phải chỉ trang đang xem.
   */
  getThongKeThuoc(filter?: ReturnsFilter): Observable<ReturnedItemStatistics[]> {
    const url = environment.apiUrl + '/returns/thong-ke-thuoc?' + (filter ? filter.toFilterString() : '');
    return this.http.get<ReturnedItemStatistics[]>(url);
  }

  public getReturns(id: string, expand: string = ''): Observable<Returns> {
    const url = environment.apiUrl + '/returns/' + id + '?expand=' + expand;
    return this.http.get<Returns>(url);
  }

  update(id: string, pos: any) {
    const url = environment.apiUrl + '/returns/' + id;
    return this.http.put(url, pos);
  }

  create(data) {
    const url = environment.apiUrl + '/returns';
    return this.http.post(url, data);
  }

  delete(id: string) {
    const url = environment.apiUrl + '/returns/delete/' + id;
    return this.http.delete(url);
  }

  autocomplete(term: string) {
    const url = environment.apiUrl + '/returns/autocomplete?term=' + term;
    return this.http.get<Returns[]>(url);
  }

  getDetail(invoice_id: string, price_book_id: string) {
    const url = environment.apiUrl + '/returns/detail';
    return this.http.post(url, { invoice_id: invoice_id, price_book_id: price_book_id });
  }



}




