import * as $ from 'jquery';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { AppRoutes } from './app.routing';
import { AppComponent } from './app.component';

import { FlexLayoutModule } from '@angular/flex-layout';
import { FullComponent } from './layouts/full/full.component';
import { CartComponent } from './layouts/cart/cart.component';
import { AppHeaderCartComponent } from './layouts/cart/header/header-cart.component';



import { AppBlankComponent } from './layouts/blank/blank.component';
import { AppHeaderComponent } from './layouts/full/header/header.component';
import { AppSidebarComponent } from './layouts/full/sidebar/sidebar.component';
import { AppBreadcrumbComponent } from './layouts/full/breadcrumb/breadcrumb.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { DemoMaterialModule } from './demo-material-module';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';

import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { PERFECT_SCROLLBAR_CONFIG } from 'ngx-perfect-scrollbar';
import { PerfectScrollbarConfigInterface } from 'ngx-perfect-scrollbar';

import { SharedModule } from './shared/shared.module';
import { SpinnerComponent } from './shared/spinner.component';
import { authTokenInterceptorProvider } from './authentication/auth-token.interceptor';
import { authInterceptorProvider } from './authentication/auth.interceptor';
import { NotifierModule } from 'angular-notifier';
import { OverlayContainer } from '@angular/cdk/overlay';
import { AngularImageViewerModule } from 'angular-x-image-viewer';
import { MAT_DATE_LOCALE } from '@angular/material/core';
import { MAT_MOMENT_DATE_ADAPTER_OPTIONS } from '@angular/material-moment-adapter';
import { PopupDeleteDialogComponent } from './common/popup-delete-dialog/popup-delete-dialog.component';
import { SearchProductDialogComponent } from './common/search-product-dialog/search-product-dialog.component';
import { SearchSupplierDialogComponent } from './common/search-supplier-dialog/search-supplier-dialog.component';
import { PopupConfirmDialogComponent } from './common/popup-confirm-dialog/popup-confirm-dialog.component';
import { GroupReportComponent } from './group/group-report/group-report.component';
import {TreeViewModule} from '@syncfusion/ej2-angular-navigations';
// import { InputSelectAllDirective } from './common/input-select-all/input-select-all.directive';
import { registerLicense } from '@syncfusion/ej2-base';
import { WarehouseParcelFormDialogNewComponent } from './warehouse/warehouse-parcel-form-dialog-new/warehouse-parcel-form-dialog-new.component';

// Registering Syncfusion license key
registerLicense('ORg4AjUWIQA/Gnt2V1hhQlJAfV5AQmBIYVp/TGpJfl96cVxMZVVBJAtUQF1hSn5UdkFjXXxccHNTRmZb');

const DEFAULT_PERFECT_SCROLLBAR_CONFIG: PerfectScrollbarConfigInterface = {
  suppressScrollX: true,
  wheelSpeed: 2,
  wheelPropagation: true
};

@NgModule({
  declarations: [
    AppComponent,
    FullComponent,
    CartComponent,
    AppHeaderComponent,
    SpinnerComponent,
    AppBlankComponent,
    AppSidebarComponent,
    AppBreadcrumbComponent,
    AppHeaderCartComponent,
    PopupDeleteDialogComponent,
    SearchProductDialogComponent,
    SearchSupplierDialogComponent,
    PopupConfirmDialogComponent,
    GroupReportComponent,
    WarehouseParcelFormDialogNewComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    DemoMaterialModule,
    FormsModule,
    FlexLayoutModule,
    HttpClientModule,
    PerfectScrollbarModule,
    SharedModule,
    RouterModule.forRoot(AppRoutes, {relativeLinkResolution: 'legacy'}),
    NgMultiSelectDropDownModule.forRoot(),
    NotifierModule.withConfig({
      position: {
        horizontal: {
          position: 'right',
          distance: 12
        },
        vertical: {
          position: 'top',
          distance: 12,
          gap: 10
        }
      },
      theme: 'material',
    }),
    AngularImageViewerModule,
    ReactiveFormsModule,
    TreeViewModule
  ],
  providers: [
    {
      provide: PERFECT_SCROLLBAR_CONFIG,
      useValue: DEFAULT_PERFECT_SCROLLBAR_CONFIG
    },
    authTokenInterceptorProvider,
    authInterceptorProvider,
    {provide: MAT_DATE_LOCALE, useValue: 'vi'}
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
  constructor(overlayContainer: OverlayContainer) {
    overlayContainer.getContainerElement().classList.add('green');
  }
}
