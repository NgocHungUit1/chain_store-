import { Component, OnInit } from '@angular/core';
import { DashboardService } from '../dashboard.service';
import { AddInfo, SaleResultToday } from '../dashboard.type';
import { FormBuilder, FormGroup } from '@angular/forms';
import { format } from 'date-fns';

@Component({
  selector: 'app-dashboard3',
  templateUrl: './dashboard3.component.html',
  styleUrls: ['./dashboard3.component.css'],
})
export class Dashboard3Component implements OnInit {

  saleResult: SaleResultToday = null;

  adInfo: AddInfo = null;

  timePeriodOptions = [
    {
      value: 'yesterday',
      label: 'Hôm qua'
    },
    {
      value: 'today',
      label: 'Hôm nay'
    },
    {
      value: 'last7days',
      label: '7 ngày qua'
    },
    {
      value: 'this_month',
      label: 'Tháng này'
    },
    {
      value: 'last_month',
      label: 'Tháng trước'
    },
  ];

  revenueReportData = [];

  revenueFilter: FormGroup;

  revenueChartOption: any = null;
  topSalingProductReportData = [];
  topSalingProductFilter: FormGroup;

  topSalingProductOption: any = null;

  DATE_FORMAT = 'DD-MM-YYYY';
  constructor(private dashboardService: DashboardService, private fb: FormBuilder) {
  }

  ngOnInit(): void {
    const today = format(new Date(), this.DATE_FORMAT);
    this.dashboardService.getDataDashBoard(today, today).subscribe(res => {
      this.saleResult = {
        invoices: res?.invoice?.count ?? 0,
        revenue: res?.invoice?.sum ?? 0,
        returnOrders: res?.return?.count ?? 0,
        returnMoney: res?.return?.sum ?? 0,
        changePercent: res?.month?.now && res?.month?.after ? (res?.month?.now - res?.month?.after) * 100 / res?.month?.after : 0,
      };
    });

    this.dashboardService.getAddInfo().subscribe(res => {
      this.adInfo = res;
    });
    this.dashboardService.getRevenueData().subscribe(res => {
      this.revenueReportData = res;
      console.log(res);

      this.revenueChartOption = {
        series: [
          {
            name: 'Nhập hàng',
            data: [44, 55, 57, 56, 61, 58]
          },
          {
            name: 'Bán hàng',
            data: [76, 85, 101, 98, 87, 105]
          }
        ],
        chart: {
          type: 'bar',
          height: 400
        },
        grid: {
          borderColor: 'rgba(0,0,0,.2)',
          stoke: 3,
        },
        plotOptions: {
          bar: {
            borderRadius: 1,
            borderRadiusApplication: 'end',
          },
        },
        dataLabels: {
          enabled: false
        },
        stroke: {
          show: true,
          width: 2,
          colors: ['transparent']
        },
        xaxis: {
          categories: [
            'Feb',
            'Mar',
            'Apr',
            'May',
            'Jun',
            'Jul'
          ]
        },
        legend: {
          show: true,
        },
        fill: {
          colors: ['#009688', '#1e88e5'],
          opacity: 1
        },
        tooltip: {
          fillSeriesColor: false,
          marker: {
            show: false,
          },
        }
      };
    });

    this.revenueFilter = this.fb.group({
      period: this.fb.control('today'),
      groupBy:  this.fb.control('day'),
    });

    this.topSalingProductFilter = this.fb.group({
      period: this.fb.control('today'),
      groupBy:  this.fb.control('quantity'),
    });


    this.dashboardService.getTopSalingProductData({  }, 1).subscribe(res => {
      this.topSalingProductReportData = res;
      console.log(res);

      this.topSalingProductOption = {
        series: [{
          data: [400, 430, 448, 470, 540, 580, 690, 1100, 1200, 1380]
        }],
        chart: {
          type: 'bar',
          height: 350
        },
        plotOptions: {
          bar: {
            borderRadius: 4,
            borderRadiusApplication: 'end',
            horizontal: true,
          }
        },
        dataLabels: {
          enabled: false
        },
        xaxis: {
          categories: ['Thuốc A', 'Thuốc B', 'Thuốc C', 'Thuốc D', 'Thuốc E', 'Thuốc F', 'Thuốc G',
            'Thuốc H', 'Thuốc J', 'Thuốc k'
          ],
        },
        fill: {
          colors: ['#1e88e5'],
          opacity: 1
        },
      };
    });

    this.topSalingProductFilter.valueChanges.subscribe(res => {
      console.log(res);
      const payload: any = {
        ...this.convertTimeOptionToDates(res.period),
        groupBy: res['groupBy']
      };
      console.log(payload);
      this.dashboardService.getTopSalingProductData(payload).subscribe(res => {
        console.log(res);
      });
    });
  }

  convertTimeOptionToDates(value) {
    let from: any = new Date();
    let to: any = new Date();
    switch (value) {
      case 'yesterday':
        from.setDate(from.getDate() - 1);
        to.setDate(to.getDate() - 1);
        from = format(from, this.DATE_FORMAT);
        to = format(to, this.DATE_FORMAT);
        break;
      case 'today':
        from = format(from, this.DATE_FORMAT);
        to = format(to, this.DATE_FORMAT);
        break;
      case 'last7days':
        from.setDate(from.getDate() - 7);
        from = format(from, this.DATE_FORMAT);
        to = format(to, this.DATE_FORMAT);
        break;
      case 'this_month':
        from.setDate(1);
        from = format(from, this.DATE_FORMAT);
        to = format(to, this.DATE_FORMAT);
        break;
      case 'last_month':
        from.setMonth(from.getMonth() - 1);
        from.setDate(1);
        to.setDate(1);
        to.setDate(to.getDate() - 1);
        from = format(from, this.DATE_FORMAT);
        to = format(to, this.DATE_FORMAT);
        break;
    }

    return {
      from,
      to
    };
  }
}
