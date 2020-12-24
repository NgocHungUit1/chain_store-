import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from '../authentication/auth.service';
import { SamplePrescription, SamplePrescriptionFilter, SamplePrescriptionItem } from './sample-prescription.model';
import { StockTake } from '../stock-take/stock-take.model';
import { Product } from '../product/product.model';

@Injectable({
  providedIn: 'root'
})
export class SamplePrescriptionService {

  constructor(
    private http: HttpClient,
    private auth: AuthService
  ) {
  }

  getApiUrl(filter?: SamplePrescriptionFilter) {
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

  getList(filter?: SamplePrescriptionFilter): Observable<HttpResponse<any>> {
    const url = environment.apiUrl + this.getApiUrl(filter);
    return this.http.get<HttpResponse<any>>(url, {observe: 'response'});
  }

  public getInvoices(id: string, expand: string = ''): Observable<SamplePrescription> {
    const url = environment.apiUrl + '/sample-prescription/' + id + '?expand=' + expand;
    return this.http.get<SamplePrescription>(url);
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
    const url = environment.apiUrl + '/sample-prescription/delete-sample';
    return this.http.post(url, {id: id});
  }

  autocomplete(term: string) {
    const url = environment.apiUrl + '/sample-prescription/autocomplete?term=' + term;
    return this.http.get<SamplePrescription[]>(url);
  }

  getDetail(id: string, expand: string = '') {
    const url = environment.apiUrl + '/sample-prescription/' + id + '?expand=' + expand;
    return this.http.get<SamplePrescription>(url);
  }

  getRenderSamplePrescriptionNo() {
    const url = environment.apiUrl + '/sample-prescription/render-no';
    return this.http.get<string>(url);
  }

  /**
   *
   * @param id
   * @param expand
   */
  getDetailForCart(id: string) {
    const url = environment.apiUrl + '/sample-prescription/cart';
    return this.http.post<Product[]>(url, {id: id});
  }


}




