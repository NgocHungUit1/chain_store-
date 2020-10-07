import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-sale-report-main',
  templateUrl: './sale-report-main.component.html',
  styleUrls: ['./sale-report-main.component.css']
})
export class SaleReportMainComponent implements OnInit {

  public barChartData: any[] = [
    { data: [65, 59, 80, 81, 56, 55, 40], label: 'Iphone 8' },
    { data: [28, 48, 40, 19, 86, 27, 90], label: 'Iphone X' }
  ];

  public barChartColors: Array<any> = [
    { backgroundColor: '#1976d2' },
    { backgroundColor: '#26dad2' }
  ];

  public barChartLabels: string[] = [
    '2011',
    '2012',
    '2013',
    '2014',
    '2015',
    '2016',
    '2017'
  ];

  // This is line chart
  // bar chart
  public barChartOptions: any = {
    scaleShowVerticalLines: false,
    responsive: true,
    barThickness: 10
  };
  public barChartType = 'bar';
  public barChartLegend = true;


  constructor() { }

  ngOnInit(): void {
  }

  // events
  public chartClicked(e: any): void {
    // console.log(e);
  }

  public chartHovered(e: any): void {
    // console.log(e);
  }

}
