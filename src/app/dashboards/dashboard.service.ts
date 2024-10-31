import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { of } from 'rxjs/internal/observable/of';
import { Observable } from 'rxjs';
import { AddInfo, SaleResultToday } from './dashboard.type';

@Injectable({
  providedIn: 'root',
})
export class DashboardService {

  constructor(private http: HttpClient) {
  }

  getDataDashBoard(from: string, to: string) {
    const url = environment.apiUrl + '/report/dash-board';
    return this.http.post<any>(url, { from: from, to: to });
  }

  getDataBarChart(from: string, to: string) {
    const url = environment.apiUrl + '/report/data-bar-chart';
    return this.http.post<any>(url, { from: from, to: to });
  }

  getAddInfo(): Observable<AddInfo> {
    return of({
      bgUrl: '/assets/images/dashboard/zalo_banner.png',
      url: 'https://zalo.me/0903010099',
    });
  }

  getRevenueData(payload) {
    const url = environment.apiUrl + '/report/data-bar-chart-new';
    return this.http.get<any>(url, { params: payload });
  }

  getTopSalingProductData(payload: any) {
    const url = environment.apiUrl + '/product/top-report';
    return this.http.get<any>(url, { params: payload });
  }

  getRecentlyHistory(payload: any) {
    const url = environment.apiUrl + '/model-change-log?sort=-created_at&per-page=10&ModelChangeLogSearch[model_name]=invoice,warehouse,returns,product&expand=createdUser';
    return this.http.get<any>(url, { params: payload });
  }
}
