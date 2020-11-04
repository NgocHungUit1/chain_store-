import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from '../authentication/auth.service';
import { SamplePrescription, SamplePrescriptionFilter, SamplePrescriptionItemFilter } from './sample-prescription.model';

@Injectable({
  providedIn: 'root'
})
export class SamplePrescriptionItemService {

  constructor(
    private http: HttpClient,
    private auth: AuthService
  ) {
  }

  getApiUrl(filter?: SamplePrescriptionItemFilter) {
    if (!filter.page) {
      filter.page = 1;
    }

    if (!filter.pageSize) {
      filter.pageSize = 20;
    }

    let url = '/sample-prescription?per-page=' + filter.pageSize;

    url += '&' + filter.toFilterString();
    return url;
  }

  getStateUrl(filter?: SamplePrescriptionItemFilter) {

    let url = '/invoice/list';
    if (!filter.page) {
      filter.page = 1;
    }
    if (!filter.pageSize) {
      filter.pageSize = 20;
    }
    url += '?' + filter.toFilterString();
    return url;
  }

  getList(filter?: SamplePrescriptionItemFilter): Observable<HttpResponse<any>> {
    const url = environment.apiUrl + this.getApiUrl(filter);
    return this.http.get<HttpResponse<any>>(url, {observe: 'response'});
  }

  update(id: string, pos: any) {
    const url = environment.apiUrl + '/sample-prescription/' + id;
    return this.http.put(url, pos);
  }

  create(data) {
    const url = environment.apiUrl + '/sample-prescription';
    return this.http.post(url, data);
  }

  delete(id: string) {
    const url = environment.apiUrl + '/sample-prescription/delete-invoice';
    return this.http.post(url, {invoice_id: id});
  }

  autocomplete(term: string) {
    const url = environment.apiUrl + '/sample-prescription/autocomplete?term=' + term;
    return this.http.get<SamplePrescription[]>(url);
  }

  getDetail(invoice_id: string, price_book_id: string) {
    const url = environment.apiUrl + '/sample-prescription/detail';
    return this.http.post(url, {invoice_id: invoice_id, price_book_id: price_book_id});
  }


}




