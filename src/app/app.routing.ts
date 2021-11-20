import { Routes } from '@angular/router';

import { FullComponent } from './layouts/full/full.component';
import { CartComponent } from './layouts/cart/cart.component';
import { AppBlankComponent } from './layouts/blank/blank.component';
import { WarehouseImportFormComponent } from './warehouse/warehouse-import-form/warehouse-import-form.component';

export const AppRoutes: Routes = [
  {
    path: '',
    component: FullComponent,
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        loadChildren: () => import('./dashboards/dashboards.module').then(m => m.DashboardsModule)
      },
      {
        path: 'store',
        loadChildren: () => import('./store/store.module').then(m => m.StoreModule)
      },
      {
        path: 'partner',
        loadChildren: () => import('./supplier/supplier.module').then(m => m.SupplierModule)
      },
      {
        path: 'transaction',
        loadChildren: () => import('./warehouse/warehouse.module').then(m => m.WarehouseModule)
      },
      {
        path: 'invoice',
        loadChildren: () => import('./invoice/invoice.module').then(m => m.InvoiceModule)
      },
      {
        path: 'returns',
        loadChildren: () => import('./returns/returns.module').then(m => m.ReturnsModule)
      },
      {
        path: 'report',
        loadChildren: () => import('./report/report.module').then(m => m.ReportModule)
      },
      {
        path: 'cash-flow',
        loadChildren: () => import('./cash-flow/cash-flow.module').then(m => m.CashFlowModule)
      },
      {
        path: 'setting',
        loadChildren: () => import('./settings/settings.module').then(m => m.SettingsModule)
      },
      // {
      //     path: 'material',
      //     loadChildren:
      //         () => import('./material-component/material.module').then(m => m.MaterialComponentsModule)
      // },
      // {
      //     path: 'apps',
      //     loadChildren: () => import('./apps/apps.module').then(m => m.AppsModule)
      // },
      // {
      //     path: 'forms',
      //     loadChildren: () => import('./forms/forms.module').then(m => m.FormModule)
      // },
      // {
      //     path: 'tables',
      //     loadChildren: () => import('./tables/tables.module').then(m => m.TablesModule)
      // },
      // {
      //     path: 'datatables',
      //     loadChildren: () => import('./datatables/datatables.module').then(m => m.DataTablesModule)
      // },
      // {
      //     path: 'tree',
      //     loadChildren: () => import('./tree/tree.module').then(m => m.TreeModule)
      // },
      // {
      //     path: 'pages',
      //     loadChildren: () => import('./pages/pages.module').then(m => m.PagesModule)
      // },
      // {
      //     path: 'widgets',
      //     loadChildren: () => import('./widgets/widgets.module').then(m => m.WidgetsModule)
      // },
      // {
      //     path: 'charts',
      //     loadChildren: () => import('./charts/chartslib.module').then(m => m.ChartslibModule)
      // }
    ]
  },
  {
    path: '',
    component: CartComponent,
    children: [
      {
        path: 'sale',
        loadChildren: () => import('./sale/sale.module').then(m => m.SaleModule)
      }
    ]
  },
  {
    path: '',
    component: AppBlankComponent,
    children: [
      {
        path: 'authentication',
        loadChildren:
          () => import('./authentication/authentication.module').then(m => m.AuthenticationModule)
      }
    ]
  },
  {
    path: '**',
    redirectTo: 'authentication/404'
  }
];
