import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CashFlowListComponent } from './cash-flow-list/cash-flow-list.component';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';
import { QuillModule } from 'ngx-quill';
import { DragulaModule } from 'ng2-dragula';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { Ng2SearchPipeModule } from 'ng2-search-filter';
import { DemoMaterialModule } from '../demo-material-module';
import { CashFlowRoutes } from './cash-flow.routing';



@NgModule({
  declarations: [
    CashFlowListComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(CashFlowRoutes),
    FormsModule,
    ReactiveFormsModule,
    FlexLayoutModule,
    QuillModule.forRoot(),
    DragulaModule.forRoot(),
    PerfectScrollbarModule,
    Ng2SearchPipeModule,
    DemoMaterialModule
  ]
})
export class CashFlowModule { }
