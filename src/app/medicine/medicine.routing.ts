import { Routes } from '@angular/router';

import {MedicineListComponent} from "./medicine-list/medicine-list.component";

export const MedicineRoutes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'medicine',
        component: MedicineListComponent,
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
