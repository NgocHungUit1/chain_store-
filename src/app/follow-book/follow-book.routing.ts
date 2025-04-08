import { Routes } from '@angular/router';
import { FollowBookQualityControlComponent } from './follow-book-quality-control/follow-book-quality-control.component';
import { FollowBookMedicineTrackingComponent } from './follow-book-medicine-tracking/follow-book-medicine-tracking.component';
import { FollowBookCustomerTransactionComponent } from './follow-book-customer-transaction/follow-book-customer-transaction.component';
import { FollowBookInventoryTrackingComponent } from './follow-book-inventory-tracking/follow-book-inventory-tracking.component';
export const FollowBookRoutes: Routes = [
  {
    path: 'quanlity-control',
    component: FollowBookQualityControlComponent
  },
  {
    path: 'medicine-tracking',
    component: FollowBookMedicineTrackingComponent
  },
  {
    path: 'inventory-tracking',
    component: FollowBookInventoryTrackingComponent
  },
  {
    path: 'customer-transaction',
    component: FollowBookCustomerTransactionComponent
  },

];
