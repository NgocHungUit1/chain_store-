import {Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';

/** Trả đơn về phòng khám: bắt buộc lý do để bác sĩ biết cần sửa gì; nhà thuốc không tự thay thuốc */
@Component({
  selector: 'app-prescription-order-return-dialog',
  templateUrl: './prescription-order-return-dialog.component.html',
  styleUrls: ['./prescription-order-return-dialog.component.scss']
})
export class PrescriptionOrderReturnDialogComponent {
  readonly suggestions = ['Hết hàng', 'Thuốc ngừng kinh doanh', 'Sai đơn vị/số lượng', 'Cần bác sĩ xác nhận lại liều'];
  reason = '';
  note = '';
  touched = false;

  constructor(
    public dialogRef: MatDialogRef<PrescriptionOrderReturnDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { code: string, missing: string[] },
  ) {
    // Thiếu hàng thì gợi ý sẵn lý do kèm tên thuốc
    if (data && data.missing && data.missing.length) {
      this.reason = 'Hết hàng: ' + data.missing.join(', ');
    }
  }

  pick(s: string) {
    this.reason = s;
  }

  submit() {
    this.touched = true;
    if (!this.reason.trim()) {
      return;
    }
    this.dialogRef.close({reason: this.reason.trim(), note: this.note.trim()});
  }
}
