import { NgModule } from '@angular/core';
import { QuillModule } from 'ngx-quill';
import { DragulaModule } from 'ng2-dragula';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { Ng2SearchPipeModule } from 'ng2-search-filter';
import { RouterModule } from '@angular/router';
import { ProductListComponent } from './product-list/product-list.component';
import { ProductRoutes } from './product.routing';
import { ProductMedicineDialogComponent } from './product-medicine-dialog/product-medicine-dialog.component';
import { DemoMaterialModule } from '../demo-material-module';
import { ProductGroupFormDialogComponent } from './product-group-form-dialog/product-group-form-dialog.component';
import { ProductUsingFormDialogComponent } from './product-using-form-dialog/product-using-form-dialog.component';
import { ProductPlacementFormDialogComponent } from './product-placement-form-dialog/product-placement-form-dialog.component';
import { ProductTabInfoComponent } from './product-tab-info/product-tab-info.component';
import { ProductTabStockChangeComponent } from './product-tab-stock-change/product-tab-stock-change.component';
import { ProductTabStockComponent } from './product-tab-stock/product-tab-stock.component';
import { AngularImageViewerModule } from 'angular-x-image-viewer';
import { ProductMerchandiseFormDialogComponent } from './product-merchandise-form-dialog/product-merchandise-form-dialog.component';
import { ProductManufacturerFormDialogComponent } from './product-manufacturer-form-dialog/product-manufacturer-form-dialog.component';
import { ProductPopupDeleteDialogComponent } from './product-popup-delete-dialog/product-popup-delete-dialog.component';
import { ProductUploadDialogComponent } from './product-upload-dialog/product-upload-dialog.component';
import { ProductStockChangeDialogComponent } from './product-stock-change-dialog/product-stock-change-dialog.component';

@NgModule({
  declarations: [
    ProductListComponent,
    ProductMedicineDialogComponent,
    ProductGroupFormDialogComponent,
    ProductUsingFormDialogComponent,
    ProductPlacementFormDialogComponent,
    ProductTabInfoComponent,
    ProductTabStockChangeComponent,
    ProductTabStockComponent,
    ProductMerchandiseFormDialogComponent,
    ProductManufacturerFormDialogComponent,
    ProductPopupDeleteDialogComponent,
    ProductUploadDialogComponent,
    ProductStockChangeDialogComponent
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
    DemoMaterialModule,
    AngularImageViewerModule
  ],
  entryComponents: [
    ProductMedicineDialogComponent,
    ProductGroupFormDialogComponent,
    ProductUsingFormDialogComponent,
    ProductPlacementFormDialogComponent,
    ProductUploadDialogComponent
  ]
})
export class ProductModule {
}
