import {Injectable} from '@angular/core';
import {HttpClient, HttpResponse} from '@angular/common/http';
import {Observable} from 'rxjs';
import {environment} from '../../environments/environment';
import {Medicine, MedicineFilter} from './medicine.model';

@Injectable({
  providedIn: 'root'
})
export class MedicineService {

  constructor(private http: HttpClient) {
  }

  getApiUrl(filter?: MedicineFilter) {
    if (!filter.page) {
      filter.page = 1;
    }

    if (!filter.pageSize) {
      filter.pageSize = 20;
    }

    let url = '/medicine?per-page=' + filter.pageSize;

    url += '&' + filter.toFilterString();
    return url;
  }

  getStateUrl(filter?: MedicineFilter) {

    let url = '/medicine/list';
    if (!filter.page) {
      filter.page = 1;
    }
    if (!filter.pageSize) {
      filter.pageSize = 20;
    }
    url += '?' + filter.toFilterString();
    return url;
  }

  getList(filter?: MedicineFilter): Observable<HttpResponse<any>> {
    const url = environment.apiUrl + this.getApiUrl(filter);
    return this.http.get<HttpResponse<any>>(url, {observe: 'response'});
  }

  getDetail(id: string) {
    const url = environment.apiUrl + '/medicine/' + id;
    return this.http.get<object>(url);
  }

  update(id: string, pos: any) {
    const url = environment.apiUrl + '/medicine/' + id;
    return this.http.put(url, pos);
  }

  create(data) {
    const url = environment.apiUrl + '/medicine';
    return this.http.post(url, data);
  }

  autocomplete(term: string) {
    const url = environment.apiUrl + '/medicine/autocomplete?term=' + term;
    return this.http.get<Medicine[]>(url);
  }

  connect(id) {
    const url = environment.apiUrl + '/medicine/connect?id=' + id;
    return this.http.post(url, {});
  }

  disconnect(id) {
    const url = environment.apiUrl + '/medicine/disconnect?id=' + id;
    return this.http.post(url, {});
  }

  reconnect(id) {
    const url = environment.apiUrl + '/medicine/connect?id=' + id + '&reconnect=1';
    return this.http.post(url, {});
  }
}




