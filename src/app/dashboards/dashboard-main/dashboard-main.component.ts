import { Component, OnInit, ViewChild } from '@angular/core';
import * as Chartist from 'chartist';
import { ChartType, ChartEvent } from 'ng-chartist';

import {
  ApexAxisChartSeries,
  ApexChart,
  ChartComponent,
  ApexDataLabels,
  ApexPlotOptions,
  ApexYAxis,
  ApexLegend,
  ApexStroke,
  ApexXAxis,
  ApexFill,
  ApexTooltip,
  ApexGrid,
  ApexNonAxisChartSeries,
  ApexResponsive
} from 'ng-apexcharts';
import { DashboardService } from '../dashboard.service';
import { DataDashBoard } from '../dashboard.model';
import { DateFilter } from '../../invoice/invoice.model';
import { SaleReportService } from '../../sale-report/sale-report.service';
import {WarehouseProductParcelService} from '../../warehouse-product-parcel/warehouse-product-parcel.service';
import {WarehouseProductParcelFilter} from '../../warehouse-product-parcel/warehouse-product-parcel.model';
import {Router} from '@angular/router';

export type ChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  dataLabels: ApexDataLabels;
  plotOptions: ApexPlotOptions;
  yaxis: ApexYAxis;
  xaxis: ApexXAxis;
  fill: ApexFill;
  tooltip: ApexTooltip;
  stroke: ApexStroke;
  legend: ApexLegend;
  grid: ApexGrid;
};


declare var require: any;

const data: any = require('./data.json');

export interface Chart {
  type: ChartType;
  data: Chartist.IChartistData;
  options?: any;
  responsiveOptions?: any;
  events?: ChartEvent;
}

@Component({
  selector: 'app-dashboard-main',
  templateUrl: './dashboard-main.component.html',
  styleUrls: ['./dashboard-main.component.css']
})
export class DashboardMainComponent implements OnInit {


  // Barchart
  @ViewChild('chart') chart: ChartComponent;
  public chartOptions: Partial<ChartOptions>;

  // @ViewChild('visitor-chart') chart2: ChartComponent;
  // public VisitorChartOptions: Partial<VisitorChartOptions>;
  //
  // @ViewChild('newsletter-chart') chart3: ChartComponent;
  // public newsletterchartOptions: Partial<newsletterchartOptions>;


  constructor(
    private serviceDashBoard: DashboardService,
    private parcelSer: WarehouseProductParcelService,
    private router: Router,
  ) {
    // super();
    this.chartOptions = {
      series: [
        {
          name: 'Pixel',
          data: [44, 55, 57, 56, 61, 58]
        },
        {
          name: 'Ample',
          data: [76, 85, 101, 98, 87, 105]
        }
      ],
      chart: {
        type: 'bar',
        height: 340
      },
      grid: {
        borderColor: 'rgba(0,0,0,.2)',
        strokeDashArray: 3,
      },
      plotOptions: {
        // bar: {
        //   horizontal: false,
        //   columnWidth: '30%',
        //   endingShape: 'flat'
        // },

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
        show: false,
      },
      fill: {
        colors: ['#26c6da', '#1e88e5'],
        opacity: 1
      },
      tooltip: {
        fillSeriesColor: false,
        marker: {
          show: false,
        },
      }
    };

  }

  public dataDashBoard: DataDashBoard;

  ngOnInit(): void {

    this.timeSelected = 'next_3_month';
    this.onTimeChange();
    this.initDashBoard();
    // throw new Error("Method not implemented.");
  }

