import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {DragulaModule} from 'ng2-dragula';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {FlexLayoutModule} from '@angular/flex-layout';
import {RouterModule} from '@angular/router';
import {Ng2SearchPipeModule} from 'ng2-search-filter';
import {QuillModule} from 'ngx-quill';
import {DemoMaterialModule} from '../demo-material-module';
import {PerfectScrollbarModule} from 'ngx-perfect-scrollbar';
import {ChartsModule} from 'ng2-charts';
import {ReportMainComponent} from './report-main/report-main.component';
import {DebtCustomersRoutes} from './debt-customers.routing';


@NgModule({
  declarations: [
    ReportMainComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(DebtCustomersRoutes),
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
export class DebtCustomersModule {
}
