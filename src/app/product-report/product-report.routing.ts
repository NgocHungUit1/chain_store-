import { Routes } from '@angular/router';
import { ProductReportMainComponent } from './product-report-main/product-report-main.component';

export const ProductReportRoutes: Routes = [
  {
    path: '',
    component: ProductReportMainComponent
  },
  {
    path: ':tab',
    component: ProductReportMainComponent
  }
];
