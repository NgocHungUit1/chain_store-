import { Routes } from '@angular/router';
import {DebtCustomersModule} from '../debt-customers/debt-customers.module';
import {DebtSuppliersModule} from '../debt-suppliers/debt-suppliers.module';

export const ReportRoutes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'day-report',
        loadChildren: () => import('../day-report/day-report.module').then(m => m.DayReportModule)
      },
      {
        path: 'sale-report',
        loadChildren: () => import('../sale-report/sale-report.module').then(m => m.SaleReportModule)
      },
      {
        path: 'product-report',
        loadChildren: () => import('../product-report/product-report.module').then(m => m.ProductReportModule)
      },
      /*{
        path: 'debt-report',
        loadChildren: () => import('../debt-report/debt-report.module').then(m => m.DebtReportModule)
      },*/
      {
        path: 'debt-customers',
        loadChildren: () => import('../debt-customers/debt-customers.module').then(m => DebtCustomersModule)
      },
      {
        path: 'debt-suppliers',
        loadChildren: () => import('../debt-suppliers/debt-suppliers.module').then(m => DebtSuppliersModule)
      },
    ]
  }
];
