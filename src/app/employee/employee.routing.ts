import { Routes } from '@angular/router';
import {EmployeeListComponent} from './employee-list/employee-list.component';

export const EmployeeRoutes: Routes = [
  {
    path: '',
    component: EmployeeListComponent,
  }
];
