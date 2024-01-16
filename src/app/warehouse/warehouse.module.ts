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
    WarehouseFormPriceDialogComponent
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
    DComonModule
  ],
  entryComponents: [
    WarehouseParcelFormDialogComponent
  ]
})
export class WarehouseModule {
}
