import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DoctorListComponent } from './doctor-list/doctor-list.component';
import { DoctorFormDialogComponent } from './doctor-form-dialog/doctor-form-dialog.component';
import { DoctorTabInfoComponent } from './doctor-tab-info/doctor-tab-info.component';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';
import { QuillModule } from 'ngx-quill';
import { DragulaModule } from 'ng2-dragula';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { Ng2SearchPipeModule } from 'ng2-search-filter';
import { DemoMaterialModule } from '../demo-material-module';
import { DoctorRoutes } from './doctor.routing';
import { DatetimeChooseFilterDialogComponent } from './datetime-choose-filter-dialog/datetime-choose-filter-dialog.component';
import { DatetimeDefaultFilterDialogComponent } from './datetime-default-filter-dialog/datetime-default-filter-dialog.component';


@NgModule({
  declarations: [
    DoctorListComponent,
    DoctorFormDialogComponent,
    DoctorTabInfoComponent,
    DatetimeDefaultFilterDialogComponent,
    DatetimeChooseFilterDialogComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(DoctorRoutes),
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
export class DoctorModule {
}
