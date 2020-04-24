import { Routes } from '@angular/router';

import {CatalogListComponent} from "./catalog-list/catalog-list.component";

export const CatalogRoutes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'catalog',
        component: CatalogListComponent,
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
