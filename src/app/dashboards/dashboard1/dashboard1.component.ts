import { Component, ViewChild } from '@angular/core';
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

export type VisitorChartOptions = {
    series: ApexNonAxisChartSeries;
    chart: ApexChart;
    responsive: ApexResponsive[];
    labels: any;
    tooltip: ApexTooltip;
    legend: ApexLegend;
    colors: string[];
    stroke: any;
    dataLabels: ApexDataLabels;
    plotOptions: ApexPlotOptions;
};

export type newsletterchartOptions = {
    series: ApexAxisChartSeries;
    chart: ApexChart;
    xaxis: ApexXAxis;
    stroke: any;
    tooltip: ApexTooltip;
    dataLabels: ApexDataLabels;
    legend: ApexLegend;
    colors: string[];
    markers: any;
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
    selector: 'app-dashboard',
    templateUrl: './dashboard1.component.html',
    styleUrls: ['./dashboard1.component.scss']
})
export class Dashboard1Component {
    // Barchart
    @ViewChild('chart') chart: ChartComponent;
    public chartOptions: Partial<ChartOptions>;

    @ViewChild('visitor-chart') chart2: ChartComponent;
    public VisitorChartOptions: Partial<VisitorChartOptions>;

    @ViewChild('newsletter-chart') chart3: ChartComponent;
    public newsletterchartOptions: Partial<newsletterchartOptions>;

    constructor() {
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
                bar: {
                    horizontal: false,
                    columnWidth: '30%',
                    endingShape: 'flat'
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
        this.VisitorChartOptions = {
            series: [45, 15, 27, 18],
            chart: {
                type: 'donut',
                height: 290
            },
            plotOptions: {
                pie: {
                    donut: {
                        size: '80px'
                    }
                }
            },
            tooltip: {
                fillSeriesColor: false,
            },
            dataLabels: {
                enabled: false,
            },
            stroke: {
                width: 0
            },
            legend: {
                show: false,
            },
            labels: ['Mobile', 'Tablet', 'Desktop', 'Other'],
            colors: ['#1e88e5', '#26c6da', '#745af2', '#eceff1'],
            responsive: [
                {
                    breakpoint: 480,
                    options: {
                        chart: {
                            width: 200
                        }
                    }
                }
            ]
        };
        this.newsletterchartOptions = {
            series: [
                {
                    name: 'Clicked',
                    data: [0, 5000, 15000, 8000, 15000, 9000, 30000, 0]
                },
                {
                    name: 'Sent',
                    data: [0, 3000, 5000, 2000, 8000, 1000, 5000, 0]
                }
            ],
            chart: {
                height: 290,
                type: 'area'
            },
            dataLabels: {
                enabled: false
            },
            markers: {
                size: 3,
            },
            stroke: {
                curve: 'smooth',
                width: '2'
            },
            colors: ['#26c6da', '#1e88e5'],
            legend: {
                show: false,
            },
            grid: {
                borderColor: 'rgba(0,0,0,.2)',
                strokeDashArray: 3,
                yaxis: {
                    lines: {
                        show: true
                    }
                },
                xaxis: {
                    lines: {
                        show: true
                    }
                },
            },
            xaxis: {
                type: 'category',
                categories: [
                    '1',
                    '2',
                    '3',
                    '4',
                    '5',
                    '6',
                    '7',
                    '8'
                ]
            },
            tooltip: {
                x: {
                    format: 'dd/MM/yy HH:mm'
                }
            }
        };
    }

    // This is for the line chart
    // Line chart
    lineChart1: Chart = {
        type: 'Line',
        data: data['LineWithArea'],
        options: {
            low: 0,
            height: 360,
            high: 35000,
            showArea: true,
            fullWidth: true
        }
    };

    // Timeline
    mytimelines: any[] = [
        {
            from: 'Nirav joshi',
            time: '(5 minute ago)',
            image: 'assets/images/users/1.jpg',
            attachment: 'assets/images/big/img2.jpg',
            content:
                'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer nec odio. Praesent libero.'
        },
        {
            from: 'Sunil joshi',
            time: '(3 minute ago)',
            image: 'assets/images/users/2.jpg',
            content:
                'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer nec odio. Praesent libero.',
            buttons: 'primary'
        },
        {
            from: 'Vishal Bhatt',
            time: '(1 minute ago)',
            image: 'assets/images/users/3.jpg',
            attachment: 'assets/images/big/img1.jpg',
            content:
                'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer nec odio. Praesent libero.'
        },
        {
            from: 'Dhiren Adesara',
            time: '(1 minute ago)',
            image: 'assets/images/users/4.jpg',
            content:
                'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer nec odio. Praesent libero.',
            buttons: 'warn'
        }
    ];

    // bar chart
    public barChartData: Array<any> = [
        { data: [1.1, 1.4, 1.1, 0.9, 1.9, 1, 0.3, 1.1, 1.4, 1.1, 0.9, 1.9], label: 'Cost' }
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
}
