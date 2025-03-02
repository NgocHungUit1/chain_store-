import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { QuillModule } from 'ngx-quill';
import { DragulaModule } from 'ng2-dragula';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { Ng2SearchPipeModule } from 'ng2-search-filter';
import { DemoMaterialModule } from '../demo-material-module';
import { AngularImageViewerModule } from 'angular-x-image-viewer';

import { SaleMainComponent } from './sale-main/sale-main.component';
import { RouterModule } from '@angular/router';
import { SaleRoutes } from './sale.routing';
import { SaleListProductComponent } from './sale-list-product/sale-list-product.component';
import { SaleSiderbarOrderComponent } from './sale-siderbar-order/sale-siderbar-order.component';
import { DiscountSiderbarDialogComponent } from './discount-siderbar-dialog/discount-siderbar-dialog.component';
import { PaymentSiderbarDialogComponent } from './payment-siderbar-dialog/payment-siderbar-dialog.component';
import { NoteDetailOrderDialogComponent } from './note-detail-order-dialog/note-detail-order-dialog.component';
import { PriceDetailOrderDialogComponent } from './price-detail-order-dialog/price-detail-order-dialog.component';
import { SaleCustomerFormDialogComponent } from './sale-customer-form-dialog/sale-customer-form-dialog.component';
import { ShowPricePipe, TotalPricePipe } from './cart.pipe';
import { SaleExpensesDialogComponent } from './sale-expenses-dialog/sale-expenses-dialog.component';
import { PrescriptionFormDialogComponent } from './prescription-form-dialog/prescription-form-dialog.component';
import { MedicalFacilityFormDialogComponent } from './medical-facility-form-dialog/medical-facility-form-dialog.component';
import {InputSelectAllModule} from '../common/input-select-all/input-select-all.module';
import { SaleProductParcelSelectDialogComponent } from './sale-product-parcel-select-dialog/sale-product-parcel-select-dialog.component';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { PaymentModule } from '../payment/payment.module';
import { BankAccountDialogComponent } from './bank-account-dialog/bank-account-dialog.component';

@NgModule({
  declarations: [
    SaleMainComponent,
    SaleListProductComponent,
    SaleSiderbarOrderComponent,
    DiscountSiderbarDialogComponent,
    PaymentSiderbarDialogComponent,
    NoteDetailOrderDialogComponent,
    PriceDetailOrderDialogComponent,
    SaleCustomerFormDialogComponent,
    ShowPricePipe,
    TotalPricePipe,
    SaleExpensesDialogComponent,
    PrescriptionFormDialogComponent,
    MedicalFacilityFormDialogComponent,
    SaleProductParcelSelectDialogComponent,
    BankAccountDialogComponent],
    imports: [
        CommonModule,
        RouterModule.forChild(SaleRoutes),
        FormsModule,
        ReactiveFormsModule,
        FlexLayoutModule,
        QuillModule.forRoot(),
        DragulaModule.forRoot(),
        PerfectScrollbarModule,
        Ng2SearchPipeModule,
        DemoMaterialModule,
        AngularImageViewerModule,
        InputSelectAllModule,
        MatDatepickerModule,
    ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class SaleModule {
}
