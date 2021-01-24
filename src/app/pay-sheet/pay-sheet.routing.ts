import { Routes } from '@angular/router';
import {PaySheetListComponent} from './pay-sheet-list/pay-sheet-list.component';
import {PaySheetFormDetailComponent} from './pay-sheet-form-detail/pay-sheet-form-detail.component';

export const PaySheetRoutes: Routes = [
  {
    path: '',
    component: PaySheetListComponent
  },
  {
    path: 'update/:id',
    component: PaySheetFormDetailComponent
  }
];
