import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { MedicalFacility, MedicalFacilityFilter } from './medical-facility.model';

@Injectable({
  providedIn: 'root'
})
export class MedicalFacilityService {

  constructor(private http: HttpClient) { }

  getApiUrl(filter?: MedicalFacilityFilter) {
    if (!filter.page) {
      filter.page = 1;
    }

    if (!filter.pageSize) {
      filter.pageSize = 20;
    }

    let url = '/medical-facility?per-page=' + filter.pageSize;

    url += '&' + filter.toFilterString();
    return url;
  }

  getStateUrl(filter?: MedicalFacilityFilter) {

    let url = '/medical-facility/list';
    if (!filter.page) {
      filter.page = 1;
    }
    if (!filter.pageSize) {
      filter.pageSize = 20;
    }
    url += '?' + filter.toFilterString();
    return url;
  }

  getList(filter?: MedicalFacilityFilter): Observable<HttpResponse<any>> {
    const url = environment.apiUrl + this.getApiUrl(filter);
    return this.http.get<HttpResponse<any>>(url, { observe: 'response' });
  }

  getDetail(id: string, expand: string) {
    const url = environment.apiUrl + '/medical-facility/' + id + '?expand=' + expand;
    return this.http.get<MedicalFacility>(url);
  }

  update(id: string, pos: any) {
    const url = environment.apiUrl + '/medical-facility/' + id;
    return this.http.put(url, pos);
  }

  create(data) {
    const url = environment.apiUrl + '/medical-facility';
    return this.http.post(url, data);
  }

}
