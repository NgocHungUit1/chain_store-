import { Routes } from '@angular/router';

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
    ]
  }
];
