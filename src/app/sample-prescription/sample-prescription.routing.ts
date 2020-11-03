import { Routes } from '@angular/router';
import { SamplePrescriptionListComponent } from './sample-prescription-list/sample-prescription-list.component';

export const SamplePrescriptionRoutes: Routes = [
  {
    path: '',
    children: [
      {
        path: '',
        component: SamplePrescriptionListComponent
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
