// import 'hammerjs';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { DemoMaterialModule } from '../demo-material-module';
import { FlexLayoutModule } from '@angular/flex-layout';
import { DashboardsRoutes } from './dashboards.routing';
import { ChartistModule } from 'ng-chartist';
import { ChartsModule } from 'ng2-charts';
import { NgApexchartsModule } from 'ng-apexcharts';

import { Dashboard1Component } from './dashboard1/dashboard1.component';
import { Dashboard2Component } from './dashboard2/dashboard2.component';
import { DashboardMainComponent } from './dashboard-main/dashboard-main.component';
import {FormsModule} from '@angular/forms';
import { Dashboard3Component } from './dashboard3/dashboard3.component';
@NgModule({
  imports: [
    CommonModule,
    DemoMaterialModule,
    FlexLayoutModule,
    ChartistModule,
    ChartsModule,
    NgApexchartsModule,
    RouterModule.forChild(DashboardsRoutes),
    FormsModule
  ],
    declarations: [Dashboard1Component, Dashboard2Component, DashboardMainComponent, Dashboard3Component]
})
export class DashboardsModule { }
