import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {RouterModule} from '@angular/router';
import {DemoMaterialModule} from '../demo-material-module';
import {ShipperCashComponent} from './shipper-cash/shipper-cash.component';

/** Tài chính › Tiền shipper đang giữ (thu ngân nhận tiền mặt shipper nộp) */
@NgModule({
  declarations: [ShipperCashComponent],
  imports: [
    CommonModule,
    FormsModule,
    DemoMaterialModule,
    RouterModule.forChild([{path: '', component: ShipperCashComponent}]),
  ]
})
export class ShipperCashModule {
}
