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
import { SupplierListComponent } from './supplier-list/supplier-list.component';
import { SupplierRoutes } from './supplier.routing';
import { SupplierFormDialogComponent } from './supplier-form-dialog/supplier-form-dialog.component';
import { SupplierTabInfoComponent } from './supplier-tab-info/supplier-tab-info.component';
import { SupplierTabDebtComponent } from './supplier-tab-debt/supplier-tab-debt.component';
import {SupplierUploadDialogComponent} from './supplier-upload-dialog/supplier-upload-dialog.component';

@NgModule({
  declarations: [
    SupplierListComponent,
    SupplierFormDialogComponent,
    SupplierTabInfoComponent,
    SupplierTabDebtComponent,
    SupplierUploadDialogComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(SupplierRoutes),
    FormsModule,
    ReactiveFormsModule,
    FlexLayoutModule,
    QuillModule.forRoot(),
    DragulaModule.forRoot(),
    PerfectScrollbarModule,
    Ng2SearchPipeModule,
    DemoMaterialModule
  ],
  entryComponents: [
    SupplierFormDialogComponent,
    SupplierUploadDialogComponent
  ]
})
export class SupplierModule {
}
