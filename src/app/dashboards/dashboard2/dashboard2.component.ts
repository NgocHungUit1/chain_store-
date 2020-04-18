import { Component, ViewChild, AfterViewInit } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { BreakpointObserver, Breakpoints, BreakpointState } from '@angular/cdk/layout';
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

declare var require: any;

const data: any = require('./data.json');

export interface Chart {
    type: ChartType;
    data: Chartist.IChartistData;
    options?: any;
    responsiveOptions?: any;
    events?: ChartEvent;
}

export interface Element {
    name: string;
    pic: string;
    email: string;
    designation: string;
}

const ELEMENT_DATA: Element[] = [
    {
        pic: 'assets/images/users/1.jpg',
        name: 'Nirav joshi',
        email: 'nirav@gmail.com',
        designation: 'Hacker'
    },
    {
        pic: 'assets/images/users/2.jpg',
        name: 'Sunil joshi',
        email: 'sunil@gmail.com',
        designation: 'Designer'
    },
    {
        pic: 'assets/images/users/3.jpg',
        name: 'John Deo',
        email: 'deo@gmail.com',
        designation: 'Developer'
    },
    {
        pic: 'assets/images/users/4.jpg',
        name: 'Beryllium Lon',
        email: 'lon@gmail.com',
        designation: 'Front end Developer'
    },
    {
        pic: 'assets/images/users/5.jpg',
        name: 'Boron son',
        email: 'son@gmail.com',
        designation: 'Hacker'
    },
    {
        pic: 'assets/images/users/6.jpg',
        name: 'Carbon hryt',
        email: 'carbon@gmail.com',
        designation: 'Senior Developer'
    },
    {
        pic: 'assets/images/users/7.jpg',
        name: 'Nitro oxur',
        email: 'nitro@gmail.com',
        designation: 'Junior Developer'
    },
    {
        pic: 'assets/images/users/1.jpg',
        name: 'Nirav joshi',
        email: 'nirav@gmail.com',
        designation: 'Hacker'
    },
    {
        pic: 'assets/images/users/2.jpg',
        name: 'Sunil joshi',
        email: 'sunil@gmail.com',
        designation: 'Designer'
    },
    {
        pic: 'assets/images/users/3.jpg',
        name: 'John Deo',
        email: 'deo@gmail.com',
        designation: 'Developer'
    },
    {
        pic: 'assets/images/users/4.jpg',
        name: 'Beryllium Lon',
        email: 'lon@gmail.com',
        designation: 'Front end Developer'
    },
    {
        pic: 'assets/images/users/5.jpg',
        name: 'Boron son',
        email: 'son@gmail.com',
        designation: 'Hacker'
    }
];

@Component({
    selector: 'app-dashboard2',
    templateUrl: './dashboard2.component.html',
    styleUrls: ['./dashboard2.component.scss']
})
export class Dashboard2Component implements AfterViewInit {

    @ViewChild('chart') chart: ChartComponent;
    public chartOptions: Partial<ChartOptions>;

    @ViewChild('visitor-chart') chart2: ChartComponent;
    public VisitorChartOptions: Partial<VisitorChartOptions>;

    // Barchart
    barChart1: Chart = {
        type: 'Bar',
        data: data['Bar'],
        options: {
            seriesBarDistance: 15,
            high: 12,
            height: 325,
            axisX: {
                showGrid: false,
                offset: 20
            },
            axisY: {
                showGrid: true,
                offset: 40
            }
        },
        responsiveOptions: [
            [
                'screen and (min-width: 640px)',
                {
                    axisX: {
                        labelInterpolationFnc: function (
                            value: number,
                            index: number
                        ): string {
                            return index % 1 === 0 ? `${value}` : null;
                        }
                    }
                }
            ]
        ]
    };

