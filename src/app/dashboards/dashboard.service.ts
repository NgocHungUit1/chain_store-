import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient, HttpResponse } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {

  constructor(private http: HttpClient) {
  }

  getDataDashBoard(from: string, to: string) {
    const url = environment.apiUrl + '/report/dash-board';
    return this.http.post<any>(url, {from: from, to: to});
  }

  getDataBarChart(from: string, to: string) {
    const url = environment.apiUrl + '/report/data-bar-chart';
    return this.http.post<any>(url, {from: from, to: to});
  }
}
