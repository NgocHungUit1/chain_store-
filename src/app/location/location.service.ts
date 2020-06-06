import {Injectable} from '@angular/core';
import {HttpClient, HttpResponse} from '@angular/common/http';
import {Observable} from 'rxjs';
import {environment} from '../../environments/environment';
import {Location, LocationFilter} from './location.model';

@Injectable({
  providedIn: 'root'
})
export class LocationService {

  constructor(private http: HttpClient) {
  }

  getApiUrl(filter?: LocationFilter) {
    if (!filter.page) {
      filter.page = 1;
    }

    if (!filter.pageSize) {
      filter.pageSize = 20;
    }

    let url = '/location?per-page=' + filter.pageSize;

    url += '&' + filter.toFilterString();
    return url;
  }

  getStateUrl(filter?: LocationFilter) {

    let url = '/location/list';
    if (!filter.page) {
      filter.page = 1;
    }
    if (!filter.pageSize) {
      filter.pageSize = 20;
    }
    url += '?' + filter.toFilterString();
    return url;
  }

  getList(filter?: LocationFilter): Observable<HttpResponse<any>> {
    const url = environment.apiUrl + this.getApiUrl(filter);
    return this.http.get<HttpResponse<any>>(url, {observe: 'response'});
  }

  getDetail(id: string) {
    const url = environment.apiUrl + '/location/' + id;
    return this.http.get<Location>(url);
  }

  update(id: string, pos: any) {
    const url = environment.apiUrl + '/location/' + id;
    return this.http.put(url, pos);
  }

  create(data) {
    const url = environment.apiUrl + '/location';
    return this.http.post(url, data);
  }

  autocomplete(term: string, type: string, parent_id: string = null) {
    let url = environment.apiUrl + '/location/autocomplete?term=' + term + '&type=' + type;
    if (parent_id !== null) {
      url += '&parent_id=' + parent_id;
    }
    return this.http.get<Location[]>(url);
  }
}




