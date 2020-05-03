import {NgModule} from '@angular/core';
import {QuillModule} from "ngx-quill";
import {DragulaModule} from "ng2-dragula";
import {CommonModule} from "@angular/common";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {FlexLayoutModule} from "@angular/flex-layout";
import {PerfectScrollbarModule} from "ngx-perfect-scrollbar";
import {Ng2SearchPipeModule} from "ng2-search-filter";
import {RouterModule} from "@angular/router";
import {DemoMaterialModule} from "../../../original_template/src/app/demo-material-module";
import {ProductListComponent} from "./product-list/product-list.component";
import {ProductRoutes} from "./product.routing";

@NgModule({
  declarations: [ProductListComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(ProductRoutes),
    DemoMaterialModule,
    FormsModule,
    ReactiveFormsModule,
    FlexLayoutModule,
    QuillModule.forRoot(),
    DragulaModule.forRoot(),
    PerfectScrollbarModule,
    Ng2SearchPipeModule
  ]
})
export class ProductModule {
}
