import { Routes } from '@angular/router';
import {BranchListComponent} from './branch-list/branch-list.component';

export const BranchRoutes: Routes = [
  {
    path: '',
    component: BranchListComponent,
  }
];
