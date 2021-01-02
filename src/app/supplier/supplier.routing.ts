import { Routes } from '@angular/router';
import { SupplierListComponent } from './supplier-list/supplier-list.component';

export const SupplierRoutes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'supplier',
        component: SupplierListComponent
      },
      {
        path: 'customer',
        loadChildren: () => import('../customer/customer.module').then(m => m.CustomerModule)
      },
      {
        path: 'employee',
        loadChildren: () => import('../employee/employee.module').then(m => m.EmployeeModule)
      },
      {
        path: 'user',
        loadChildren: () => import('../user/user.module').then(m => m.UserModule)
      },
      {
        path: 'branch',
        loadChildren: () => import('../branch/branch.module').then(m => m.BranchModule)
      },
      {
        path: 'timesheet',
        loadChildren: () => import('../timesheet/timesheet.module').then(m => m.TimesheetModule)
      },
      {
        path: 'settings',
        loadChildren: () => import('../settings/settings.module').then(m => m.SettingsModule)
      },
      {
        path: 'expenses-order',
        loadChildren: () => import('../expenses-order/expenses-order.module').then(m => m.ExpensesOrderModule)
      },
      {
        path: 'expenses-transaction',
        loadChildren: () => import('../expenses-transaction/expenses-transaction.module').then(m => m.ExpensesTransactionModule)
      }
    ]
  }
];
