import {Routes} from '@angular/router';

import {FullComponent} from './layouts/full/full.component';
import {AppBlankComponent} from './layouts/blank/blank.component';

export const AppRoutes: Routes = [
  {
    path: '',
    component: FullComponent,
    children: [
      {
        path: '',
        redirectTo: 'dashboard1',
        pathMatch: 'full'
      },
      {
        path: 'dashboard1',
        loadChildren: () => import('./dashboards/dashboards.module').then(m => m.DashboardsModule)
      },
      {
        path: 'store',
        loadChildren: () => import('./catalog/catalog.module').then(m => m.CatalogModule)
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
