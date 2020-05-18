import {NgModule} from '@angular/core';
import {QuillModule} from "ngx-quill";
import {DragulaModule} from "ng2-dragula";
import {CommonModule} from "@angular/common";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {FlexLayoutModule} from "@angular/flex-layout";
import {PerfectScrollbarModule} from "ngx-perfect-scrollbar";
import {Ng2SearchPipeModule} from "ng2-search-filter";
import {RouterModule} from "@angular/router";
import {ProductListComponent} from "./product-list/product-list.component";
import {ProductRoutes} from "./product.routing";
import { ProductMedicineDialogComponent } from './product-medicine-dialog/product-medicine-dialog.component';
import {DemoMaterialModule} from "../demo-material-module";
import { ProductGroupFormDialogComponent } from './product-group-form-dialog/product-group-form-dialog.component';
import {ProductUsingFormDialogComponent} from "./product-using-form-dialog/product-using-form-dialog.component";
import {ProductPlacementFormDialogComponent} from "./product-placement-form-dialog/product-placement-form-dialog.component";

@NgModule({
  declarations: [
    ProductListComponent,
    ProductMedicineDialogComponent,
    ProductGroupFormDialogComponent,
    ProductUsingFormDialogComponent,
    ProductPlacementFormDialogComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(ProductRoutes),
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
    ProductMedicineDialogComponent,
    ProductGroupFormDialogComponent,
    ProductUsingFormDialogComponent,
    ProductPlacementFormDialogComponent
  ]
})
export class ProductModule {
}
