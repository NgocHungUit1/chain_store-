import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DragulaModule } from 'ng2-dragula';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';
import { RouterModule } from '@angular/router';
import { Ng2SearchPipeModule } from 'ng2-search-filter';
import { QuillModule } from 'ngx-quill';
import { DemoMaterialModule } from '../demo-material-module';
import { NationalPharmacyV2Module } from '../common/national-pharmacy-v2/national-pharmacy-v2.module';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { InvoiceRoutes } from './invoice.routing';
import { InvoiceListComponent } from './invoice-list/invoice-list.component';
import { InvoiceTabInfoComponent } from './invoice-tab-info/invoice-tab-info.component';
import { InvoiceTabPaymentComponent } from './invoice-tab-payment/invoice-tab-payment.component';
import { DatetimeDefaultFilterDialogComponent } from './datetime-default-filter-dialog/datetime-default-filter-dialog.component';
import { DatetimeChooseFilterDialogComponent } from './datetime-choose-filter-dialog/datetime-choose-filter-dialog.component';
import { InvoiceTabReturnsComponent } from './invoice-tab-returns/invoice-tab-returns.component';



@NgModule({
  declarations: [
    InvoiceListComponent,
    InvoiceTabInfoComponent,
    InvoiceTabPaymentComponent,
    DatetimeDefaultFilterDialogComponent,
    DatetimeChooseFilterDialogComponent,
    InvoiceTabReturnsComponent],
  imports: [
    CommonModule,
    // RouterModule.forChild(InvoiceRoutes),
    FormsModule,
    ReactiveFormsModule,
    FlexLayoutModule,
    QuillModule.forRoot(),
    DragulaModule.forRoot(),
    PerfectScrollbarModule,
    Ng2SearchPipeModule,
    DemoMaterialModule,
    NationalPharmacyV2Module,
  ]
})
export class InvoiceModule { }
