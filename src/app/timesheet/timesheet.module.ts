import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {RouterModule} from '@angular/router';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {FlexLayoutModule} from '@angular/flex-layout';
import {QuillModule} from 'ngx-quill';
import {DragulaModule} from 'ng2-dragula';
import {Ng2SearchPipeModule} from 'ng2-search-filter';
import {DemoMaterialModule} from '../demo-material-module';
import {TimesheetRoutes} from './timesheet.routing';
import { TimesheetMainComponent } from './timesheet-main/timesheet-main.component';
import { TimesheetFormDialogComponent } from './timesheet-form-dialog/timesheet-form-dialog.component';
import {ShiftsModule} from '../shifts/shifts.module';
import {ClockingModule} from '../clocking/clocking.module';



@NgModule({
  declarations: [TimesheetMainComponent, TimesheetFormDialogComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(TimesheetRoutes),
    FormsModule,
    ReactiveFormsModule,
    FlexLayoutModule,
    QuillModule.forRoot(),
    DragulaModule.forRoot(),
    Ng2SearchPipeModule,
    DemoMaterialModule,
  ]
})
export class TimesheetModule { }
