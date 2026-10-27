import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {RouterModule} from '@angular/router';
import {DemoMaterialModule} from '../demo-material-module';
import {PrescriptionOrderListComponent} from './prescription-order-list/prescription-order-list.component';
import {PrescriptionOrderDetailComponent} from './prescription-order-detail/prescription-order-detail.component';
import {PrescriptionOrderReturnDialogComponent} from './prescription-order-return-dialog/prescription-order-return-dialog.component';

/** Màn "Đơn đặt thuốc": đơn phòng khám liên kết gửi tới nhà thuốc (GĐ2, xem pharma_chain/.claude/du-an/10-dat-thuoc.md) */
@NgModule({
  declarations: [PrescriptionOrderListComponent, PrescriptionOrderDetailComponent, PrescriptionOrderReturnDialogComponent],
  imports: [
    CommonModule,
    FormsModule,
    DemoMaterialModule,
    RouterModule.forChild([
      {path: '', component: PrescriptionOrderListComponent},
      {path: ':id', component: PrescriptionOrderDetailComponent},
    ]),
  ]
})
export class PrescriptionOrderModule {
}
