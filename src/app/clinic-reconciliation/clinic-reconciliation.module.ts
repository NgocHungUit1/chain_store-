import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {RouterModule} from '@angular/router';
import {DemoMaterialModule} from '../demo-material-module';
import {ClinicReconciliationComponent} from './clinic-reconciliation.component';
import {ClinicCollectDialogComponent} from './clinic-collect-dialog.component';

/** Báo cáo › Đối soát phòng khám: công nợ phòng khám liên kết theo tháng (pharma_chain/.claude/du-an/10-dat-thuoc.md) */
@NgModule({
  declarations: [ClinicReconciliationComponent, ClinicCollectDialogComponent],
  imports: [
    CommonModule,
    FormsModule,
    DemoMaterialModule,
    RouterModule.forChild([{path: '', component: ClinicReconciliationComponent}]),
  ]
})
export class ClinicReconciliationModule {
}
