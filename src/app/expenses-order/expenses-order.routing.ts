import { Routes } from '@angular/router';
import { ExpensesOrderListComponent } from './expenses-order-list/expenses-order-list.component';

export const ExpensesOrderRoutes: Routes = [
  {
    path: '',
    children: [
      {
        path: '',
        component: ExpensesOrderListComponent
      },
    ]
  }
];
