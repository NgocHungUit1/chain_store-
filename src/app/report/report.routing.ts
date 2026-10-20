import { Routes } from '@angular/router';
import {DebtCustomersModule} from '../debt-customers/debt-customers.module';
import {DebtSuppliersModule} from '../debt-suppliers/debt-suppliers.module';
import {GroupReportComponent} from '../group/group-report/group-report.component';
import {StockReportComponent} from '../product-report/stock-report/stock-report.component';
import {EmployeeReportModule} from '../employee-report/employee-report.module';

export const ReportRoutes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'day-report',
        loadChildren: () => import('../day-report/day-report.module').then(m => m.DayReportModule)
      },
      // { @@
      //   path: 'sale-report',
      //   loadChildren: () => import('../sale-report/sale-report.module').then(m => m.SaleReportModule)
      // },
      {
        path: 'product-report',
        loadChildren: () => import('../product-report/product-report.module').then(m => m.ProductReportModule)
      },
      {
        path: 'employee',
        loadChildren: () => import('../employee-report/employee-report.module').then(m => m.EmployeeReportModule)
      },
      {
        path: 'inventory-turnover',
        loadChildren: () => import('../inventory-turnover/inventory-turnover.module').then(m => m.InventoryTurnoverModule)
      },
      {
        path: 'stock-report',
        component: StockReportComponent,
      },
      {
        path: 'group-report',
        component: GroupReportComponent,
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
