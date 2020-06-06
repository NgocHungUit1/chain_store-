import { Routes } from '@angular/router';

import {SupplierListComponent} from './supplier-list/supplier-list.component';

export const SupplierRoutes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'supplier',
        component: SupplierListComponent
      }
    ]
  }
];
