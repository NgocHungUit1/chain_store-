import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {MatDialog} from '@angular/material/dialog';
import {NotifierService} from 'angular-notifier';
import {ClinicPartnerDetail, ClinicPartnerOptions, ClinicPartnerService, PARTNER_STATUS_CLASS} from './clinic-partner.service';
import {ClinicPartnerFormDialogComponent} from './clinic-partner-form-dialog.component';
import {ClinicPartnerApproveDialogComponent} from './clinic-partner-approve-dialog.component';
import {ClinicPartnerActionConfig, ClinicPartnerActionDialogComponent} from './clinic-partner-action-dialog.component';
import {ClinicPartnerCredentialsDialogComponent} from './clinic-partner-credentials-dialog.component';
import {getAllPermissions} from '../shared/permission-storage';

const STATUS_LABELS = {
  draft: 'Nháp', pending: 'Chờ duyệt', rejected: 'Bị từ chối', activating: 'Đang kích hoạt',
  active: 'Đang hoạt động', suspended: 'Tạm ngưng', terminated: 'Ngừng hợp tác',
};

/** Chi tiết phòng khám đối tác: hồ sơ, thiết lập nhà thuốc, DocSoft, lịch sử; nút thao tác theo trạng thái + quyền */
@Component({
  selector: 'app-clinic-partner-detail',
  templateUrl: './clinic-partner-detail.component.html',
  styleUrls: ['../prescription-order/prescription-order.scss', '../prescription-order/prescription-order-detail/prescription-order-detail.component.scss',
    './clinic-partner.scss', './clinic-partner-detail.component.scss']
})
export class ClinicPartnerDetailComponent implements OnInit {
  p: ClinicPartnerDetail;
  loading = false;
  busy = false;
  notFound = false;
  warning = '';
  statusClass = PARTNER_STATUS_CLASS;
  linkLabel = {active: 'đang dùng', suspended: 'tạm ngưng', revoked: 'đã thu hồi'};
  canReconcile = false;
  private permissions: string[] = [];
  private options: ClinicPartnerOptions;

  constructor(
    private partnerSer: ClinicPartnerService,
    private notify: NotifierService,
    private dialog: MatDialog,
    private router: Router,
    private route: ActivatedRoute,
  ) {
  }

  ngOnInit(): void {
    this.permissions = getAllPermissions();
    this.canReconcile = this.permissions.indexOf('Report.Clinic-Reconciliation') >= 0;
    this.load();
  }

  get id(): number {
    return +this.route.snapshot.paramMap.get('id');
  }

  /** Bước kích hoạt lỗi gần nhất (khi đang kích hoạt dở) */
  get lastFailed() {
    const steps = (this.p && this.p.activation) || [];
    const last = steps[steps.length - 1];
    return last && !last.ok ? last : null;
  }

  get missing(): string[] {
    const labels = {license_no: 'số giấy phép', address: 'địa chỉ', phone: 'điện thoại', representative_name: 'người đại diện',
      representative_phone: 'điện thoại người đại diện'};
    return Object.keys(labels).filter(k => !this.p[k]).map(k => labels[k]);
  }

  load() {
    this.loading = true;
    this.partnerSer.view(this.id).subscribe(p => {
      this.p = p;
      this.loading = false;
    }, err => {
      this.loading = false;
      if (err && err.status === 404) {
        this.notFound = true;
      }
    });
  }

  can(action: string): boolean {
    return this.permissions.indexOf('Clinic-Partner.' + action) >= 0;
  }

  in(...statuses: string[]): boolean {
    return statuses.indexOf(this.p.status) >= 0;
  }

  statusLabel(s: string): string {
    return STATUS_LABELS[s] || s || '';
  }

  back() {
    this.router.navigate(['/chain', 'clinic-partner']);
  }

  edit() {
    this.dialog.open(ClinicPartnerFormDialogComponent, {width: '760px', maxWidth: '96vw', data: {partner: this.p}, autoFocus: false})
      .afterClosed().subscribe(saved => saved && this.apply(saved));
  }

