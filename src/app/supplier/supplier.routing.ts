import { Routes } from '@angular/router';

import {SupplierListComponent} from './supplier-list/supplier-list.component';

export const SupplierRoutes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'supplier',
        component: SupplierListComponent,
        // data: {
        //   title: 'Danh mục thuốc của Cục Quản lý dược',
        //   urls: [
        //     { title: 'Dashboard', url: '/dashboard1' },
        //     { title: 'Danh mục thuốc' }
        //   ]
        // }
      },
    ]
  }
];
