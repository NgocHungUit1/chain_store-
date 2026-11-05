import {Component, OnInit} from '@angular/core';
import {NotifierService} from 'angular-notifier';
import {ShipperCashItem, ShipperCashRow, ShipperService} from '../shipper.service';

/**
 * Tài chính › Tiền shipper đang giữ (chốt S6, 05/11/2026): tiền mặt shipper thu khi giao đã trừ công nợ phòng khám
 * và vào sổ quỹ; thu ngân đếm tiền shipper nộp, tick các đơn đã nhận đủ rồi xác nhận.
 */
@Component({
  selector: 'app-shipper-cash',
  templateUrl: './shipper-cash.component.html',
  styleUrls: ['../../prescription-order/prescription-order.scss', './shipper-cash.component.scss']
})
export class ShipperCashComponent implements OnInit {
  rows: ShipperCashRow[] = [];
  history: ShipperCashItem[] = [];
  loading = false;
  busy = false;
  /** Shipper đang mở để nhận tiền */
  openId: number = null;
  items: ShipperCashItem[] = [];
  checked: { [id: number]: boolean } = {};

  constructor(private shipperSer: ShipperService, private notify: NotifierService) {
  }

  ngOnInit(): void {
    this.load();
  }

  load() {
    this.loading = true;
    this.shipperSer.cashList().subscribe(res => {
      this.rows = res || [];
      this.loading = false;
    }, err => {
      this.loading = false;
      this.showError(err, 'Không tải được tiền shipper đang giữ.');
    });
    this.shipperSer.cashHistory().subscribe(res => this.history = res || []);
  }

  get total(): number {
    return this.rows.reduce((s, r) => s + r.amount, 0);
  }

  toggle(r: ShipperCashRow) {
    if (this.openId === r.shipper_id) {
      this.openId = null;
      return;
    }
    this.openId = r.shipper_id;
    this.items = [];
    this.shipperSer.cashItems(r.shipper_id).subscribe(res => {
      this.items = res || [];
      this.checked = {};
      this.items.forEach(i => this.checked[i.id] = true);
    });
  }

  get checkedIds(): number[] {
    return this.items.filter(i => this.checked[i.id]).map(i => i.id);
  }

  get checkedAmount(): number {
    return this.items.filter(i => this.checked[i.id]).reduce((s, i) => s + i.amount, 0);
  }

  receive() {
    const ids = this.checkedIds;
    if (!ids.length) {
      return;
    }
    this.busy = true;
    this.shipperSer.receive(ids).subscribe(res => {
      this.busy = false;
      this.openId = null;
      this.notify.notify('success', `Đã nhận tiền ${res.count} đơn.`);
      this.load();
    }, err => {
      this.busy = false;
      this.showError(err, 'Không xác nhận nhận tiền được.');
      this.load();
    });
  }

  private showError(err, fallback: string) {
    this.notify.notify('error', (err && err.error && err.error.message) || fallback);
  }
}
