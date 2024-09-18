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
      label: 'HÔM QUA'
    },
    {
      value: 'today',
      label: 'HÔM NAY'
    },
    {
      value: 'last7days',
      label: '7 NGÀY QUA'
    },
    {
      value: 'this_month',
      label: 'THÁNG NÀY'
    },
    {
      value: 'last_month',
      label: 'THÁNG TRƯỚC'
    },
  ];
  timePeriodOptionsMap = this.timePeriodOptions.reduce((acc, cur) => ({...acc, [cur.value]: cur.label}), {});

  revenueReportData = [];

  revenueFilter: FormGroup;

  revenueChartOption: any = null;
  totalRevenue = 0;
  topSalingProductReportData = [];
  topSalingProductFilter: FormGroup;

  topSalingProductOption: any = null;

  DATE_FORMAT = 'YYYY-MM-DD';
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

    this.revenueFilter = this.fb.group({
      period: this.fb.control('today'),
      groupBy:  this.fb.control('day'),
    });



    this.getRevenueData({
      ...this.convertTimeOptionToDates('today'),
      group: 'day'
    });
    this.revenueFilter.valueChanges.subscribe(res => {
      this.getRevenueData({
        ...this.convertTimeOptionToDates(res.period),
        group: res['groupBy']
      });
    });


    this.topSalingProductFilter = this.fb.group({
      period: this.fb.control('today'),
      groupBy:  this.fb.control('amount'),
    });

    this.getTopProductData({
      ...this.convertTimeOptionToDates('today'),
      groupBy: 'quantity'
    });
    this.topSalingProductFilter.valueChanges.subscribe(res => {
      this.getTopProductData({
        ...this.convertTimeOptionToDates(res.period),
        groupBy: res['groupBy']
      });
    });
  }

  getRevenueData(payload) {
    this.dashboardService.getRevenueData(payload).subscribe(res => {
      this.revenueReportData = res;
      this.totalRevenue = res?.sale?.reduce((acc, cur) => acc + (+cur), 0);

      this.revenueChartOption = {
        series: [
          {
            name: 'Nhập hàng',
            data: res?.import || []
          },
          {
            name: 'Bán hàng',
            data: res?.sale || []
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
          categories: res?.key || []
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
  }

  getTopProductData(payload) {
    const mapGroupByToField = {
      amount: ['top_amount', 'total_amount'],
      quantity: ['top_quantity', 'total_quantity']
    };
    this.dashboardService.getTopSalingProductData(payload).subscribe(res => {
      const field1 = mapGroupByToField[payload.groupBy][0];
      const field2 = mapGroupByToField[payload.groupBy][1];

      this.topSalingProductOption = {
        series: [{
          data: res?.[field1]?.map(item => item[field2]) ?? [],
        }],
        chart: {
          type: 'bar',
          height: 400
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
          categories: res?.[field1]?.map(item => item.product_id) ?? []
        },
        fill: {
          colors: ['#1e88e5'],
          opacity: 1
        },
      };
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
