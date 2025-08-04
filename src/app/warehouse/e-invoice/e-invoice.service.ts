import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class EInvoiceService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  login(): Observable<any> {
    return this.http.post(this.baseUrl + '/warehouse/einvoice-login', null);
  }

  registerPartner(data: any): Observable<any> {
    return this.http.post(this.baseUrl + '/warehouse/einvoice-register-unit', data);
  }

  syncInvoices(data: {
    Username: string;
    Password: string;
    FromInvoiceDate: string;
    ToInvoiceDate: string;
  }): Observable<any> {
    return this.http.post(this.baseUrl + '/warehouse/einvoice-sync-invoices', data);
  }

  getInvoices(MST: string, LastUpdate: string) {
    return this.http.get<any[]>(`${this.baseUrl}/warehouse/einvoice-get-invoices?MST=${MST}&LastUpdate=${LastUpdate}`);
  }

  exportExcel(MST: string, LastUpdate: string) {
    return this.http.get(
      `${this.baseUrl}/warehouse/einvoice-export-invoices-excel?MST=${MST}&LastUpdate=${LastUpdate}`,
      { responseType: 'blob' }
    );
  }


} 