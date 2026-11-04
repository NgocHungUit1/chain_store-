import {Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {ClinicPartnerDetail, ClinicPartnerService} from './clinic-partner.service';

/** Công ty mẹ sửa chính sách: chiết khấu % (tự trừ vào hoá đơn bốc thuốc), hạn mức nợ (vượt chỉ cảnh báo) */
@Component({
  selector: 'app-clinic-partner-policy-dialog',
  templateUrl: './clinic-partner-policy-dialog.component.html',
  styleUrls: ['../cash-flow/cash-flow-form.css', './clinic-partner-dialog.scss']
})
export class ClinicPartnerPolicyDialogComponent {
  discount: number = null;
  limit: number = null;
  note = '';
  busy = false;
  error = '';

  constructor(
    private partnerSer: ClinicPartnerService,
    public dialogRef: MatDialogRef<ClinicPartnerPolicyDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { partner: ClinicPartnerDetail },
  ) {
    this.discount = data.partner.discount_percent || null;
    this.limit = data.partner.debt_limit;
  }

  submit() {
    this.error = '';
    this.busy = true;
    this.dialogRef.disableClose = true;
    this.partnerSer.act(this.data.partner.id, 'policy', {discount_percent: this.discount, debt_limit: this.limit, note: this.note})
      .subscribe(res => {
        this.busy = false;
        this.dialogRef.close(res);
      }, err => {
        this.busy = false;
        this.dialogRef.disableClose = false;
        this.error = (err && err.error && err.error.message) || 'Không lưu được chính sách.';
      });
  }
}
