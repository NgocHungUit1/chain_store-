import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExpensesOrderListComponent } from './expenses-order-list/expenses-order-list.component';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';
import { QuillModule } from 'ngx-quill';
import { DragulaModule } from 'ng2-dragula';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { Ng2SearchPipeModule } from 'ng2-search-filter';
import { DemoMaterialModule } from '../demo-material-module';
import { ExpensesOrderRoutes } from './expenses-order.routing';
import { ExpensesOrderFormDialogComponent } from './expenses-order-form-dialog/expenses-order-form-dialog.component';
import { ExpensesOrderTabInfoComponent } from './expenses-order-tab-info/expenses-order-tab-info.component';

@NgModule({
  declarations: [ExpensesOrderListComponent, ExpensesOrderFormDialogComponent, ExpensesOrderTabInfoComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(ExpensesOrderRoutes),
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
export class ExpensesOrderModule { }
