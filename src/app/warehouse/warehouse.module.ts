import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
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


@NgModule({
  declarations: [
    WarehouseListComponent,
    WarehouseImportFormComponent,
    WarehouseInfoTabComponent,
    WarehouseReturnListComponent,
    WarehouseReturnFormComponent,
    WarehouseParcelFormDialogComponent
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
    DemoMaterialModule
  ],
  entryComponents: [
    WarehouseParcelFormDialogComponent
  ]
})
export class WarehouseModule { }
