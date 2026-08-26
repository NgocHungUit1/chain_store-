import { Routes } from '@angular/router';
import { OpeningBalanceListComponent } from './opening-balance-list/opening-balance-list.component';
import { OpeningBalanceFormComponent } from './opening-balance-form/opening-balance-form.component';

export const OpeningBalanceRoutes: Routes = [
  {
    path: '',
    children: [
      {
        path: '',
        component: OpeningBalanceListComponent
      },
      {
        path: 'code/:code',
        component: OpeningBalanceListComponent
      },
      {
        path: 'create',
        component: OpeningBalanceFormComponent
      },
      {
        path: 'update/:id',
        component: OpeningBalanceFormComponent
      }
    ]
  }
];
