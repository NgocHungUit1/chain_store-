import { Routes } from '@angular/router';
import { ExpensesTransactionListComponent } from './expenses-transaction-list/expenses-transaction-list.component';

export const ExpensesTransactionRoutes: Routes = [
  {
    path: '',
    children: [
      {
        path: '',
        component: ExpensesTransactionListComponent
      },
    ]
  }
];
