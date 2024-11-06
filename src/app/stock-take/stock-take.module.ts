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
import { StockTakeListComponent } from './stock-take-list/stock-take-list.component';
import { StockTakeRoutes } from './stock-take.routing';
import { StockTakeCreateComponent } from './stock-take-create/stock-take-create.component';
import { StockTakeBalanceDialogComponent } from './stock-take-balance-dialog/stock-take-balance-dialog.component';
import { StockTakeInfoTabComponent } from './stock-take-info-tab/stock-take-info-tab.component';
import { DatetimeChooseFilterDialogComponent } from './datetime-choose-filter-dialog/datetime-choose-filter-dialog.component';
import { DatetimeDefaultFilterDialogComponent } from './datetime-default-filter-dialog/datetime-default-filter-dialog.component';
import {InputSelectAllModule} from '../common/input-select-all/input-select-all.module';
import { SharedModule } from '../shared/shared.module';


@NgModule({
  declarations: [StockTakeListComponent, StockTakeCreateComponent, StockTakeBalanceDialogComponent, StockTakeInfoTabComponent, DatetimeChooseFilterDialogComponent, DatetimeDefaultFilterDialogComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(StockTakeRoutes),
    FormsModule,
    ReactiveFormsModule,
    FlexLayoutModule,
    QuillModule.forRoot(),
    DragulaModule.forRoot(),
    PerfectScrollbarModule,
    Ng2SearchPipeModule,
    DemoMaterialModule,
    InputSelectAllModule,
    SharedModule,
  ],
})
export class StockTakeModule { }
