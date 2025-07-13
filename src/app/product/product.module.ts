import {NgModule} from '@angular/core';
import {QuillModule} from 'ngx-quill';
import {DragulaModule} from 'ng2-dragula';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {FlexLayoutModule} from '@angular/flex-layout';
import {PerfectScrollbarModule} from 'ngx-perfect-scrollbar';
import {Ng2SearchPipeModule} from 'ng2-search-filter';
import {RouterModule} from '@angular/router';
import {ProductListComponent} from './product-list/product-list.component';
import {ProductRoutes} from './product.routing';
import {ProductMedicineDialogComponent} from './product-medicine-dialog/product-medicine-dialog.component';
import {DemoMaterialModule} from '../demo-material-module';
import {ProductGroupFormDialogComponent} from './product-group-form-dialog/product-group-form-dialog.component';
import {ProductUsingFormDialogComponent} from './product-using-form-dialog/product-using-form-dialog.component';
import {ProductPlacementFormDialogComponent} from './product-placement-form-dialog/product-placement-form-dialog.component';
import {ProductTabInfoComponent} from './product-tab-info/product-tab-info.component';
import {ProductTabStockChangeComponent} from './product-tab-stock-change/product-tab-stock-change.component';
import {ProductTabStockComponent} from './product-tab-stock/product-tab-stock.component';
import {AngularImageViewerModule} from 'angular-x-image-viewer';
import {ProductMerchandiseFormDialogComponent} from './product-merchandise-form-dialog/product-merchandise-form-dialog.component';
import {ProductManufacturerFormDialogComponent} from './product-manufacturer-form-dialog/product-manufacturer-form-dialog.component';
import {ProductPopupDeleteDialogComponent} from './product-popup-delete-dialog/product-popup-delete-dialog.component';
import {ProductUploadDialogComponent} from './product-upload-dialog/product-upload-dialog.component';
import {ProductStockChangeDialogComponent} from './product-stock-change-dialog/product-stock-change-dialog.component';
import {IdCodeFormDialogComponent} from './id-code-form-dialog/id-code-form-dialog.component';
import {ViewIdCodeFormDialogComponent} from './view-id-code-form-dialog/view-id-code-form-dialog.component';
import {InputSelectAllModule} from '../common/input-select-all/input-select-all.module';
import {NgxMaskModule} from 'ngx-mask';
import {NgxExtendedPdfViewerModule} from 'ngx-extended-pdf-viewer';
import {PrintMultipleProductDialogComponent} from './print-multiple-product-dialog/print-multiple-product-dialog.component';
import {CommonModule as DComonModule} from '../common/common.module';
import {ProductTabStockParcelComponent} from './product-tab-stock-parcel/product-tab-stock-parcel.component';
import {
  WarehouseProductParcelChangeStockFormDialogComponent
} from '../warehouse-product-parcel/warehouse-product-parcel-change-stock-form-dialog/warehouse-product-parcel-change-stock-form-dialog.component';


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
    ProductTabStockParcelComponent,
    ProductMerchandiseFormDialogComponent,
    ProductManufacturerFormDialogComponent,
    ProductPopupDeleteDialogComponent,
    ProductUploadDialogComponent,
    ProductStockChangeDialogComponent,
    IdCodeFormDialogComponent,
    ViewIdCodeFormDialogComponent,
    PrintMultipleProductDialogComponent,
    WarehouseProductParcelChangeStockFormDialogComponent
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
    AngularImageViewerModule,
    InputSelectAllModule,
    NgxMaskModule.forRoot({
      validation: true,
      thousandSeparator: ',',
      decimalMarker: '.',
      dropSpecialCharacters: false
    }),
    NgxExtendedPdfViewerModule,
    DComonModule
  ],
  entryComponents: [
    ProductMedicineDialogComponent,
    ProductGroupFormDialogComponent,
    ProductUsingFormDialogComponent,
    ProductPlacementFormDialogComponent,
    ProductUploadDialogComponent,
    PrintMultipleProductDialogComponent,
    WarehouseProductParcelChangeStockFormDialogComponent
  ]
})
export class ProductModule {
}
