import { Routes } from '@angular/router';

import { Dashboard1Component } from './dashboard1/dashboard1.component';
import { DashboardMainComponent } from './dashboard-main/dashboard-main.component';
import { Dashboard3Component } from './dashboard3/dashboard3.component';

export const DashboardsRoutes: Routes = [
  {
    path: '',
    // component: Dashboard1Component,
    component: Dashboard3Component,
    data: {
      title: 'RX20.VN | Tổng quan',
      urls: [
        {title: 'Dashboard', url: '/dashboard'},
        {title: 'Tổng quan'}
      ]
    }
  }
];
