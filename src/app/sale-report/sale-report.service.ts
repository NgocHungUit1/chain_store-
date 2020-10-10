import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient, HttpResponse } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class SaleReportService {

  constructor(private http: HttpClient) {
  }

  getDataBarChart(date_from: string, date_to: string) {
    const url = environment.apiUrl + '/report/data-bar-chart';
    return this.http.post<any>(url, {from: date_from, to: date_to});
  }
}
