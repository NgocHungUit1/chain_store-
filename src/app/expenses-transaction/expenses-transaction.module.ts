import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExpensesTransactionListComponent } from './expenses-transaction-list/expenses-transaction-list.component';
import { ExpensesTransactionFormDialogComponent } from './expenses-transaction-form-dialog/expenses-transaction-form-dialog.component';
import { ExpensesTransactionTabInfoComponent } from './expenses-transaction-tab-info/expenses-transaction-tab-info.component';
import { RouterModule } from '@angular/router';
import { ExpensesOrderRoutes } from '../expenses-order/expenses-order.routing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';
import { QuillModule } from 'ngx-quill';
import { DragulaModule } from 'ng2-dragula';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { Ng2SearchPipeModule } from 'ng2-search-filter';
import { DemoMaterialModule } from '../demo-material-module';
import { ExpensesTransactionRoutes } from './expenses-transaction.routing';



@NgModule({
  declarations: [ExpensesTransactionListComponent, ExpensesTransactionFormDialogComponent, ExpensesTransactionTabInfoComponent],
  imports: [
    CommonModule,
    CommonModule,
    RouterModule.forChild(ExpensesTransactionRoutes),
    FormsModule,
    ReactiveFormsModule,
    FlexLayoutModule,
    QuillModule.forRoot(),
    DragulaModule.forRoot(),
    PerfectScrollbarModule,
    Ng2SearchPipeModule,
    DemoMaterialModule,
  ]
})
export class ExpensesTransactionModule { }