  initDashBoard() {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    const first = new Date(year, month, 1);
    const date_from = new Date(this.convertDateYYYYMMDD(first));
    const date_to = new Date(this.convertDateYYYYMMDD(today));
    const from = this.convertDate(date_from, '-');
    const to = this.convertDate(date_to, '-');
    this.serviceDashBoard.getDataDashBoard(from, to).subscribe(res => {
      this.dataDashBoard = res;
    });

    this.serviceDashBoard.getDataBarChart(from, to).subscribe(res => {


      // @ts-ignore
      this.chartOptions = {
        series: [
          {
            name: 'Bán hàng',
            data: res['BanHang']
          },
          {
            name: 'Nhập hàng',
            data: res['NhapHang']
          }
        ],
        chart: {
          type: 'bar',
          height: 340
        },
        grid: {
          borderColor: 'rgba(0,0,0,.2)',
          strokeDashArray: 3,
        },
        plotOptions: {
          // bar: {
          //   horizontal: false,
          //   columnWidth: '30%',
          //   endingShape: 'flat'
          // },

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
          categories: res['date']
        },

        legend: {
          show: false,
        },
        fill: {
          colors: ['#26c6da', '#1e88e5'],
          opacity: 1
        },
        // tooltip: ApexTooltip,
        tooltip: {
          fillSeriesColor: false,
          marker: {
            show: false,
          },
        }
      };


      // this.barChartData = [
      //   {data: res['BanHang'], label: 'Bán hàng'},
      //   {data: res['NhapHang'], label: 'Nhập hàng'}
      // ];
      // this.barChartLabels = res['date'];
    });

  }

  convertDateYYYYMMDD(date: Date) {
    const month = date.getMonth() + 1;
    return date.getFullYear() + '-' + month + '-' + date.getDate();
  }

  convertDate(date: Date, _alia = '/') {
    const month = date.getMonth() + 1;
    return date.getDate() + _alia + month + _alia + date.getFullYear();
  }


  // bar chart
  public barChartData: Array<any> = [
    {data: [1.1, 1.4, 1.1, 0.9, 1.9, 1, 0.3, 1.1, 1.4, 1.1, 0.9, 1.9], label: 'Cost'}
  ];
  public barChartLabels: Array<any> = [
    '1',
    '2',
    '3',
    '4',
    '5',
    '6',
    '7',
    '8',
    '9',
    '10',
    '11',
    '12'
  ];
  public barChartOptions: any = {
    maintainAspectRatio: false,
    legend: {
      display: false
    },
    tooltips: {
      enabled: false
    },

    scales: {

      xAxes: [{
        display: false,
        datasets: [{
          barPercentage: 0.3,
          categoryPercentage: 0.7
        }]
      }],
      yAxes: [{
        display: false
      }]
    }

  };
  public barChartColors: Array<any> = [
    {
      backgroundColor: 'rgba(255, 255, 255, 0.5)',
      hoverBackgroundColor: 'rgba(255, 255, 255, 0.5)',
      hoverBorderWidth: 2,
      hoverBorderColor: 'rgba(255, 255, 255, 0.5)'
    }
  ];
  public barChartLegend = false;
  public barChartType = 'bar';
  public alertExpiredCount = 100;
  public timeSelected = 'next_3_month';
  public timeSelects = [
    'today',
    'this_week',
    'this_month',
    'next_30_day',
    'next_2_month',
    'next_3_month',
    'next_6_month',
    'next_year',
  ];
  public timeLabels = {
    'today': 'hôm nay',
    'this_week': 'tuần này',
    'this_month': 'tháng này',
    'next_30_day': '30 ngày tới',
    'next_2_month': '2 tháng tới',
    'next_3_month': '3 tháng tới',
    'next_6_month': '6 tháng tới',
    'next_year': '1 năm',
  };

  onTimeChange() {
    const apiFilter = new WarehouseProductParcelFilter();
    apiFilter.timeSelect = this.timeSelected;

    this.parcelSer.getSummaryExpiration(apiFilter).subscribe(res => {
      this.alertExpiredCount = res.body;
    });
  }

  goToExpireReport() {
    if (this.alertExpiredCount > 0) {
      this.router.navigateByUrl('/report/product-report/expiration-date?WarehouseProductParcelSearch[timeSelect]=' + this.timeSelected);
    }
  }

}
