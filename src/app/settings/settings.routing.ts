import { Routes } from '@angular/router';
import { SettingsMainComponent } from './settings-main/settings-main.component';
import {NotificationListComponent} from './notification-list/notification-list.component';
import {SettingProfileComponent} from './setting-profile/setting-profile.component';
import {SettingStoreComponent} from './setting-store/setting-store.component';

export const SettingsRoutes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'notification',
        component: NotificationListComponent,
      },
      {
        path: 'profile',
        component: SettingProfileComponent,
      },
      {
        path: 'store',
        component: SettingStoreComponent,
      },
      {
        path: 'employee',
        loadChildren: () => import('../employee/employee.module').then(m => m.EmployeeModule)
      },
      {
        path: 'user',
        loadChildren: () => import('../user/user.module').then(m => m.UserModule)
      },
      {
        path: 'branch',
        loadChildren: () => import('../branch/branch.module').then(m => m.BranchModule)
      },
      {
        path: 'timesheet',
        loadChildren: () => import('../timesheet/timesheet.module').then(m => m.TimesheetModule)
      },
      {
        path: 'settings',
        loadChildren: () => import('../settings/settings.module').then(m => m.SettingsModule)
      },
      {
        path: 'pay-sheet',
        loadChildren: () => import('../pay-sheet/pay-sheet.module').then(m => m.PaySheetModule)
      },
      {
        path: 'expenses-order',
        loadChildren: () => import('../expenses-order/expenses-order.module').then(m => m.ExpensesOrderModule)
      },
      {
        path: 'expenses-transaction',
        loadChildren: () => import('../expenses-transaction/expenses-transaction.module').then(m => m.ExpensesTransactionModule)
      },
      {
        path: 'common',
        component: SettingsMainComponent,
        children: [
          {
            path: ':tab',
            component: SettingsMainComponent
          }
        ]
      }
    ]
  }
];
