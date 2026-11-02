import {Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';

/**
 * Hoàn thành đơn đặt thuốc: phòng khám đã trả tiền khi nhận (ghi phiếu trả nợ hoá đơn) hay để nợ đối soát cuối tháng.
 * Đóng với {paid: boolean}; bỏ qua thì đóng không giá trị.
 */
@Component({
  selector: 'app-prescription-order-complete-dialog',
  templateUrl: './prescription-order-complete-dialog.component.html',
  styleUrls: ['../prescription-order-return-dialog/prescription-order-return-dialog.component.scss', './prescription-order-complete-dialog.component.scss']
})
export class PrescriptionOrderCompleteDialogComponent {
  paid: boolean = null;

  constructor(
    public dialogRef: MatDialogRef<PrescriptionOrderCompleteDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { code: string, clinic: string, invoiceNo: string, debt: number },
  ) {
  }

  submit() {
    if (this.paid === null) {
      return;
    }
    this.dialogRef.close({paid: this.paid});
  }
}
