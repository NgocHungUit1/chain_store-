import { Injectable } from '@angular/core';
import {HttpClient, HttpResponse} from '@angular/common/http';
import {Observable} from 'rxjs';
import {environment} from '../../environments/environment';
import {Holiday} from './holiday.model';

@Injectable({
  providedIn: 'root'
})
export class HolidayService {

  constructor(
    private http: HttpClient,
  ) {
  }

  getList(): Observable<HttpResponse<any>> {
    const url = environment.apiUrl + '/holiday';
    return this.http.get<HttpResponse<any>>(url, { observe: 'response' });
  }

  getDetail(id: string) {
    const url = environment.apiUrl + '/holiday/' + id;
    return this.http.get<Holiday>(url);
  }

  update(id: string, pos: any) {
    const url = environment.apiUrl + '/holiday/' + id;
    return this.http.put(url, pos);
  }

  create(data) {
    const url = environment.apiUrl + '/holiday';
    return this.http.post(url, data);
  }

  delete(id: string) {
    const url = environment.apiUrl + '/holiday/' + id;
    return this.http.delete(url);
  }
}
