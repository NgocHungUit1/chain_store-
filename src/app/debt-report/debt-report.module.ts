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
import { DebtReportMainComponent } from './debt-report-main/debt-report-main.component';
import {DebtReportRoutes} from './debt-report.routing';


@NgModule({
  declarations: [DebtReportMainComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(DebtReportRoutes),
    FormsModule,
    ReactiveFormsModule,
    FlexLayoutModule,
    QuillModule.forRoot(),
    DragulaModule.forRoot(),
    PerfectScrollbarModule,
    Ng2SearchPipeModule,
    DemoMaterialModule,
    ChartsModule
  ]
})
export class DebtReportModule { }
