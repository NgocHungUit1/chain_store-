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
import { WarehouseCreateComponent } from './warehouse-create/warehouse-create.component';
import { WarehouseUpdateComponent } from './warehouse-update/warehouse-update.component';
import {WarehouseListComponent} from './warehouse-list/warehouse-list.component';


@NgModule({
  declarations: [
    WarehouseListComponent,
    WarehouseCreateComponent,
    WarehouseUpdateComponent],
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
  ]
})
export class WarehouseModule { }
