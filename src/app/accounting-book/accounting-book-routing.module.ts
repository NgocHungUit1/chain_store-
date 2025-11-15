import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { StockDetailComponent } from './stock-detail/stock-detail.component';

const routes: Routes = [
  {
    path: 'stock-detail',
    component: StockDetailComponent
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
