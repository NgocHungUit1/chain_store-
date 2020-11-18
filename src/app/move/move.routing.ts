import { Routes } from '@angular/router';
import { MoveListComponent } from './move-list/move-list.component';

export const MoveRoutes: Routes = [
  {
    path: '',
    children: [
      {
        path: '',
        component: MoveListComponent
      },
      // {
      //   path: 'create',
      //   component: StockTakeCreateComponent
      // },
      // {
      //   path: 'update/:id',
      //   component: StockTakeCreateComponent
      // }
    ]
  }
];
