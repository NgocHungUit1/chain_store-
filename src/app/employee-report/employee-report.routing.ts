import { Routes } from '@angular/router';
import {EmployeeReportMainComponent} from './employee-report-main/employee-report-main.component';

export const EmployeeReportRoutes: Routes = [
  {
    path: '',
    component: EmployeeReportMainComponent
  },
  {
    path: ':tab',
    component: EmployeeReportMainComponent
  }
];
