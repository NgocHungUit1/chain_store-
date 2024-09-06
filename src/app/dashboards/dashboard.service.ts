import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { of } from 'rxjs/internal/observable/of';
import { Observable } from 'rxjs';
import { AddInfo, SaleResultToday } from './dashboard.type';

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

  getSaleResultToday(): Observable<SaleResultToday> {
    return of({
      invoices: 50,
      revenue: 9000000,
      returnOrders: 100,
      returnMoney: 10000,
      changePercent: -80
    });
  }
  getAddInfo(): Observable<AddInfo> {
    return of({
      bgUrl: "https://cdn-app.kiotviet.vn/retailler/Content/img/zalo-baner-vie.png",
      url: 'https://zalo.me/84932106859'
    });
  }
}
