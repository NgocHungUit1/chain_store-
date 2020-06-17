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
import {WarehouseListComponent} from './warehouse-list/warehouse-list.component';
import {WarehouseTabInfoComponent} from './warehouse-tab-info/warehouse-tab-info.component';


@NgModule({
  declarations: [
    WarehouseListComponent,
    WarehouseCreateComponent,
    WarehouseTabInfoComponent
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
  ]
})
export class WarehouseModule { }
