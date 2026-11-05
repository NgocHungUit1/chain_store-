import {Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {interval, Subscription} from 'rxjs';
import {NotifierService} from 'angular-notifier';
import {ShipperDelivery, ShipperService, ShipperSummary, ShipperTab} from '../shipper.service';
import {AuthService} from '../../authentication/auth.service';
import {getAllPermissions} from '../../shared/permission-storage';
import {isShipperOnly} from '../../shared/shipper-only';

/** Trang giao hàng trên điện thoại: chờ nhận / của tôi / đã giao (chốt S1–S10, 05/11/2026) */
@Component({
  selector: 'app-shipper-home',
  templateUrl: './shipper-home.component.html',
  styleUrls: ['../shipper.scss']
})
export class ShipperHomeComponent implements OnInit, OnDestroy {
  /** Tự làm mới danh sách (giây), như chuông đơn mới của nhà thuốc */
  static readonly REFRESH_SECONDS = 30;

  tabs: { key: ShipperTab, label: string }[] = [
    {key: 'waiting', label: 'Chờ nhận'},
    {key: 'mine', label: 'Của tôi'},
    {key: 'done', label: 'Đã giao'},
  ];
  tab: ShipperTab = 'mine';
  summary: ShipperSummary;
  rows: ShipperDelivery[] = [];
  loading = false;
  busy = false;
  /** Đơn đã chọn để bấm "Đã lấy hàng" một lần (tab Của tôi) */
  picked: { [id: number]: boolean } = {};
  shipperOnly = false;

  private timer: Subscription;

  constructor(
    private shipperSer: ShipperService,
    private authSer: AuthService,
    private notify: NotifierService,
    public router: Router,
    private route: ActivatedRoute,
  ) {
  }

  ngOnInit(): void {
    this.shipperOnly = isShipperOnly(getAllPermissions());
    const tab = this.route.snapshot.queryParamMap.get('tab') as ShipperTab;
    if (tab && this.tabs.some(t => t.key === tab)) {
      this.tab = tab;
    }
    this.refresh(true);
    this.timer = interval(ShipperHomeComponent.REFRESH_SECONDS * 1000).subscribe(() => this.refresh(false));
  }

  ngOnDestroy(): void {
    if (this.timer) {
      this.timer.unsubscribe();
    }
  }

  refresh(showLoading: boolean) {
    this.shipperSer.summary().subscribe(res => {
      this.summary = res;
      // Mở trang lần đầu: chưa có đơn của mình mà có đơn chờ nhận thì mở tab Chờ nhận
      if (showLoading && !this.route.snapshot.queryParamMap.get('tab') && res.counts.mine === 0 && res.counts.waiting > 0 && this.tab === 'mine') {
        this.selectTab('waiting');
      }
    });
    this.load(showLoading);
  }

  load(showLoading = true) {
    this.loading = showLoading;
    this.shipperSer.list(this.tab).subscribe(res => {
      this.rows = res || [];
      const picked = {};
      // Mặc định chọn sẵn mọi đơn đang lấy hàng; giữ lựa chọn của shipper khi tự làm mới
      this.rows.filter(r => r.status === 'picking').forEach(r => picked[r.id] = this.picked[r.id] !== undefined ? this.picked[r.id] : true);
      this.picked = picked;
      this.loading = false;
    }, err => {
      this.loading = false;
      this.showError(err, 'Không tải được danh sách đơn giao.');
    });
  }

  selectTab(tab: ShipperTab) {
    if (this.tab === tab) {
      return;
    }
    this.tab = tab;
    this.picked = {};
    this.router.navigate([], {relativeTo: this.route, queryParams: {tab}, replaceUrl: true});
    this.load();
  }

  count(tab: ShipperTab): number {
    return this.summary ? this.summary.counts[tab] : 0;
  }

  get pickedIds(): number[] {
    return Object.keys(this.picked).filter(id => this.picked[id]).map(id => +id);
  }

  togglePick(d: ShipperDelivery, event: Event) {
    event.stopPropagation();
    this.picked[d.id] = !this.picked[d.id];
  }

  take(d: ShipperDelivery, event: Event) {
    event.stopPropagation();
    this.busy = true;
    this.shipperSer.take(d.id).subscribe(() => {
      this.busy = false;
      this.notify.notify('success', `Đã nhận đơn ${d.order_code}. Lấy hàng ở quầy rồi bấm "Đã lấy hàng, đi giao".`);
      this.selectTab('mine');
      this.refresh(false);
    }, err => {
      this.busy = false;
      this.showError(err, 'Không nhận được đơn.');
      this.refresh(false);
    });
  }

  pickup() {
    const ids = this.pickedIds;
    if (!ids.length) {
      return;
    }
    this.busy = true;
    this.shipperSer.pickup(ids).subscribe(res => {
      this.busy = false;
      this.notify.notify('success', `Đã lấy hàng ${res.count} đơn, phòng khám thấy đơn đang giao.`);
      this.refresh(false);
    }, err => {
      this.busy = false;
      this.showError(err, 'Không lấy hàng được.');
      this.refresh(false);
    });
  }

  open(d: ShipperDelivery) {
    this.router.navigate(['/shipper', d.id]);
  }

  logout() {
    this.authSer.logout().subscribe(() => this.router.navigate(['/', 'authentication', 'login']));
  }

  private showError(err, fallback: string) {
    this.notify.notify('error', (err && err.error && err.error.message) || fallback);
  }
}
