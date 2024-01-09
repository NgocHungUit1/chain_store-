import {Injectable} from '@angular/core';
import {HttpClient, HttpResponse} from '@angular/common/http';
import {Observable} from 'rxjs';
import {environment} from '../../../environments/environment';
import {ModelChangeLog, ModelChangeLogFilter} from './model-change-log.model';

@Injectable({
  providedIn: 'root'
})
export class ModelChangeLogService {

  constructor(private http: HttpClient) {
  }

  getApiUrl(filter?: ModelChangeLogFilter) {
    if (!filter.page) {
      filter.page = 1;
    }

    if (!filter.pageSize) {
      filter.pageSize = 20;
    }

    let url = '/model-change-log?per-page=' + filter.pageSize;

    url += '&' + filter.toFilterString();
    return url;
  }

  getStateUrl(filter?: ModelChangeLogFilter) {

    let url = '/model-change-log/list';
    if (!filter.page) {
      filter.page = 1;
    }
    if (!filter.pageSize) {
      filter.pageSize = 20;
    }
    url += '?' + filter.toFilterString();
    return url;
  }

  getDetail(id: string, expand: string = '') {
    let url = environment.apiUrl + '/model-change-log/' + id;
    if (expand.length > 0) {
      url = url + '?expand=' + expand;
    }
    return this.http.get<ModelChangeLog>(url);
  }

  getList(filter?: ModelChangeLogFilter): Observable<HttpResponse<any>> {
    const url = environment.apiUrl + this.getApiUrl(filter);
    return this.http.get<HttpResponse<any>>(url, {observe: 'response'});
  }

}




