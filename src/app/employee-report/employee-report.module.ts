import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DragulaModule } from 'ng2-dragula';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';
import { RouterModule } from '@angular/router';
import { Ng2SearchPipeModule } from 'ng2-search-filter';
import { QuillModule } from 'ngx-quill';
import { DemoMaterialModule } from '../demo-material-module';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { ChartsModule } from 'ng2-charts';
import {EmployeeReportMainComponent} from './employee-report-main/employee-report-main.component';
import {EmployeeReportRoutes} from './employee-report.routing';
import {EmployeeReportRevenueTabComponent} from './employee-report-main/employee-report-revenue-tab/employee-report-revenue-tab.component';
import {EmployeeReportProfitTabComponent} from './employee-report-main/employee-report-profit-tab/employee-report-profit-tab.component';
import {
  EmployeeReportCommissionTabComponent
} from './employee-report-main/employee-report-commission-tab/employee-report-commission-tab.component';
import {
  EmployeeReportInvoiceListDialogComponent
} from './employee-report-invoice-list-dialog/employee-report-invoice-list-dialog.component';
import {
  EmployeeReportInvoiceProductListComponent
} from './employee-report-invoice-list-dialog/employee-report-invoice-product-list/employee-report-invoice-product-list.component';

@NgModule({
  declarations: [
    EmployeeReportMainComponent
    , EmployeeReportRevenueTabComponent
    , EmployeeReportProfitTabComponent
    , EmployeeReportCommissionTabComponent
    , EmployeeReportInvoiceListDialogComponent
    , EmployeeReportInvoiceProductListComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(EmployeeReportRoutes),
    FormsModule,
    ReactiveFormsModule,
    FlexLayoutModule,
    QuillModule.forRoot(),
    DragulaModule.forRoot(),
    PerfectScrollbarModule,
    Ng2SearchPipeModule,
    DemoMaterialModule,
    ChartsModule
  ],
  entryComponents: [
    EmployeeReportInvoiceListDialogComponent
  ]
})
export class EmployeeReportModule {
}
