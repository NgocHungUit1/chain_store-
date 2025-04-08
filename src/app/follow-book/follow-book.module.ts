import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FollowBookRoutes } from './follow-book.routing';
import { FollowBookQualityControlComponent } from './follow-book-quality-control/follow-book-quality-control.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';
import { QuillModule } from 'ngx-quill';
import { DragulaModule } from 'ng2-dragula';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { Ng2SearchPipeModule } from 'ng2-search-filter';
import { DemoMaterialModule } from '../demo-material-module';
import { MatDialogModule } from '@angular/material/dialog';
import { QualityControlCreateModalComponent } from './follow-book-quality-control/quality-control-create-modal/quality-control-create-modal.component';
import { HttpClientModule } from '@angular/common/http';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatRadioModule } from '@angular/material/radio';
import { MatListModule } from '@angular/material/list';
import { DatetimeDefaultFilterDialogComponent } from './components/datetime-default-filter-dialog/datetime-default-filter-dialog.component';
import { DatetimeChooseFilterDialogComponent } from './components/datetime-choose-filter-dialog/datetime-choose-filter-dialog.component';
import { MatButtonModule } from '@angular/material/button';
import { QualityControlDetailModalComponent } from './follow-book-quality-control/quality-control-detail-modal/quality-control-detail-modal.component';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { FollowBookMedicineTrackingComponent } from './follow-book-medicine-tracking/follow-book-medicine-tracking.component';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSelectModule } from '@angular/material/select';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FollowBookInventoryTrackingComponent } from './follow-book-inventory-tracking/follow-book-inventory-tracking.component';
import { FollowBookCustomerTransactionComponent } from './follow-book-customer-transaction/follow-book-customer-transaction.component';
import { CustomerTransactionService } from './services/customer-transaction.service';
import { InventoryTrackingService } from './services/inventory-tracking.service';

@NgModule({
  declarations: [
    FollowBookQualityControlComponent,
    QualityControlCreateModalComponent,
    DatetimeDefaultFilterDialogComponent,
    DatetimeChooseFilterDialogComponent,
    QualityControlDetailModalComponent,
    FollowBookMedicineTrackingComponent,
    FollowBookInventoryTrackingComponent,
    FollowBookCustomerTransactionComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(FollowBookRoutes),
    FormsModule,
    ReactiveFormsModule,
    FlexLayoutModule,
    QuillModule.forRoot(),
    DragulaModule.forRoot(),
    PerfectScrollbarModule,
    Ng2SearchPipeModule,
    DemoMaterialModule,
    MatDialogModule,
    HttpClientModule,
    MatProgressSpinnerModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatAutocompleteModule,
    MatSnackBarModule,
    MatRadioModule,
    MatListModule,
    MatButtonModule,
    MatTableModule,
    MatIconModule,
    MatMenuModule,
    MatSidenavModule,
    MatToolbarModule,
    MatSelectModule,
    MatPaginatorModule,
    MatSortModule,
    MatExpansionModule,
    MatFormFieldModule,
    MatInputModule
  ],
  exports: [
    // Xóa ConfirmDialogComponent khỏi exports
  ],
  providers: [
    InventoryTrackingService,
    CustomerTransactionService
  ]
})
export class FollowBookModule { }
