import {Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {CollectMethod} from '../prescription-order.service';

/**
 * Hoàn thành đơn đặt thuốc: đơn đang giao (nhân viên tự giao), hoặc phòng khám tự đến lấy tại nhà thuốc (selfPickup).
 * Chọn cách thu: tiền mặt / chuyển khoản (ghi phiếu trả nợ hoá đơn) hay ghi nợ (đối soát cuối tháng).
 * Đóng với {method}; bỏ qua thì đóng không giá trị.
 */
@Component({
  selector: 'app-prescription-order-complete-dialog',
  templateUrl: './prescription-order-complete-dialog.component.html',
  styleUrls: ['../prescription-order-return-dialog/prescription-order-return-dialog.component.scss', './prescription-order-complete-dialog.component.scss']
})
export class PrescriptionOrderCompleteDialogComponent {
  method: CollectMethod = null;

  constructor(
    public dialogRef: MatDialogRef<PrescriptionOrderCompleteDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { code: string, clinic: string, invoiceNo: string, debt: number, selfPickup?: boolean },
  ) {
  }

  submit() {
    if (this.method === null) {
      return;
    }
    this.dialogRef.close({method: this.method});
  }
}