  approve() {
    this.dialog.open(ClinicPartnerApproveDialogComponent, {width: '760px', maxWidth: '96vw', data: {partner: this.p}, autoFocus: false})
      .afterClosed().subscribe(res => {
        if (res && res.failed) {
          this.load(); // lỗi bước DocSoft: interceptor đã báo, hiện nút Thử kích hoạt lại
        } else if (res) {
          this.apply(res, 'Đã duyệt và kích hoạt ' + res.code + '.', 'Tài khoản DocSoft của ' + res.name);
        }
      });
  }

  retry() {
    this.run('activate', {}, 'Đã kích hoạt xong.', 'Tài khoản DocSoft của ' + this.p.name);
  }

  simple(action: string, done: string) {
    this.run(action, {}, done);
  }

  reject() {
    this.ask({
      title: 'Từ chối hồ sơ ' + this.p.code, subtitle: 'Hồ sơ trả về kinh doanh kèm lý do để bổ sung', icon: 'block', tone: 'danger', danger: true,
      confirmLabel: 'Từ chối', field: 'text', fieldLabel: 'Lý do từ chối', required: true,
      requiredMessage: 'Nhập lý do từ chối để kinh doanh biết cần bổ sung gì.',
      suggestions: ['Thiếu giấy phép hoạt động', 'Thông tin người đại diện chưa đúng', 'Phòng khám ngoài khu vực phục vụ'],
    }, r => this.run('reject', {reason: r.text}, 'Đã từ chối hồ sơ.'));
  }

  suspend() {
    this.ask({
      title: 'Tạm ngưng ' + this.p.name, subtitle: 'Mở lại được bất cứ lúc nào, không đổi khoá', icon: 'pause_circle', tone: 'warn',
      confirmLabel: 'Tạm ngưng', warningTitle: 'Khi tạm ngưng:',
      warnings: ['Phòng khám không gửi được đơn mới; DocSoft báo "Nhà thuốc đang tạm ngưng nhận đơn".',
        'Đơn đã gửi vẫn xử lý bình thường; phòng khám vẫn xem danh mục, tồn kho, trạng thái đơn.'],
      field: 'text', fieldLabel: 'Lý do (ghi vào lịch sử)', suggestions: ['Quá hạn công nợ', 'Phòng khám tạm nghỉ', 'Đang rà soát hợp đồng'],
    }, r => this.run('suspend', {note: r.text}, 'Đã tạm ngưng nhận đơn của phòng khám.'));
  }

  changeBranch() {
    this.withOptions(o => this.ask({
      title: 'Đổi chi nhánh nhận đơn', subtitle: this.p.name + ' đang gửi đơn về ' + (this.p.branch || ''), icon: 'swap_horiz',
      confirmLabel: 'Đổi chi nhánh', field: 'branch', fieldLabel: 'Chi nhánh mới', branches: o.branches, currentBranchId: this.p.branch_id,
      warningTitle: 'Lưu ý:', warnings: ['Đơn mới gửi về chi nhánh mới; đơn đang xử lý vẫn ở chi nhánh cũ.', 'Khoá kết nối giữ nguyên, phòng khám không phải làm gì.'],
    }, r => this.run('change-branch', {branch_id: r.branchId}, 'Đã đổi chi nhánh nhận đơn.')));
  }

  rotateKey() {
    this.ask({
      title: 'Cấp lại khoá kết nối', subtitle: 'Dùng khi nghi lộ khoá', icon: 'key', tone: 'warn', confirmLabel: 'Cấp khoá mới',
      warningTitle: 'Khi cấp lại:', warnings: ['Khoá cũ (…' + (this.p.link ? this.p.link.key_last4 : '') + ') hết hiệu lực ngay.',
        'Khoá mới tự gắn sang DocSoft; nếu DocSoft lỗi, khoá hiện ra để gửi phòng khám nhập tay.'],
    }, () => this.run('rotate-key', {}, 'Đã cấp khoá mới.', 'Khoá kết nối mới'));
  }

