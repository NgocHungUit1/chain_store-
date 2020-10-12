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
import { SaleReportRoutes } from './sale-report.routing';
import { SaleReportMainComponent } from './sale-report-main/sale-report-main.component';
import { ChartsModule } from 'ng2-charts';


@NgModule({
  declarations: [SaleReportMainComponent],
    imports: [
        CommonModule,
        RouterModule.forChild(SaleReportRoutes),
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
export class SaleReportModule {
}
