import { Routes } from '@angular/router';
import { MoveListComponent } from './move-list/move-list.component';
import { MoveCreateComponent } from './move-create/move-create.component';

export const MoveRoutes: Routes = [
  {
    path: '',
    children: [
      {
        path: '',
        component: MoveListComponent
      },
      {
        path: 'code/:code',
        component: MoveListComponent
      },
      {
        path: 'create',
        component: MoveCreateComponent
      },
      {
        path: 'update/:id',
        component: MoveCreateComponent
      }
    ]
  }
];
