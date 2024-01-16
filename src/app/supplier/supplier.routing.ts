import { Routes } from '@angular/router';
import { SupplierListComponent } from './supplier-list/supplier-list.component';

export const SupplierRoutes: Routes = [
  {
    path: '',
    component: SupplierListComponent,
    children: [
      {
        path: 'expenses-order',
        loadChildren: () => import('../expenses-order/expenses-order.module').then(m => m.ExpensesOrderModule)
      },
      {
        path: 'expenses-transaction',
        loadChildren: () => import('../expenses-transaction/expenses-transaction.module').then(m => m.ExpensesTransactionModule)
      },
      {
        path: 'support',
        loadChildren: () => import('../support/support.module').then(m => m.SupportModule)
      },
    ]
  }
];
