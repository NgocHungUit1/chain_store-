import { NgModule } from '@angular/core';
import { QuillModule } from "ngx-quill";
import { DragulaModule } from "ng2-dragula";
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { FlexLayoutModule } from "@angular/flex-layout";
import { PerfectScrollbarModule } from "ngx-perfect-scrollbar";
import { Ng2SearchPipeModule } from "ng2-search-filter";
import { DemoMaterialModule } from "../demo-material-module";
import { AngularImageViewerModule } from "angular-x-image-viewer";

import { SaleMainComponent } from './sale-main/sale-main.component';
import { RouterModule } from '@angular/router';
import { SaleRoutes } from './sale.routing';


@NgModule({
  declarations: [SaleMainComponent],
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
    AngularImageViewerModule
  ]
})
export class SaleModule { }
