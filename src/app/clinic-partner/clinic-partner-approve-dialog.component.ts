import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {ClinicPartnerApprove, ClinicPartnerDetail, ClinicPartnerOptions, ClinicPartnerService} from './clinic-partner.service';

/** Bỏ dấu tiếng Việt, chỉ giữ chữ thường + số */
function slug(text: string): string {
  return (text || '').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'd')
    .toLowerCase().replace(/[^a-z0-9 ]/g, ' ').trim();
}

/** Gợi ý mã DocSoft từ tên: bỏ "phòng khám", lấy 2 từ cuối, vd "Phòng khám Đa khoa Minh Tâm" → pkminhtam */
export function suggestTenant(name: string): string {
  const words = slug(name).split(/\s+/).filter(w => w && ['phong', 'kham', 'pk'].indexOf(w) < 0);
  return ('pk' + words.slice(-2).join('')).substring(0, 30);
}

/** Công ty mẹ duyệt hồ sơ: chốt chi nhánh, bảng giá, chính sách (chiết khấu, hạn mức nợ), cách nối DocSoft; server kích hoạt luôn */
@Component({
  selector: 'app-clinic-partner-approve-dialog',
  templateUrl: './clinic-partner-approve-dialog.component.html',
  styleUrls: ['../cash-flow/cash-flow-form.css', './clinic-partner-dialog.scss']
})
export class ClinicPartnerApproveDialogComponent implements OnInit {
  form: ClinicPartnerApprove;
  options: ClinicPartnerOptions;
  busy = false;
  error = '';
  adminTouched = false;
  domainHint = '.docsoft';

  constructor(
    private partnerSer: ClinicPartnerService,
    public dialogRef: MatDialogRef<ClinicPartnerApproveDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { partner: ClinicPartnerDetail },
  ) {
  }

  ngOnInit(): void {
    const p = this.data.partner;
    const tenant = p.docsoft_tenant_id || suggestTenant(p.name);
    this.form = {
      branch_id: p.branch_id || p.proposed_branch_id || null,
      price_list_id: p.price_list_id || 0, // 0 = giá bán lẻ
      allow_special_control: !!p.allow_special_control,
      discount_percent: p.discount_percent || null,
      debt_limit: p.debt_limit === undefined ? null : p.debt_limit,
      docsoft_mode: p.docsoft_mode || 'create',
      docsoft_tenant_id: tenant,
      docsoft_admin_username: p.docsoft_admin_username || tenant + '.admin',
    };
    this.partnerSer.options().subscribe(o => {
      this.options = o;
      if (!this.form.branch_id && o.branches.length === 1) {
        this.form.branch_id = o.branches[0].id;
      }
    });
    this.partnerSer.list('active,suspended', '').subscribe(res => {
      // Lấy đuôi tên miền từ một phòng khám đã có để gợi ý địa chỉ đăng nhập
      const sample = (res.items || []).find(r => r.docsoft_domain && r.docsoft_tenant_id);
      if (sample) {
        this.domainHint = sample.docsoft_domain.substring(sample.docsoft_tenant_id.length);
      }
    });
  }

  setMode(mode: 'create' | 'connect') {
    this.form.docsoft_mode = mode;
  }

  onTenant() {
    this.form.docsoft_tenant_id = (this.form.docsoft_tenant_id || '').toLowerCase().replace(/[^a-z0-9]/g, '');
    if (!this.adminTouched) {
      this.form.docsoft_admin_username = this.form.docsoft_tenant_id + '.admin';
    }
  }

  submit() {
    this.error = '';
    if (!this.form.branch_id) {
      this.error = 'Chọn chi nhánh nhận đơn.';
      return;
    }
    if (!this.form.docsoft_tenant_id) {
      this.error = 'Nhập mã phòng khám DocSoft.';
      return;
    }
    this.busy = true;
    this.dialogRef.disableClose = true;
    this.partnerSer.act(this.data.partner.id, 'approve', this.form).subscribe(res => {
      this.busy = false;
      this.dialogRef.close(res);
    }, err => {
      this.busy = false;
      this.dialogRef.disableClose = false;
      this.error = (err && err.error && err.error.message) || 'Không duyệt được hồ sơ.';
      // Lỗi ở bước DocSoft: hồ sơ đã sang "Đang kích hoạt", đóng để màn chi tiết hiện nút Thử lại
      if (err && err.status === 422 && /Thử kích hoạt lại/.test(this.error)) {
        this.dialogRef.close({failed: this.error});
      }
    });
  }
}
