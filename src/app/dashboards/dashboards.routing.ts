import {Routes} from '@angular/router';

import {Dashboard1Component} from './dashboard1/dashboard1.component';

export const DashboardsRoutes: Routes = [
  {
    path: '',
    component: Dashboard1Component,
    data: {
      title: 'Tổng quan',
      urls: [
        { title: 'Dashboard', url: '/dashboard' },
        { title: 'Tổng quan' }
      ]
    }
  }
];