    // This is for the comments
    mycomments: Object[] = [
        {
            name: 'James Anderson',
            content:
                'Lorem Ipsum is simply dummy text of the printing and type setting industry.',
            profile: 'assets/images/users/1.jpg',
            status: 'Pending',
            class: 'info',
            date: 'April 14, 2016'
        },
        {
            name: 'Michael Jorden',
            content:
                'Lorem Ipsum is simply dummy text of the printing and type setting industry.',
            profile: 'assets/images/users/2.jpg',
            status: 'Approved',
            class: 'light-success',
            date: 'April 14, 2016'
        },
        {
            name: 'James Anderson',
            content:
                'Lorem Ipsum is simply dummy text of the printing and type setting industry.',
            profile: 'assets/images/users/3.jpg',
            status: 'Pending',
            class: 'danger',
            date: 'April 14, 2016'
        },
        {
            name: 'Johnathan Doeting',
            content:
                'Lorem Ipsum is simply dummy text of the printing and type setting industry.',
            profile: 'assets/images/users/1.jpg',
            status: 'Pending',
            class: 'info',
            date: 'April 14, 2016'
        }
    ];

    // This is for Mymessages
    mymessages: Object[] = [
        {
            useravatar: 'assets/images/users/1.jpg',
            status: 'online',
            from: 'Pavan kumar',
            subject: 'Just see the my admin!',
            time: '9:30 AM'
        },
        {
            useravatar: 'assets/images/users/2.jpg',
            status: 'busy',
            from: 'Sonu Nigam',
            subject: 'I have sung a song! See you at',
            time: '9:10 AM'
        },
        {
            useravatar: 'assets/images/users/3.jpg',
            status: 'away',
            from: 'Arijit Sinh',
            subject: 'I am a singer!',
            time: '9:08 AM'
        },
        {
            useravatar: 'assets/images/users/4.jpg',
            status: 'busy',
            from: 'Sonu Nigam',
            subject: 'I have sung a song! See you at',
            time: '9:10 AM'
        },
        {
            useravatar: 'assets/images/users/6.jpg',
            status: 'away',
            from: 'Arijit Sinh',
            subject: 'I am a singer!',
            time: '9:08 AM'
        },
        {
            useravatar: 'assets/images/users/7.jpg',
            status: 'busy',
            from: 'Sonu Nigam',
            subject: 'I have sung a song! See you at',
            time: '9:10 AM'
        },
        {
            useravatar: 'assets/images/users/8.jpg',
            status: 'away',
            from: 'Arijit Sinh',
            subject: 'I am a singer!',
            time: '9:08 AM'
        }
    ];
    // bar chart
    public barChartData: Array<any> = [
        { data: [1.1, 1.4, 1.1, 0.9, 1.9, 1, 0.3, 1.1, 1.4, 1.1, 0.9, 1.9, 1, 0.3, 1.1], label: 'Cost' }
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
        '12',
        '13',
        '14',
        '15'
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

    // This is for the table responsive
    constructor(breakpointObserver: BreakpointObserver) {
        breakpointObserver.observe(['(max-width: 600px)']).subscribe(result => {
            this.displayedColumns = result.matches ?
                ['name', 'email', 'designation'] :
                ['name', 'email', 'designation'];
        });

        this.VisitorChartOptions = {
            series: [45, 15, 27, 18],
            chart: {
                type: 'donut',
                height: 230
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

        this.chartOptions = {
            series: [
                {
                    name: 'Ample',
                    data: [9, 4, 11, 7, 10, 12]
                },
                {
                    name: 'Pixel',
                    data: [3, 2, 9, 5, 8, 10]
                }
            ],
            chart: {
                type: 'bar',
                height: 320
            },
            grid: {
                borderColor: 'rgba(0,0,0,.2)',
                strokeDashArray: 3,
            },
            plotOptions: {
                bar: {
                    horizontal: false,
                    columnWidth: '40%',
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
                    'Jul',
                    'Aug',
                    'Sep',
                    'Oct'
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
            }
        };
    }

    // tslint:disable-next-line:member-ordering
    displayedColumns = ['name', 'email', 'designation'];
    // tslint:disable-next-line:member-ordering
    dataSource = new MatTableDataSource<Element>(ELEMENT_DATA);
    // tslint:disable-next-line:member-ordering
    @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;

    ngAfterViewInit() {
        this.dataSource.paginator = this.paginator;
    }
}
