import { Routes } from '@angular/router';
import { StockTakeListComponent } from './stock-take-list/stock-take-list.component';
import { StockTakeCreateComponent } from './stock-take-create/stock-take-create.component';

export const StockTakeRoutes: Routes = [
  {
    path: '',
    children: [
      {
        path: '',
        component: StockTakeListComponent
      },
      {
        path: 'code/:code',
        component: StockTakeListComponent
      },
      {
        path: 'create',
        component: StockTakeCreateComponent
      },
      {
        path: 'update/:id',
        component: StockTakeCreateComponent
      }
    ]
  }
];
