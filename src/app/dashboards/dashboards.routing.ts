import { Routes } from '@angular/router';

import { Dashboard1Component } from './dashboard1/dashboard1.component';
import { DashboardMainComponent } from './dashboard-main/dashboard-main.component';

export const DashboardsRoutes: Routes = [
  {
    path: '',
    // component: Dashboard1Component,
    component: DashboardMainComponent,
    data: {
      title: 'RX20.VN | Tổng quan',
      urls: [
        {title: 'Dashboard', url: '/dashboard'},
        {title: 'Tổng quan'}
      ]
    }
  }
];
