import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from '../authentication/auth.service';
import { Move, MoveFilter } from './move.model';
import { Product } from '../product/product.model';

@Injectable({
  providedIn: 'root'
})
export class MoveService {

  constructor(
    private http: HttpClient,
    private auth: AuthService
  ) {
  }

  getApiUrl(filter?: MoveFilter) {
    if (!filter.page) {
      filter.page = 1;
    }

    if (!filter.pageSize) {
      filter.pageSize = 20;
    }

    let url = '/move?per-page=' + filter.pageSize;

    url += '&' + filter.toFilterString();
    return url;
  }

  getStateUrl(filter?: MoveFilter) {

    let url = '/move/list';
    if (!filter.page) {
      filter.page = 1;
    }
    if (!filter.pageSize) {
      filter.pageSize = 20;
    }
    url += '?' + filter.toFilterString();
    return url;
  }

  getList(filter?: MoveFilter): Observable<HttpResponse<any>> {
    const url = environment.apiUrl + this.getApiUrl(filter);
    return this.http.get<HttpResponse<any>>(url, {observe: 'response'});
  }

  public getInvoices(id: string, expand: string = ''): Observable<Move> {
    const url = environment.apiUrl + '/move/' + id + '?expand=' + expand;
    return this.http.get<Move>(url);
  }

  update(id: string, pos: any) {
    const url = environment.apiUrl + '/move/' + id;
    return this.http.put(url, pos);
  }

  create(data) {
    const url = environment.apiUrl + '/move';
    return this.http.post(url, data);
  }

  delete(id: string) {
    const url = environment.apiUrl + '/move/' + id;
    return this.http.delete(url, {});
  }

  autocomplete(term: string) {
    const url = environment.apiUrl + '/move/autocomplete?term=' + term;
    return this.http.get<Move[]>(url);
  }

  getDetail(id: string, expand: string = '') {
    const url = environment.apiUrl + '/move/' + id + '?expand=' + expand;
    return this.http.get<Move>(url);
  }

  getRenderNo() {
    const url = environment.apiUrl + '/move/render-no';
    return this.http.get<string>(url);
  }

  validate(data) {
    const url = environment.apiUrl + '/move/validate';
    return this.http.post(url, data);
  }


}