  terminate() {
    this.ask({
      title: 'Ngừng hợp tác với ' + this.p.name, subtitle: 'Dữ liệu và công nợ giữ nguyên; mở lại hợp tác được', icon: 'link_off',
      tone: 'danger', danger: true, confirmLabel: 'Ngừng hợp tác', warningTitle: 'Khi ngừng hợp tác:',
      warnings: ['Khoá kết nối bị thu hồi: phòng khám không xem danh mục, không gửi đơn được nữa.',
        'DocSoft của phòng khám bị KHOÁ TOÀN BỘ: không ai đăng nhập được, kể cả khám bệnh, kê đơn.',
        'Công nợ còn lại vẫn theo dõi ở Đối soát phòng khám.'],
      field: 'text', fieldLabel: 'Lý do ngừng hợp tác', required: true,
      suggestions: ['Phòng khám chuyển sang nhà thuốc khác', 'Hết hạn hợp đồng', 'Vi phạm điều khoản thanh toán'],
    }, r => this.run('terminate', {note: r.text}, 'Đã ngừng hợp tác, DocSoft của phòng khám đã khoá.'));
  }

  reopen() {
    this.ask({
      title: 'Mở lại hợp tác với ' + this.p.name, subtitle: 'Dùng lại khách công ty cũ, công nợ liền mạch', icon: 'restart_alt',
      confirmLabel: 'Mở lại', warningTitle: 'Hệ thống sẽ:',
      warnings: ['Tạo liên kết + khoá mới với chi nhánh ' + (this.p.branch || '') + '.', 'Gắn khoá vào DocSoft và mở khoá DocSoft của phòng khám.'],
    }, () => this.run('reopen', {}, 'Đã mở lại hợp tác.'));
  }

  remove() {
    this.ask({
      title: 'Xoá hồ sơ ' + this.p.code, subtitle: 'Hồ sơ nháp / bị từ chối, chưa tạo gì cho phòng khám', icon: 'delete_outline',
      tone: 'danger', danger: true, confirmLabel: 'Xoá',
    }, () => {
      this.busy = true;
      this.partnerSer.remove(this.p.id).subscribe(() => {
        this.busy = false;
        this.notify.notify('success', 'Đã xoá hồ sơ.');
        this.back();
      }, err => this.fail(err));
    });
  }

  private ask(config: ClinicPartnerActionConfig, then: (r: { text: string, branchId: number }) => void) {
    this.dialog.open(ClinicPartnerActionDialogComponent, {width: '560px', maxWidth: '96vw', data: config, autoFocus: false})
      .afterClosed().subscribe(r => r && then(r));
  }

  private withOptions(then: (o: ClinicPartnerOptions) => void) {
    if (this.options) {
      then(this.options);
      return;
    }
    this.partnerSer.options().subscribe(o => {
      this.options = o;
      then(o);
    });
  }

  private run(action: string, body: any, done: string, credentialsTitle?: string) {
    this.busy = true;
    this.partnerSer.act(this.p.id, action, body).subscribe(res => {
      this.busy = false;
      this.apply(res, done, credentialsTitle);
    }, err => {
      this.fail(err);
      this.load(); // kích hoạt lỗi giữa chừng vẫn có bước đã xong
    });
  }

  private apply(res: ClinicPartnerDetail, done?: string, credentialsTitle?: string) {
    this.p = res;
    this.warning = res.warning || '';
    if (done) {
      this.notify.notify(res.warning ? 'warning' : 'success', done);
    }
    if (res.credentials) {
      this.dialog.open(ClinicPartnerCredentialsDialogComponent, {
        width: '600px', maxWidth: '96vw', disableClose: true, autoFocus: false,
        data: {title: credentialsTitle || 'Thông tin kết nối', warning: res.warning, credentials: res.credentials},
      });
    }
  }

  /** Thông báo lỗi do AuthInterceptor hiện sẵn (message của API), ở đây chỉ mở lại nút */
  private fail(err) {
    this.busy = false;
  }
}
