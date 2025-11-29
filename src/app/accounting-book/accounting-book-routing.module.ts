import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { StockDetailComponent } from './stock-detail/stock-detail.component';
import { CashBookComponent } from './cash-book/cash-book.component';
import { BankBookComponent } from './bank-book/bank-book.component';

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
