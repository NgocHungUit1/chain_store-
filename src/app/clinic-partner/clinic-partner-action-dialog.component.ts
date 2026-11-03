import {Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';

export interface ClinicPartnerActionConfig {
  title: string;
  subtitle: string;
  icon: string;
  tone?: '' | 'warn' | 'danger';
  danger?: boolean;
  confirmLabel: string;
  warningTitle?: string;
  warnings?: string[];
  field?: 'none' | 'text' | 'branch';
  fieldLabel?: string;
  placeholder?: string;
  required?: boolean;
  requiredMessage?: string;
  suggestions?: string[];
  branches?: { id: number, name: string }[];
  currentBranchId?: number;
}

/** Xác nhận một thao tác trên hồ sơ (từ chối, tạm ngưng, ngừng hợp tác, đổi chi nhánh, cấp lại khoá…), có thể kèm lý do / chọn chi nhánh */
@Component({
  selector: 'app-clinic-partner-action-dialog',
  templateUrl: './clinic-partner-action-dialog.component.html',
  styleUrls: ['../cash-flow/cash-flow-form.css', '../prescription-order/prescription-order-return-dialog/prescription-order-return-dialog.component.scss',
    './clinic-partner-dialog.scss']
})
export class ClinicPartnerActionDialogComponent {
  text = '';
  branchId: number = null;
  error = '';

  constructor(
    public dialogRef: MatDialogRef<ClinicPartnerActionDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ClinicPartnerActionConfig,
  ) {
  }

  confirm() {
    if (this.data.field === 'text' && this.data.required && !this.text.trim()) {
      this.error = this.data.requiredMessage || 'Nhập ' + (this.data.fieldLabel || '').toLowerCase() + '.';
      return;
    }
    if (this.data.field === 'branch' && !this.branchId) {
      this.error = 'Chọn chi nhánh.';
      return;
    }
    this.dialogRef.close({text: this.text.trim(), branchId: this.branchId});
  }
}
