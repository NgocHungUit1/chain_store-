import { Routes } from '@angular/router';
import { SupportMainComponent } from './support-main/support-main.component';

export const SupportRoutes: Routes = [
  {
    path: '',
    children: [
      {
        path: '',
        component: SupportMainComponent
      },
    ]
  }
];
