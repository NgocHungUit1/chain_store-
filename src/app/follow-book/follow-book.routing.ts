import { Routes } from '@angular/router';
import { FollowBookQualityControlComponent } from './follow-book-quality-control/follow-book-quality-control.component';
import { FollowBookMedicineTrackingComponent } from './follow-book-medicine-tracking/follow-book-medicine-tracking.component';
import { FollowBookInventoryTrackingComponent } from './follow-book-inventory-tracking/follow-book-inventory-tracking.component';
import { FollowBookCustomerTransactionComponent } from './follow-book-customer-transaction/follow-book-customer-transaction.component';
import { FollowBookCustomerComplaintComponent } from './follow-book-customer-complaint/follow-book-customer-complaint.component';
import { FollowBookTraineeComponent } from './follow-book-trainee/follow-book-trainee.component';
import { FollowBookHygieneComponent } from './follow-book-hygiene/follow-book-hygiene.component';
import { FollowBookMedicineRecallComponent } from './follow-book-medicine-recall/follow-book-medicine-recall.component';
import { FollowBookDrugReactionComponent } from './follow-book-drug-reaction/follow-book-drug-reaction.component';
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
  {
    path: 'customer-complaint',
    component: FollowBookCustomerComplaintComponent
  },
  {
    path: 'supplier-tracking',
    loadChildren: () => import('../supplier/supplier.module').then(m => m.SupplierModule)
  },
  {
    path: 'trainee',
    component: FollowBookTraineeComponent
  },
  {
    path: 'hygiene',
    component: FollowBookHygieneComponent
  },
  {
    path: 'medicine-recall',
    component: FollowBookMedicineRecallComponent
  },
  {
    path: 'drug-reaction',
    component: FollowBookDrugReactionComponent
  }
];
