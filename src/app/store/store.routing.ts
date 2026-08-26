import { Routes } from '@angular/router';

export const StoreRoutes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'price-book',
        loadChildren: () => import('../price-book/price-book.module').then(m => m.PriceBookModule)
      },
      {
        path: 'stock-take',
        loadChildren: () => import('../stock-take/stock-take.module').then(m => m.StockTakeModule)
      },
      {
        path: 'sample-prescription',
        loadChildren: () => import('../sample-prescription/sample-prescription.module').then(m => m.SamplePrescriptionModule)
      },
      {
        path: 'group',
        loadChildren: () => import('../group/group.module').then(m => m.GroupModule)
      },
      {
        path: 'opening-balance',
        loadChildren: () => import('../opening-balance/opening-balance.module').then(m => m.OpeningBalanceModule)
      },
    ]
  }
];
