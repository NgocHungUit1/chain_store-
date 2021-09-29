import { NgModule } from '@angular/core';
import { QuillModule } from 'ngx-quill';
import { DragulaModule } from 'ng2-dragula';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { Ng2SearchPipeModule } from 'ng2-search-filter';
import { RouterModule } from '@angular/router';
import { DemoMaterialModule } from '../demo-material-module';
import { CustomerRoutes } from './customer.routing';
import { CustomerListComponent } from './customer-list/customer-list.component';
import { CustomerFormDialogComponent } from './customer-form-dialog/customer-form-dialog.component';
import { CustomerTabInfoComponent } from './customer-tab-info/customer-tab-info.component';
import { CustomerTabDebtComponent } from './customer-tab-debt/customer-tab-debt.component';
import { CustomerPopupDeleteDialogComponent } from './customer-popup-delete-dialog/customer-popup-delete-dialog.component';
import {DatetimeChooseFilterDialogComponent} from './datetime-choose-filter-dialog/datetime-choose-filter-dialog.component';
import {DatetimeDefaultFilterDialogComponent} from './datetime-default-filter-dialog/datetime-default-filter-dialog.component';



@NgModule({
  declarations: [
    CustomerListComponent,
    CustomerFormDialogComponent,
    CustomerTabInfoComponent,
    CustomerTabDebtComponent,
    CustomerPopupDeleteDialogComponent,
    DatetimeDefaultFilterDialogComponent,
    DatetimeChooseFilterDialogComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(CustomerRoutes),
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
export class CustomerModule { }
