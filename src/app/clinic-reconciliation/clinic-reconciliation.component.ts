import {Component, OnInit} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {ActivatedRoute, Router} from '@angular/router';
import {addMonths, format} from 'date-fns';
import {NotifierService} from 'angular-notifier';
import {MatDialog} from '@angular/material/dialog';
import {ClinicCollectDialogComponent} from './clinic-collect-dialog.component';
import {getAllPermissions} from '../shared/permission-storage';
import {environment} from '../../environments/environment';
import {AuthService} from '../authentication/auth.service';

/**
 * Đối soát công nợ phòng khám liên kết theo tháng: nợ đầu kỳ, phát sinh (hoá đơn bốc thuốc), đã thanh toán,
 * còn nợ cuối kỳ; chi tiết từng hoá đơn và các lần trả tiền; xuất Excel gửi phòng khám xác nhận.
 * Số liệu cùng cách tính với Báo cáo › Công nợ thu (CustomerDebtService ở pharma_chain).
 */
@Component({
  selector: 'app-clinic-reconciliation',
  templateUrl: './clinic-reconciliation.component.html',
  styleUrls: ['../inventory-turnover/inventory-turnover.component.scss', './clinic-reconciliation.component.scss']
})
export class ClinicReconciliationComponent implements OnInit {
  month = format(new Date(), 'YYYY-MM');
  linkId: number = null;
  loading = false;
  clinics: any[] = [];
  detail: any = null;
  tab = 0; // 0 = Hoá đơn, 1 = Lịch sử thanh toán

  constructor(
    private http: HttpClient,
    private notify: NotifierService,
    private auth: AuthService,
    private route: ActivatedRoute,
    private router: Router,
    private dialog: MatDialog,
  ) {
  }

  ngOnInit(): void {
    const q = this.route.snapshot.queryParamMap;
    if (q.get('month')) {
      this.month = q.get('month');
    }
    if (q.get('link_id')) {
      this.linkId = +q.get('link_id');
    }
    this.load();
  }

  get monthLabel(): string {
    const [y, m] = (this.month || '').split('-');
    return m && y ? `tháng ${m}/${y}` : '';
  }

  /** Lập phiếu thu cần quyền Sổ quỹ */
  get canCollect(): boolean {
    return getAllPermissions().indexOf('Cash-Flow.Create') >= 0;
  }

  get totals(): any {
    return this.clinics.reduce((t, c) => ({
      order_count: t.order_count + c.order_count, increase: t.increase + c.increase, paid: t.paid + c.paid, closing: t.closing + c.closing,
    }), {order_count: 0, increase: 0, paid: 0, closing: 0});
  }

  get selected(): any {
    return this.clinics.find(c => c.link_id === this.linkId) || null;
  }

  load() {
    if (!/^\d{4}-\d{2}$/.test(this.month || '')) {
      this.notify.notify('warning', 'Chọn tháng cần đối soát');
      return;
    }
    this.loading = true;
    const params: any = {month: this.month};
    if (this.linkId) {
      params.link_id = String(this.linkId);
    }
    this.http.get<any>(environment.apiUrl + '/report/clinic-reconciliation', {params}).subscribe(res => {
      this.clinics = res?.clinics || [];
      this.detail = res?.detail || null;
      this.loading = false;
      // Chỉ có một phòng khám thì mở luôn chi tiết; nhiều phòng khám thì mặc định xem "Tất cả phòng khám"
      if (!this.linkId && this.clinics.length === 1) {
        this.selectClinic(this.clinics[0].link_id);
      }
    }, err => {
      this.loading = false;
      this.notify.notify('error', err?.error?.message || 'Không tải được đối soát');
    });
  }

  /** Dropdown: 0 = Tất cả phòng khám */
  selectClinic(linkId: number) {
    this.linkId = linkId || null;
    if (!this.linkId) {
      this.detail = null;
    }
    this.tab = 0;
    this.syncUrl();
    this.load();
  }

  shiftMonth(step: number) {
    this.month = format(addMonths(new Date(this.month + '-01T00:00:00'), step), 'YYYY-MM');
    this.syncUrl();
    this.load();
  }

  changeMonth() {
    this.syncUrl();
    this.load();
  }

  /**
   * Thu nợ: luôn tải lại các hoá đơn còn nợ tính tới hôm nay (đối soát tháng hiện tại liệt kê đủ: hoá đơn tháng này
   * + tháng trước còn nợ) — số trên màn có thể đã cũ nếu người khác vừa thu; mở hộp thoại nhập số tiền; lưu xong tải lại.
   */
  openCollect() {
    const current = format(new Date(), 'YYYY-MM');
    const open = (detail: any) => {
      const invoices = (detail?.invoices || []).filter(i => i.remaining > 0);
      if (!invoices.length) {
        this.notify.notify('info', 'Phòng khám không còn nợ hoá đơn nào');
        return;
      }
      this.dialog.open(ClinicCollectDialogComponent, {
        width: '760px', maxWidth: '95vw',
        data: {clinic: {name: detail.clinic.name, customer_id: detail.clinic.customer_id}, invoices},
      }).afterClosed().subscribe(res => {
        if (res && res.saved) {
          this.load();
        }
      });
    };
    this.http.get<any>(environment.apiUrl + '/report/clinic-reconciliation', {params: {month: current, link_id: String(this.linkId)}})
      .subscribe(res => open(res?.detail), err => this.notify.notify('error', err?.error?.message || 'Không tải được công nợ'));
  }

  exportExcel() {
    const url = environment.apiUrl + '/report/export-clinic-reconciliation?token=' + this.auth.getToken()
      + '&month=' + this.month + '&link_id=' + this.linkId;
    window.open(url, '_blank');
  }

  private syncUrl() {
    this.router.navigate([], {queryParams: {month: this.month, link_id: this.linkId || null}, replaceUrl: true});
  }
}
