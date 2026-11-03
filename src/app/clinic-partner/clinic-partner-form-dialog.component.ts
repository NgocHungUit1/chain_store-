import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {NotifierService} from 'angular-notifier';
import {ClinicPartnerDetail, ClinicPartnerOptions, ClinicPartnerProfile, ClinicPartnerService} from './clinic-partner.service';

const FIELDS = ['name', 'license_no', 'specialty', 'tax_code', 'address', 'phone', 'email', 'representative_name',
  'representative_phone', 'doctor_count', 'sales_user_id', 'proposed_branch_id', 'note'];

/** Đăng ký / sửa hồ sơ phòng khám đối tác (kinh doanh). Hai nút: Lưu nháp, Gửi duyệt. */
@Component({
  selector: 'app-clinic-partner-form-dialog',
  templateUrl: './clinic-partner-form-dialog.component.html',
  styleUrls: ['../cash-flow/cash-flow-form.css', './clinic-partner-dialog.scss']
})
export class ClinicPartnerFormDialogComponent implements OnInit {
  form: ClinicPartnerProfile = {name: ''};
  options: ClinicPartnerOptions;
  busy = false;
  error = '';

  constructor(
    private partnerSer: ClinicPartnerService,
    private notify: NotifierService,
    public dialogRef: MatDialogRef<ClinicPartnerFormDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { partner: ClinicPartnerDetail | null },
  ) {
  }

  ngOnInit(): void {
    if (this.data.partner) {
      FIELDS.forEach(f => this.form[f] = this.data.partner[f]);
    }
    this.partnerSer.options().subscribe(o => {
      this.options = o;
      if (!this.data.partner && o.branches.length === 1) {
        this.form.proposed_branch_id = o.branches[0].id;
      }
    });
  }

  save(submit: boolean) {
    this.error = '';
    if (!(this.form.name || '').trim()) {
      this.error = 'Nhập tên phòng khám.';
      return;
    }
    this.busy = true;
    const body = {...this.form, submit: submit ? 1 : 0};
    const req = this.data.partner ? this.partnerSer.update(this.data.partner.id, body) : this.partnerSer.create(body);
    req.subscribe(saved => {
      this.busy = false;
      this.notify.notify('success', submit ? 'Đã gửi hồ sơ ' + saved.code + ' chờ công ty mẹ duyệt.' : 'Đã lưu hồ sơ ' + saved.code + '.');
      this.dialogRef.close(saved);
    }, err => {
      this.busy = false;
      this.error = (err && err.error && err.error.message) || 'Không lưu được hồ sơ.';
    });
  }
}
