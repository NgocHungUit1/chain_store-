import {NgModule} from '@angular/core';
import {QuillModule} from 'ngx-quill';
import {DragulaModule} from 'ng2-dragula';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {FlexLayoutModule} from '@angular/flex-layout';
import {PerfectScrollbarModule} from 'ngx-perfect-scrollbar';
import {Ng2SearchPipeModule} from 'ng2-search-filter';
import {RouterModule} from '@angular/router';
import {DemoMaterialModule} from '../demo-material-module';
import {SupplierListComponent} from './supplier-list/supplier-list.component';
import {SupplierRoutes} from './supplier.routing';
import {SupplierFormDialogComponent} from './supplier-form-dialog/supplier-form-dialog.component';

@NgModule({
  declarations: [
    SupplierListComponent,
    SupplierFormDialogComponent
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
    SupplierFormDialogComponent
  ]
})
export class SupplierModule {
}
