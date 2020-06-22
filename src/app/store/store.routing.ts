import { Routes } from '@angular/router';

export const StoreRoutes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'price-book',
        loadChildren: () => import('../price-book/price-book.module').then(m => m.PriceBookModule)
      },
    ]
  }
];
