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
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';

import { Dashboard1Component } from './dashboard1/dashboard1.component';
import { Dashboard2Component } from './dashboard2/dashboard2.component';
import { DashboardMainComponent } from './dashboard-main/dashboard-main.component';
import { Dashboard3Component } from './dashboard3/dashboard3.component';
import { EInvoiceModalComponent } from './components/e-invoice-modal/e-invoice-modal.component';
import { EInvoiceRegisterModalComponent } from './components/e-invoice-register-modal/e-invoice-register-modal.component';

@NgModule({
  imports: [
    CommonModule,
    DemoMaterialModule,
    FlexLayoutModule,
    ChartistModule,
    ChartsModule,
    NgApexchartsModule,
    RouterModule.forChild(DashboardsRoutes),
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatCheckboxModule,
    FormsModule,
    MatInputModule,
    MatFormFieldModule
  ],
    declarations: [Dashboard1Component, Dashboard2Component, DashboardMainComponent, Dashboard3Component, EInvoiceModalComponent, EInvoiceRegisterModalComponent]
})
export class DashboardsModule { }
