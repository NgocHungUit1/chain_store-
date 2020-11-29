import { Routes } from '@angular/router';
import { SamplePrescriptionListComponent } from './sample-prescription-list/sample-prescription-list.component';
import { SamplePrescriptionCreateComponent } from './sample-prescription-create/sample-prescription-create.component';

export const SamplePrescriptionRoutes: Routes = [
  {
    path: '',
    children: [
      {
        path: '',
        component: SamplePrescriptionListComponent
      },
      {
        path: 'create',
        component: SamplePrescriptionCreateComponent
      },
      {
        path: 'update/:id',
        component: SamplePrescriptionCreateComponent
      }
    ]
  }
];
