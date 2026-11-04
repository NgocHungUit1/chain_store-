import {Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA} from '@angular/material/dialog';

/**
 * Cảnh báo nhưng vẫn cho làm tiếp (vượt hạn mức nợ khi xác nhận đơn, thiếu hàng khi bốc thuốc).
 * Đóng với true nếu dược sĩ chọn làm tiếp; bỏ qua thì đóng không giá trị.
 */
@Component({
  selector: 'app-prescription-order-warn-dialog',
  templateUrl: './prescription-order-warn-dialog.component.html',
  styleUrls: ['../prescription-order-return-dialog/prescription-order-return-dialog.component.scss', './prescription-order-warn-dialog.component.scss']
})
export class PrescriptionOrderWarnDialogComponent {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { title: string, subtitle: string, message: string, hint?: string, confirmLabel: string, icon: string },
  ) {
  }
}
