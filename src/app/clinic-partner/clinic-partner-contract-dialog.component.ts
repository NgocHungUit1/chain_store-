import {Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {ClinicPartnerDetail, ClinicPartnerService} from './clinic-partner.service';

const MAX_FILE = 10 * 1024 * 1024;

/** Thêm hợp đồng (ký mới / gia hạn): số, hiệu lực, file PDF hoặc ảnh. Hợp đồng cũ giữ nguyên trong danh sách */
@Component({
  selector: 'app-clinic-partner-contract-dialog',
  templateUrl: './clinic-partner-contract-dialog.component.html',
  styleUrls: ['../cash-flow/cash-flow-form.css', './clinic-partner-dialog.scss']
})
export class ClinicPartnerContractDialogComponent {
  form = {contract_no: '', date_from: '', date_to: '', note: ''};
  file: File = null;
  busy = false;
  error = '';

  constructor(
    private partnerSer: ClinicPartnerService,
    public dialogRef: MatDialogRef<ClinicPartnerContractDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { partner: ClinicPartnerDetail },
  ) {
    // Gia hạn: gợi ý bắt đầu ngay sau ngày hết hạn của hợp đồng mới nhất, thời hạn 1 năm
    const last = (data.partner.contracts || [])[0];
    const start = last && last.date_to ? new Date(last.date_to + 'T00:00:00') : new Date();
    if (last && last.date_to) {
      start.setDate(start.getDate() + 1);
    }
    const end = new Date(start);
    end.setFullYear(end.getFullYear() + 1);
    end.setDate(end.getDate() - 1);
    this.form.date_from = this.ymd(start);
    this.form.date_to = this.ymd(end);
  }

  onFile(event: Event) {
    const input = event.target as HTMLInputElement;
    const f = input.files && input.files[0];
    this.error = '';
    if (f && f.size > MAX_FILE) {
      this.error = 'File hợp đồng tối đa 10MB.';
      input.value = '';
      this.file = null;
      return;
    }
    this.file = f || null;
  }

  submit() {
    this.error = '';
    if (!this.form.contract_no.trim()) {
      this.error = 'Nhập số hợp đồng.';
      return;
    }
    const body = new FormData();
    Object.keys(this.form).forEach(k => body.append(k, this.form[k] || ''));
    if (this.file) {
      body.append('file', this.file, this.file.name);
    }
    this.busy = true;
    this.dialogRef.disableClose = true;
    this.partnerSer.act(this.data.partner.id, 'contract-add', body).subscribe(res => {
      this.busy = false;
      this.dialogRef.close(res);
    }, err => {
      this.busy = false;
      this.dialogRef.disableClose = false;
      this.error = (err && err.error && err.error.message) || 'Không lưu được hợp đồng.';
    });
  }

  private ymd(d: Date): string {
    return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2);
  }
}
