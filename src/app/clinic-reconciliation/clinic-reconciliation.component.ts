import {Component, OnInit} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {ActivatedRoute, Router} from '@angular/router';
import {addMonths, format} from 'date-fns';
import {NotifierService} from 'angular-notifier';
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

  constructor(
    private http: HttpClient,
    private notify: NotifierService,
    private auth: AuthService,
    private route: ActivatedRoute,
    private router: Router,
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
      // Chưa chọn phòng khám: mở luôn phòng khám đầu danh sách (thường chỉ có một)
      if (!this.linkId && this.clinics.length) {
        this.selectClinic(this.clinics[0].link_id);
      }
    }, err => {
      this.loading = false;
      this.notify.notify('error', err?.error?.message || 'Không tải được đối soát');
    });
  }

  selectClinic(linkId: number) {
    this.linkId = linkId;
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

  exportExcel() {
    const url = environment.apiUrl + '/report/export-clinic-reconciliation?token=' + this.auth.getToken()
      + '&month=' + this.month + '&link_id=' + this.linkId;
    window.open(url, '_blank');
  }

  private syncUrl() {
    this.router.navigate([], {queryParams: {month: this.month, link_id: this.linkId || null}, replaceUrl: true});
  }
}
