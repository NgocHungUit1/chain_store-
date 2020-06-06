import {Injectable} from '@angular/core';
import {HttpClient, HttpResponse} from '@angular/common/http';
import {Observable} from 'rxjs';
import {environment} from '../../environments/environment';
import {Supplier, SupplierFilter} from './supplier.model';

@Injectable({
  providedIn: 'root'
})
export class SupplierService {

  constructor(private http: HttpClient) {
  }

  getApiUrl(filter?: SupplierFilter) {
    if (!filter.page) {
      filter.page = 1;
    }

    if (!filter.pageSize) {
      filter.pageSize = 20;
    }

    let url = '/supplier?per-page=' + filter.pageSize;

    url += '&' + filter.toFilterString();
    return url;
  }

  getStateUrl(filter?: SupplierFilter) {

    let url = '/supplier/list';
    if (!filter.page) {
      filter.page = 1;
    }
    if (!filter.pageSize) {
      filter.pageSize = 20;
    }
    url += '?' + filter.toFilterString();
    return url;
  }

  getList(filter?: SupplierFilter): Observable<HttpResponse<any>> {
    const url = environment.apiUrl + this.getApiUrl(filter);
    return this.http.get<HttpResponse<any>>(url, {observe: 'response'});
  }

  getDetail(id: string, expand: string) {
    const url = environment.apiUrl + '/supplier/' + id + '?expand=' + expand;
    return this.http.get<Supplier>(url);
  }

  update(id: string, pos: any) {
    const url = environment.apiUrl + '/supplier/' + id;
    return this.http.put(url, pos);
  }

  create(data) {
    const url = environment.apiUrl + '/supplier';
    return this.http.post(url, data);
  }

  autocomplete(term: string) {
    const url = environment.apiUrl + '/supplier/autocomplete?term=' + term;
    return this.http.get<Supplier[]>(url);
  }

  activate(id) {
    const url = environment.apiUrl + '/supplier/activate?id=' + id;
    return this.http.post(url, {});
  }

  lock(id) {
    const url = environment.apiUrl + '/supplier/lock?id=' + id;
    return this.http.post(url, {});
  }
}




