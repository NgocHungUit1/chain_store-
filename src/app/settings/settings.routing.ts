import { Routes } from '@angular/router';
import { SettingsMainComponent } from './settings-main/settings-main.component';
import {NotificationListComponent} from './notification-list/notification-list.component';
import {SettingProfileComponent} from './setting-profile/setting-profile.component';

export const SettingsRoutes: Routes = [
  {
    path: '',
    children: [
      {
        path: '',
        component: SettingsMainComponent
      },
      {
        path: 'notification',
        component: NotificationListComponent,
      },
      {
        path: 'profile',
        component: SettingProfileComponent,
      }
    ]
  }
];
