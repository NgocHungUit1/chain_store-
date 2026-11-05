import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {NotifierService} from 'angular-notifier';
import {CollectMethod, ShipperDelivery, ShipperService} from '../shipper.service';

/** Chi tiết một đơn giao trên điện thoại: gọi / chỉ đường, nhận đơn, lấy hàng, đã giao + thu tiền, giao không được */
@Component({
  selector: 'app-shipper-detail',
  templateUrl: './shipper-detail.component.html',
  styleUrls: ['../shipper.scss']
})
export class ShipperDetailComponent implements OnInit {
  d: ShipperDelivery;
  loading = true;
  busy = false;
  failReasons: string[] = [];
  /** Đang mở phần "Đã giao" hay "Giao không được" */
  mode: 'deliver' | 'fail' | null = null;
  method: CollectMethod = null;
  receiver = '';
  reason = '';
  failNote = '';
  error = '';

  constructor(
    private shipperSer: ShipperService,
    private notify: NotifierService,
    private route: ActivatedRoute,
    private router: Router,
  ) {
  }

  ngOnInit(): void {
    this.shipperSer.summary().subscribe(res => this.failReasons = res.fail_reasons || []);
    this.load();
  }

  load() {
    this.loading = true;
    this.shipperSer.view(+this.route.snapshot.paramMap.get('id')).subscribe(res => {
      this.d = res;
      this.loading = false;
    }, err => {
      this.loading = false;
      this.notify.notify('error', (err && err.error && err.error.message) || 'Không tải được đơn giao.');
    });
  }

  get mapUrl(): string | null {
    const address = this.d && this.d.clinic.address;
    return address ? 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(address) : null;
  }

  get telUrl(): string | null {
    const phone = this.d && this.d.clinic.phone;
    return phone ? 'tel:' + phone.replace(/[^0-9+]/g, '') : null;
  }

  /** Còn trong tay mình: được bấm giao không được */
  get canFail(): boolean {
    return this.d && this.d.assigned_to_me && (this.d.status === 'picking' || this.d.status === 'delivering');
  }

  back() {
    this.router.navigate(['/shipper'], {queryParams: {tab: this.d && (this.d.status === 'delivered' || this.d.status === 'failed') ? 'done' : 'mine'}});
  }

  open(mode: 'deliver' | 'fail') {
    this.mode = this.mode === mode ? null : mode;
    this.error = '';
  }

  take() {
    this.run(this.shipperSer.take(this.d.id), 'Đã nhận đơn. Lấy hàng ở quầy rồi bấm "Đã lấy hàng, đi giao".');
  }

  pickup() {
    this.busy = true;
    this.shipperSer.pickup([this.d.id]).subscribe(() => {
      this.busy = false;
      this.notify.notify('success', 'Đã lấy hàng, đơn đang giao.');
      this.load();
    }, err => this.fail$(err, 'Không lấy hàng được.'));
  }

  deliver() {
    if (!this.method) {
      this.error = 'Chọn cách thu tiền.';
      return;
    }
    this.run(this.shipperSer.deliver(this.d.id, this.method, this.receiver.trim()),
      this.method === 'debt' ? 'Đã giao, ghi nợ phòng khám.' : 'Đã giao và ghi nhận tiền thu.', true);
  }

  submitFail() {
    if (!this.reason.trim()) {
      this.error = 'Chọn hoặc nhập lý do.';
      return;
    }
    this.run(this.shipperSer.fail(this.d.id, this.reason.trim(), this.failNote.trim()), 'Đã báo giao không được, đơn về nhà thuốc.', true);
  }

  private run(req, okMessage: string, backAfter = false) {
    this.busy = true;
    req.subscribe(res => {
      this.busy = false;
      this.d = res;
      this.mode = null;
      this.notify.notify('success', okMessage);
      if (backAfter) {
        this.back();
      }
    }, err => this.fail$(err, 'Không thực hiện được.'));
  }

  private fail$(err, fallback: string) {
    this.busy = false;
    this.notify.notify('error', (err && err.error && err.error.message) || fallback);
    this.load();
  }
}
