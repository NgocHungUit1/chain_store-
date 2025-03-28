import { Routes } from '@angular/router';
import { FollowBookQualityControlComponent } from './follow-book-quality-control/follow-book-quality-control.component';
import { FollowBookMedicineTrackingComponent } from './follow-book-medicine-tracking/follow-book-medicine-tracking.component';

export const FollowBookRoutes: Routes = [
  {
    path: 'quanlity-control',
    component: FollowBookQualityControlComponent
  },
  {
    path: 'medicine-tracking',
    component: FollowBookMedicineTrackingComponent
  },

];
