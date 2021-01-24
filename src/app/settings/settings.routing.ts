import { Routes } from '@angular/router';
import { SettingsMainComponent } from './settings-main/settings-main.component';

export const SettingsRoutes: Routes = [
  {
    path: '',
    children: [
      {
        path: '',
        component: SettingsMainComponent
      },
    ]
  }
];
