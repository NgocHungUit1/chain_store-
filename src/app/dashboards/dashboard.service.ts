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

  getSaleResultToday(): Observable<SaleResultToday> {
    return of({
      invoices: 50,
      revenue: 9000000,
      returnOrders: 100,
      returnMoney: 10000,
      changePercent: -80,
    });
  }

  getAddInfo(): Observable<AddInfo> {
    return of({
      bgUrl: 'https://cdn-app.kiotviet.vn/retailler/Content/img/zalo-baner-vie.png',
      url: 'https://zalo.me/84932106859',
    });
  }

  getRevenueData() {
    return of([
      {
        'Subject': '01',
        'Value': 5850000,
        'Group': 'Chi nhánh trung tâm',
        'Total': 5850000,
        'ExtraOrderBy': '2024-08-01T00:00:00.0000000+07:00',
      },
      {
        'Subject': '02',
        'Value': 6240000,
        'Group': 'Chi nhánh trung tâm',
        'Total': 6240000,
        'ExtraOrderBy': '2024-08-02T00:00:00.0000000+07:00',
      },
      {
        'Subject': '03',
        'Value': 4810000,
        'Group': 'Chi nhánh trung tâm',
        'Total': 4810000,
        'ExtraOrderBy': '2024-08-03T00:00:00.0000000+07:00',
      },
      {
        'Subject': '04',
        'Value': 6110000,
        'Group': 'Chi nhánh trung tâm',
        'Total': 6110000,
        'ExtraOrderBy': '2024-08-04T00:00:00.0000000+07:00',
      },
      {
        'Subject': '05',
        'Value': 4550000,
        'Group': 'Chi nhánh trung tâm',
        'Total': 4550000,
        'ExtraOrderBy': '2024-08-05T00:00:00.0000000+07:00',
      },
      {
        'Subject': '06',
        'Value': 5590000,
        'Group': 'Chi nhánh trung tâm',
        'Total': 5590000,
        'ExtraOrderBy': '2024-08-06T00:00:00.0000000+07:00',
      },
      {
        'Subject': '07',
        'Value': 1690000,
        'Group': 'Chi nhánh trung tâm',
        'Total': 1690000,
        'ExtraOrderBy': '2024-08-07T00:00:00.0000000+07:00',
      },
      {
        'Subject': '08',
        'Value': 4030000,
        'Group': 'Chi nhánh trung tâm',
        'Total': 4030000,
        'ExtraOrderBy': '2024-08-08T00:00:00.0000000+07:00',
      },
      {
        'Subject': '09',
        'Value': 7020000,
        'Group': 'Chi nhánh trung tâm',
        'Total': 7020000,
        'ExtraOrderBy': '2024-08-09T00:00:00.0000000+07:00',
      },
      {
        'Subject': '10',
        'Value': 6110000,
        'Group': 'Chi nhánh trung tâm',
        'Total': 6110000,
        'ExtraOrderBy': '2024-08-10T00:00:00.0000000+07:00',
      },
      {
        'Subject': '11',
        'Value': 3510000,
        'Group': 'Chi nhánh trung tâm',
        'Total': 3510000,
        'ExtraOrderBy': '2024-08-11T00:00:00.0000000+07:00',
      },
      {
        'Subject': '12',
        'Value': 4290000,
        'Group': 'Chi nhánh trung tâm',
        'Total': 4290000,
        'ExtraOrderBy': '2024-08-12T00:00:00.0000000+07:00',
      },
      {
        'Subject': '13',
        'Value': 5330000,
        'Group': 'Chi nhánh trung tâm',
        'Total': 5330000,
        'ExtraOrderBy': '2024-08-13T00:00:00.0000000+07:00',
      },
      {
        'Subject': '14',
        'Value': 1820000,
        'Group': 'Chi nhánh trung tâm',
        'Total': 1820000,
        'ExtraOrderBy': '2024-08-14T00:00:00.0000000+07:00',
      },
      {
        'Subject': '15',
        'Value': 2730000,
        'Group': 'Chi nhánh trung tâm',
        'Total': 2730000,
        'ExtraOrderBy': '2024-08-15T00:00:00.0000000+07:00',
      },
      {
        'Subject': '16',
        'Value': 5980000,
        'Group': 'Chi nhánh trung tâm',
        'Total': 5980000,
        'ExtraOrderBy': '2024-08-16T00:00:00.0000000+07:00',
      },
      {
        'Subject': '17',
        'Value': 6370000,
        'Group': 'Chi nhánh trung tâm',
        'Total': 6370000,
        'ExtraOrderBy': '2024-08-17T00:00:00.0000000+07:00',
      },
      {
        'Subject': '18',
        'Value': 3380000,
        'Group': 'Chi nhánh trung tâm',
        'Total': 3380000,
        'ExtraOrderBy': '2024-08-18T00:00:00.0000000+07:00',
      },
      {
        'Subject': '19',
        'Value': 6630000,
        'Group': 'Chi nhánh trung tâm',
        'Total': 6630000,
        'ExtraOrderBy': '2024-08-19T00:00:00.0000000+07:00',
      },
      {
        'Subject': '20',
        'Value': 4290000,
        'Group': 'Chi nhánh trung tâm',
        'Total': 4290000,
        'ExtraOrderBy': '2024-08-20T00:00:00.0000000+07:00',
      },
      {
        'Subject': '21',
        'Value': 5720000,
        'Group': 'Chi nhánh trung tâm',
        'Total': 5720000,
        'ExtraOrderBy': '2024-08-21T00:00:00.0000000+07:00',
      },
      {
        'Subject': '22',
        'Value': 2340000,
        'Group': 'Chi nhánh trung tâm',
        'Total': 2340000,
        'ExtraOrderBy': '2024-08-22T00:00:00.0000000+07:00',
      },
      {
        'Subject': '23',
        'Value': 7670000,
        'Group': 'Chi nhánh trung tâm',
        'Total': 7670000,
        'ExtraOrderBy': '2024-08-23T00:00:00.0000000+07:00',
      },
      {
        'Subject': '24',
        'Value': 3120000,
        'Group': 'Chi nhánh trung tâm',
        'Total': 3120000,
        'ExtraOrderBy': '2024-08-24T00:00:00.0000000+07:00',
      },
      {
        'Subject': '25',
        'Value': 650000,
        'Group': 'Chi nhánh trung tâm',
        'Total': 650000,
        'ExtraOrderBy': '2024-08-25T00:00:00.0000000+07:00',
      },
      {
        'Subject': '26',
        'Value': 2730000,
        'Group': 'Chi nhánh trung tâm',
        'Total': 2730000,
        'ExtraOrderBy': '2024-08-26T00:00:00.0000000+07:00',
      },
      {
        'Subject': '27',
        'Value': 1690000,
        'Group': 'Chi nhánh trung tâm',
        'Total': 1690000,
        'ExtraOrderBy': '2024-08-27T00:00:00.0000000+07:00',
      },
      {
        'Subject': '28',
        'Value': 2730000,
        'Group': 'Chi nhánh trung tâm',
        'Total': 2730000,
        'ExtraOrderBy': '2024-08-28T00:00:00.0000000+07:00',
      },
      {
        'Subject': '29',
        'Value': 4680000,
        'Group': 'Chi nhánh trung tâm',
        'Total': 4680000,
        'ExtraOrderBy': '2024-08-29T00:00:00.0000000+07:00',
      },
      {
        'Subject': '30',
        'Value': 4680000,
        'Group': 'Chi nhánh trung tâm',
        'Total': 4680000,
        'ExtraOrderBy': '2024-08-30T00:00:00.0000000+07:00',
      },
      {
        'Subject': '31',
        'Value': 6110000,
        'Group': 'Chi nhánh trung tâm',
        'Total': 6110000,
        'ExtraOrderBy': '2024-08-31T00:00:00.0000000+07:00',
      },
    ]);
  }

  getTopSalingProductData() {
    return of([
      {
        'Subject': 'Ecosip7.5x10cm - Tatra - H20túix 5Miếng',
        'Value': 95420000,
        'Total': 0,
        'Extra1': 'SP000008',
      },
      {
        'Subject': 'Cao Dan Salonsip14x10cm - Hisamitsu - H10 Gói 2 Miếng',
        'Value': 43030000,
        'Total': 0,
        'Extra1': 'SP000007',
      },
    ]);
  }
}
