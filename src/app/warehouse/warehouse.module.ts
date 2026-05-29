import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {DragulaModule} from 'ng2-dragula';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {FlexLayoutModule} from '@angular/flex-layout';
import {RouterModule} from '@angular/router';
import {Ng2SearchPipeModule} from 'ng2-search-filter';
import {QuillModule} from 'ngx-quill';
import {DemoMaterialModule} from '../demo-material-module';
import {PerfectScrollbarModule} from 'ngx-perfect-scrollbar';
import {WarehouseRoutes} from './warehouse.routing';
import {WarehouseListComponent} from './warehouse-list/warehouse-list.component';
import {WarehouseReturnListComponent} from './warehouse-return-list/warehouse-return-list.component';
import {WarehouseReturnFormComponent} from './warehouse-return-form/warehouse-return-form.component';
import {WarehouseImportFormComponent} from './warehouse-import-form/warehouse-import-form.component';
import {WarehouseInfoTabComponent} from './warehouse-info-tab/warehouse-info-tab.component';
import {WarehouseParcelFormDialogComponent} from './warehouse-parcel-form-dialog/warehouse-parcel-form-dialog.component';
import {WarehouseDiscountDialogComponent} from './warehouse-discount-dialog/warehouse-discount-dialog.component';
import {WarehouseUploadDialogComponent} from './warehouse-upload-dialog/warehouse-upload-dialog.component';
import {WarehouseExpensesComponent} from './warehouse-expenses/warehouse-expenses.component';
import {ShowValueExpensesPipe} from './warehouse.pipe';
import {WarehouseParcelListDialogComponent} from './warehouse-parcel-list-dialog/warehouse-parcel-list-dialog.component';
import {WarehouseProductMedicineDialogComponent} from './warehouse-product-medicine-dialog/warehouse-product-medicine-dialog.component';
import {WarehouseFormPriceDialogComponent} from './warehouse-form-price-dialog/warehouse-form-price-dialog.component';
import {InputSelectAllModule} from '../common/input-select-all/input-select-all.module';
import {CommonModule as DComonModule} from '../common/common.module';
import { WarehouseUnitCreateDialogComponent } from './warehouse-unit-create-dialog/warehouse-unit-create-dialog.component';
import { SharedModule } from '../shared/shared.module';
import {WarehouseFormAmountComponent} from './warehouse-form-amount/warehouse-form-amount.component';
import { WarehouseParcelFormDialogAvailableComponent } from './warehouse-parcel-form-dialog-available/warehouse-parcel-form-dialog-available.component';
import { WarehouseParcelFormDialogSelectComponent } from './warehouse-parcel-form-dialog-select/warehouse-parcel-form-dialog-select.component';
import {ClickOutsideDirective} from "./warehouse-import-form/click-outside.directive";
import { EInvoiceComponent } from './e-invoice/e-invoice.component';
import { EInvoiceService } from './e-invoice/e-invoice.service';
import { HttpClientModule } from '@angular/common/http';
import { RegisterDialogComponent } from './e-invoice/register-dialog/register-dialog.component';
import { SyncDialogComponent } from './e-invoice/sync-dialog/sync-dialog.component';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { LoadDialogComponent } from './e-invoice/load-dialog/load-dialog.component';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { InvoiceDetailDialogComponent } from './e-invoice/invoice-detail-dialog.component';
import { NgxMaskModule } from 'ngx-mask';
import { NgxExtendedPdfViewerModule } from 'ngx-extended-pdf-viewer';
import { PrintMultipleProductDialogComponent } from '../product/print-multiple-product-dialog/print-multiple-product-dialog.component';
import { IdCodeFormDialogComponent } from '../product/id-code-form-dialog/id-code-form-dialog.component';
import { ViewIdCodeFormDialogComponent } from '../product/view-id-code-form-dialog/view-id-code-form-dialog.component';

@NgModule({
  declarations: [
    WarehouseListComponent,
    WarehouseImportFormComponent,
    WarehouseInfoTabComponent,
    WarehouseReturnListComponent,
    WarehouseReturnFormComponent,
    WarehouseParcelFormDialogComponent,
    WarehouseDiscountDialogComponent,
    WarehouseUploadDialogComponent,
    WarehouseExpensesComponent,
    ShowValueExpensesPipe,
    WarehouseParcelListDialogComponent,
    WarehouseProductMedicineDialogComponent,
    WarehouseFormPriceDialogComponent,
    WarehouseFormAmountComponent,
    WarehouseUnitCreateDialogComponent,
    WarehouseParcelFormDialogAvailableComponent,
    WarehouseParcelFormDialogSelectComponent,
    ClickOutsideDirective,
    EInvoiceComponent,
    RegisterDialogComponent,
    SyncDialogComponent,
    LoadDialogComponent,
    InvoiceDetailDialogComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(WarehouseRoutes),
    FormsModule,
    ReactiveFormsModule,
    FlexLayoutModule,
    QuillModule.forRoot(),
    DragulaModule.forRoot(),
    PerfectScrollbarModule,
    Ng2SearchPipeModule,
    DemoMaterialModule,
    InputSelectAllModule,
    DComonModule,
    NgxExtendedPdfViewerModule,
    SharedModule,
    HttpClientModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatDialogModule,
    MatIconModule,
    MatButtonModule,
    MatToolbarModule,
    MatTableModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
    NgxMaskModule.forRoot({
      validation: true,
      thousandSeparator: ',',
      decimalMarker: '.',
      dropSpecialCharacters: false
    }),
  ],
  entryComponents: [
    WarehouseParcelFormDialogComponent,
    RegisterDialogComponent,
    SyncDialogComponent,
    LoadDialogComponent,
    InvoiceDetailDialogComponent,
    PrintMultipleProductDialogComponent,
    IdCodeFormDialogComponent,
    ViewIdCodeFormDialogComponent,
  ]
})
export class WarehouseModule {}
