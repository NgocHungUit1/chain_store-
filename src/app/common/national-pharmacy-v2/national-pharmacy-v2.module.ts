import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

import { NationalPharmacyV2StatusComponent } from './national-pharmacy-v2-status/national-pharmacy-v2-status.component';

/**
 * Module gọn cho phần hiển thị liên thông CSDL Dược quốc gia.
 *
 * Tách riêng thay vì nhồi vào SharedModule: hai module invoice và returns chưa
 * import SharedModule, thêm vào đó sẽ kéo theo toàn bộ khai báo dùng chung khác
 * và dễ đụng khai báo trùng.
 */
@NgModule({
  declarations: [
    NationalPharmacyV2StatusComponent,
  ],
  exports: [
    NationalPharmacyV2StatusComponent,
  ],
  imports: [
    CommonModule,
    MatIconModule,
    MatTooltipModule,
  ],
})
export class NationalPharmacyV2Module {
}
