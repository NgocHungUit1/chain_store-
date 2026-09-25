import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';
import { RouterModule } from '@angular/router';
import { DemoMaterialModule } from '../demo-material-module';
import { SharedModule } from '../shared/shared.module';
import { CommonModule as DCommonModule } from '../common/common.module';

import { OpeningBalanceRoutes } from './opening-balance.routing';
import { OpeningBalanceListComponent } from './opening-balance-list/opening-balance-list.component';
import { OpeningBalanceFormComponent } from './opening-balance-form/opening-balance-form.component';
import { OpeningBalanceUploadDialogComponent } from './opening-balance-upload-dialog/opening-balance-upload-dialog.component';
import { DatetimeDefaultFilterDialogComponent } from './datetime-default-filter-dialog/datetime-default-filter-dialog.component';
import { DatetimeChooseFilterDialogComponent } from './datetime-choose-filter-dialog/datetime-choose-filter-dialog.component';
import { OpeningBalanceExportDialogComponent } from './opening-balance-export-dialog/opening-balance-export-dialog.component';

@NgModule({
  declarations: [
    OpeningBalanceListComponent,
    OpeningBalanceFormComponent,
    OpeningBalanceUploadDialogComponent,
    DatetimeDefaultFilterDialogComponent,
    DatetimeChooseFilterDialogComponent,
    OpeningBalanceExportDialogComponent,
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(OpeningBalanceRoutes),
    FormsModule,
    ReactiveFormsModule,
    FlexLayoutModule,
    DemoMaterialModule,
    SharedModule,
    DCommonModule,
  ],
  entryComponents: [
    OpeningBalanceUploadDialogComponent,
    DatetimeDefaultFilterDialogComponent,
    DatetimeChooseFilterDialogComponent,
    OpeningBalanceExportDialogComponent,
  ],
})
export class OpeningBalanceModule {
}
