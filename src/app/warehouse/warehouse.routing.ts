import { Routes } from '@angular/router';
import {WarehouseListComponent} from './warehouse-list/warehouse-list.component';
import {WarehouseCreateComponent} from './warehouse-create/warehouse-create.component';


export const WarehouseRoutes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'warehouse',
        component: WarehouseListComponent
      },
      {
        path: 'warehouse/create',
        component: WarehouseCreateComponent
      },
      {
        path: 'warehouse/update/:id',
        component: WarehouseCreateComponent
      }
    ]
  }
];
