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

@NgModule({
  declarations: [
    FollowBookQualityControlComponent,
    QualityControlCreateModalComponent,
    DatetimeDefaultFilterDialogComponent,
    DatetimeChooseFilterDialogComponent,
    QualityControlDetailModalComponent
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
    MatMenuModule
  ],
  exports: [
    // Xóa ConfirmDialogComponent khỏi exports
  ]
})
export class FollowBookModule { }
