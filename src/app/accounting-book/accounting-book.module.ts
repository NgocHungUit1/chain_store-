import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DemoMaterialModule } from '../demo-material-module';

import { AccountingBookRoutingModule } from './accounting-book-routing.module';
import { StockDetailComponent } from './stock-detail/stock-detail.component';
import { CashBookComponent } from './cash-book/cash-book.component';
import { BankBookComponent } from './bank-book/bank-book.component';
import { SaleRevenueBookComponent } from './sale-revenue-book/sale-revenue-book.component';
import { SaleRevenueBookS2aComponent } from './sale-revenue-book-s2a/sale-revenue-book-s2a.component';
import { ProductFilterDialogComponent } from './components/product-filter-dialog/product-filter-dialog.component';
import { ParcelFilterDialogComponent } from './components/parcel-filter-dialog/parcel-filter-dialog.component';
import { AccountingBookService } from './services/accounting-book.service';

@NgModule({
  declarations: [
    StockDetailComponent,
    CashBookComponent,
    BankBookComponent,
    SaleRevenueBookComponent,
    SaleRevenueBookS2aComponent,
    ProductFilterDialogComponent,
    ParcelFilterDialogComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    DemoMaterialModule,
    AccountingBookRoutingModule
  ],
  providers: [
    AccountingBookService
  ]
})
export class AccountingBookModule { }
