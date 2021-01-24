import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PaySheetListComponent } from './pay-sheet-list/pay-sheet-list.component';
import { PaySheetFormComponent } from './pay-sheet-form/pay-sheet-form.component';
import { PaySheetTabInfoComponent } from './pay-sheet-tab-info/pay-sheet-tab-info.component';
import {RouterModule} from '@angular/router';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {FlexLayoutModule} from '@angular/flex-layout';
import {QuillModule} from 'ngx-quill';
import {DragulaModule} from 'ng2-dragula';
import {Ng2SearchPipeModule} from 'ng2-search-filter';
import {DemoMaterialModule} from '../demo-material-module';
import {PaySheetRoutes} from './pay-sheet.routing';
import {PerfectScrollbarModule} from 'ngx-perfect-scrollbar';
import { PaySheetTabPaySlipComponent } from './pay-sheet-tab-pay-slip/pay-sheet-tab-pay-slip.component';
import { PaySheetTabHistoryPaySlipCompleteComponent } from './pay-sheet-tab-history-pay-slip-complete/pay-sheet-tab-history-pay-slip-complete.component';
import { PaySlipSalaryComponent } from './pay-slip-salary/pay-slip-salary.component';
import { NgxMaskModule, IConfig } from 'ngx-mask';
import { PaySheetFormDetailComponent } from './pay-sheet-form-detail/pay-sheet-form-detail.component';
import { PaySlipFormMainSalaryComponent } from './pay-slip-form-main-salary/pay-slip-form-main-salary.component';



@NgModule({
  declarations: [PaySheetListComponent, PaySheetFormComponent, PaySheetTabInfoComponent, PaySheetTabPaySlipComponent, PaySheetTabHistoryPaySlipCompleteComponent, PaySlipSalaryComponent, PaySheetFormDetailComponent, PaySlipFormMainSalaryComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(PaySheetRoutes),
    FormsModule,
    ReactiveFormsModule,
    FlexLayoutModule,
    QuillModule.forRoot(),
    DragulaModule.forRoot(),
    NgxMaskModule.forRoot(),
    PerfectScrollbarModule,
    Ng2SearchPipeModule,
    DemoMaterialModule
  ],
})
export class PaySheetModule { }
