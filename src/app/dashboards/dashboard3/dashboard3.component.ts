import { Component, OnInit } from '@angular/core';
import { DashboardService } from '../dashboard.service';
import { AddInfo, SaleResultToday } from '../dashboard.type';

@Component({
  selector: 'app-dashboard3',
  templateUrl: './dashboard3.component.html',
  styleUrls: ['./dashboard3.component.css'],
})
export class Dashboard3Component implements OnInit {

  saleResult: SaleResultToday = null;

  adInfo: AddInfo = null;

  constructor(private dashboardService: DashboardService) {
  }

  ngOnInit(): void {
    this.dashboardService.getSaleResultToday().subscribe(res => {
      console.log(res);
      this.saleResult = res;
    });
    this.dashboardService.getAddInfo().subscribe(res => {
      this.adInfo = res;
    });
  }

}
