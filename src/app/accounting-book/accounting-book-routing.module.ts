import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { StockDetailComponent } from './stock-detail/stock-detail.component';
import { CashBookComponent } from './cash-book/cash-book.component';
import { BankBookComponent } from './bank-book/bank-book.component';
import { SaleRevenueBookComponent } from './sale-revenue-book/sale-revenue-book.component';
import { SaleRevenueBookS2aComponent } from './sale-revenue-book-s2a/sale-revenue-book-s2a.component';

const routes: Routes = [
  {
    path: 'stock-detail',
    component: StockDetailComponent
  },
  {
    path: 'cash-book',
    component: CashBookComponent
  },
  {
    path: 'bank-book',
    component: BankBookComponent
  },
  {
    path: 'sale-revenue-book',
    component: SaleRevenueBookComponent
  },
  {
    path: 'sale-revenue-book-s2a',
    component: SaleRevenueBookS2aComponent
  },
  {
    path: '',
    redirectTo: 'stock-detail',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AccountingBookRoutingModule { }
