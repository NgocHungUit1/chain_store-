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
    ]
  }
];
