import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EmployeeListComponent } from './employee-list/employee-list.component';
import {RouterModule} from '@angular/router';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {FlexLayoutModule} from '@angular/flex-layout';
import {QuillModule} from 'ngx-quill';
import {DragulaModule} from 'ng2-dragula';
import {PerfectScrollbarModule} from 'ngx-perfect-scrollbar';
import {Ng2SearchPipeModule} from 'ng2-search-filter';
import {DemoMaterialModule} from '../demo-material-module';
import {EmployeeRoutes} from './employee.routing';
import { EmployeeFormDialogComponent } from './employee-form-dialog/employee-form-dialog.component';
import { EmployeePopupDeleteDialogComponent } from './employee-popup-delete-dialog/employee-popup-delete-dialog.component';
import { EmployeeTabInfoComponent } from './employee-tab-info/employee-tab-info.component';
import { EmployeeTimeSheetListComponent } from './employee-time-sheet-list/employee-time-sheet-list.component';
import { EmployeeTimesheetPopupDeleteDialogComponent } from './employee-timesheet-popup-delete-dialog/employee-timesheet-popup-delete-dialog.component';
import { EmployeeTabSalaryComponent } from './employee-tab-salary/employee-tab-salary.component';
import { NgxMaskModule, IConfig } from 'ngx-mask';



@NgModule({
  declarations: [
    EmployeeListComponent,
    EmployeeFormDialogComponent,
    EmployeePopupDeleteDialogComponent,
    EmployeeTabInfoComponent,
    EmployeeTimeSheetListComponent,
    EmployeeTimesheetPopupDeleteDialogComponent,
    EmployeeTabSalaryComponent,
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(EmployeeRoutes),
    FormsModule,
    ReactiveFormsModule,
    FlexLayoutModule,
    QuillModule.forRoot(),
    DragulaModule.forRoot(),
    NgxMaskModule.forRoot(),
    PerfectScrollbarModule,
    Ng2SearchPipeModule,
    DemoMaterialModule
  ]
})
export class EmployeeModule { }
