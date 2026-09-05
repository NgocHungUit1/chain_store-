import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Doctor, DoctorFilter } from '../doctor/doctor.model';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Prescription, PrescriptionFilter } from './prescription.model';

@Injectable({
  providedIn: 'root'
})
export class PrescriptionService {

  constructor(private http: HttpClient) { }

  getApiUrl(filter?: PrescriptionFilter) {
    if (!filter.page) {
      filter.page = 1;
    }

    if (!filter.pageSize) {
      filter.pageSize = 20;
    }

    let url = '/prescription?per-page=' + filter.pageSize;

    url += '&' + filter.toFilterString();
    return url;
  }

  getStateUrl(filter?: PrescriptionFilter) {

    let url = '/prescription/list';
    if (!filter.page) {
      filter.page = 1;
    }
    if (!filter.pageSize) {
      filter.pageSize = 20;
    }
    url += '?' + filter.toFilterString();
    return url;
  }

  getList(filter?: PrescriptionFilter): Observable<HttpResponse<any>> {
    const url = environment.apiUrl + this.getApiUrl(filter);
    return this.http.get<HttpResponse<any>>(url, { observe: 'response' });
  }

  getDetail(id: string, expand: string) {
    const url = environment.apiUrl + '/prescription/' + id + '?expand=' + expand;
    return this.http.get<Prescription>(url);
  }

  getInvoicePrescriptionDetail(id: string) {
    return this.getDetail(id, 'medicalFacility,nationalProducts');
  }

  update(id: string, pos: any) {
    const url = environment.apiUrl + '/prescription/' + id;
    return this.http.put(url, pos);
  }

  create(data) {
    const url = environment.apiUrl + '/prescription';
    return this.http.post(url, data);
  }

  getRenderNo() {
    const url = environment.apiUrl + '/prescription/render-no';
    return this.http.get<string>(url);
  }

  // Thêm phương thức mới để tạo hoặc cập nhật đơn thuốc có ảnh
  createWithFormData(formData: FormData) {
    return this.http.post(`${environment.apiUrl}/prescription`, formData);
  }

  // Thêm phương thức cập nhật với FormData
  updateWithFormData(id: string, formData: FormData) {
    return this.http.put(`${environment.apiUrl}/prescription/${id}`, formData);
  }
}
