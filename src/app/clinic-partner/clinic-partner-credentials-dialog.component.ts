import {Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA} from '@angular/material/dialog';
import {NotifierService} from 'angular-notifier';

/** Thông tin chỉ hiện một lần sau khi duyệt / cấp lại khoá: tài khoản DocSoft vừa tạo, hoặc khoá để phòng khám nhập tay */
@Component({
  selector: 'app-clinic-partner-credentials-dialog',
  templateUrl: './clinic-partner-credentials-dialog.component.html',
  styleUrls: ['../cash-flow/cash-flow-form.css', './clinic-partner-dialog.scss']
})
export class ClinicPartnerCredentialsDialogComponent {
  constructor(
    private notify: NotifierService,
    @Inject(MAT_DIALOG_DATA) public data: {
      title: string, warning?: string,
      credentials: { docsoft_url?: string, admin_username?: string, admin_password?: string, api_key?: string }
    },
  ) {
  }

  copyAll() {
    const c = this.data.credentials;
    const lines = [
      c.docsoft_url ? 'Địa chỉ DocSoft: ' + c.docsoft_url : '',
      c.admin_username ? 'Tên đăng nhập: ' + c.admin_username : '',
      c.admin_password ? 'Mật khẩu: ' + c.admin_password : '',
      c.api_key ? 'Khoá kết nối nhà thuốc: ' + c.api_key : '',
    ].filter(l => l);
    this.copy(lines.join('\n'));
  }

  copy(text: string) {
    const done = () => this.notify.notify('success', 'Đã sao chép.');
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(done);
      return;
    }
    const ta = document.createElement('textarea');
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
    done();
  }
}
