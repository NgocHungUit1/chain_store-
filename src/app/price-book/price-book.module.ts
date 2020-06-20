import { NgModule } from '@angular/core';
import { QuillModule } from 'ngx-quill';
import { DragulaModule } from 'ng2-dragula';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { Ng2SearchPipeModule } from 'ng2-search-filter';
import { RouterModule } from '@angular/router';
import { PriceBookRoutes } from './price-book.routing';
import { DemoMaterialModule } from '../demo-material-module';
import { PriceBookListComponent } from './price-book-list/price-book-list.component';
import { CreatePriceListFormDialogComponent } from './create-price-list-form-dialog/create-price-list-form-dialog.component';
import { SetupCommonPriceDialogComponent } from './setup-common-price-dialog/setup-common-price-dialog.component';



@NgModule({
  declarations: [PriceBookListComponent, CreatePriceListFormDialogComponent, SetupCommonPriceDialogComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(PriceBookRoutes),
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
export class PriceBookModule { }
