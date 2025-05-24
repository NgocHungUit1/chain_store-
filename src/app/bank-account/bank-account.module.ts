import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';
import { QuillModule } from 'ngx-quill';
import { DragulaModule } from 'ng2-dragula';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { Ng2SearchPipeModule } from 'ng2-search-filter';
import { DemoMaterialModule } from '../demo-material-module';
import { BankAccountRoutes } from './bank-account.routing';
import {BankAccountListComponent} from './bank-account-list/bank-account-list.component';
import {BankAccountFormDialogComponent} from './bank-account-form-dialog/bank-account-form-dialog.component';
import {BankAccountTabInfoComponent} from './bank-account-tab-info/bank-account-tab-info.component';


@NgModule({
  declarations: [
    BankAccountListComponent,
    BankAccountFormDialogComponent,
    BankAccountTabInfoComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(BankAccountRoutes),
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
export class BankAccountModule {
}
