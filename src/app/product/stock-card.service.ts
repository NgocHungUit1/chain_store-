import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { environment } from '../../environments/environment';
import { StockCard } from './stock-card.model';
import { AuthService } from '../authentication/auth.service';
import { StockCardFilter } from './stock-card.model';

@Injectable({
  providedIn: 'root'
})

export class StockCardService {

  constructor(
    private http: HttpClient,
    private auth: AuthService
  ) {
  }

  getApiUrl(filter?: StockCardFilter) {
    if (!filter.page) {
      filter.page = 1;
    }

    if (!filter.pageSize) {
      filter.pageSize = 20;
    }

    let url = '/stock-card?per-page=' + filter.pageSize;

    url += '&' + filter.toFilterString();
    return url;
  }

  getStateUrl(filter?: StockCardFilter) {

    let url = '/stock-card/list';
    if (!filter.page) {
      filter.page = 1;
    }
    if (!filter.pageSize) {
      filter.pageSize = 20;
    }
    url += '?' + filter.toFilterString();
    return url;
  }

  getList(filter?: StockCardFilter): Observable<HttpResponse<any>> {
    const url = environment.apiUrl + this.getApiUrl(filter);
    return this.http.get<HttpResponse<any>>(url, {observe: 'response'});
  }

  getDetail(id: string, expand: string = '') {
    const url = environment.apiUrl + '/stock-card/' + id + '?expand=' + expand;
    return this.http.get<object>(url);
  }

  public getProducts(id: string, expand: string = ''): Observable<StockCard> {
    const url = environment.apiUrl + '/stock-card/' + id + '?expand=' + expand;
    return this.http.get<StockCard>(url);
  }

  update(id: string, pos: any) {
    const url = environment.apiUrl + '/stock-card/' + id;
    return this.http.put(url, pos);
  }

  create(data) {
    const url = environment.apiUrl + '/stock-card';
    return this.http.post(url, data);
  }

  getDownloadLink(filter?: StockCardFilter) {
    const _token = this.auth.getToken();

    return environment.apiUrl + '/stock-card/download?' + filter.toFilterString() + '&token=' + _token;
  }

}




