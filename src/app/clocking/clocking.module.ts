import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {RouterModule} from '@angular/router';
import {ClockingRoutes} from './clocking.routing';
import { ClockingFormDialogComponent } from './clocking-form-dialog/clocking-form-dialog.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {FlexLayoutModule} from '@angular/flex-layout';
import {QuillModule} from 'ngx-quill';
import {DragulaModule} from 'ng2-dragula';
import {PerfectScrollbarModule} from 'ngx-perfect-scrollbar';
import {Ng2SearchPipeModule} from 'ng2-search-filter';
import {DemoMaterialModule} from '../demo-material-module';
import { ClockingHistoryComponent } from './clocking-history/clocking-history.component';


@NgModule({
  declarations: [ClockingFormDialogComponent, ClockingHistoryComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(ClockingRoutes),
    ReactiveFormsModule,
    FormsModule,
    FlexLayoutModule,
    QuillModule.forRoot(),
    DragulaModule.forRoot(),
    PerfectScrollbarModule,
    Ng2SearchPipeModule,
    DemoMaterialModule,
  ]
})
export class ClockingModule { }
