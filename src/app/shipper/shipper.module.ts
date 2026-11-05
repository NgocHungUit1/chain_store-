import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {RouterModule} from '@angular/router';
import {DemoMaterialModule} from '../demo-material-module';
import {ShipperHomeComponent} from './shipper-home/shipper-home.component';
import {ShipperDetailComponent} from './shipper-detail/shipper-detail.component';

/** Trang giao hàng trên điện thoại cho shipper nội bộ (/shipper, không có menu nhà thuốc) */
@NgModule({
  declarations: [ShipperHomeComponent, ShipperDetailComponent],
  imports: [
    CommonModule,
    FormsModule,
    DemoMaterialModule,
    RouterModule.forChild([
      {path: '', component: ShipperHomeComponent},
      {path: ':id', component: ShipperDetailComponent},
    ]),
  ]
})
export class ShipperModule {
}
