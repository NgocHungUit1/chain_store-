import {Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {Location} from '@angular/common';
import {MatDialog} from '@angular/material/dialog';
import {Subscription} from 'rxjs';
import {NotifierService} from 'angular-notifier';
import {ORDER_STATUS_CLASS, PrescriptionOrderDetail, PrescriptionOrderService} from '../prescription-order.service';
import {PrescriptionOrderReturnDialogComponent} from '../prescription-order-return-dialog/prescription-order-return-dialog.component';
import {getAllPermissions} from '../../shared/permission-storage';

@Component({
  selector: 'app-prescription-order-detail',
  templateUrl: './prescription-order-detail.component.html',
  styleUrls: ['../prescription-order.scss', './prescription-order-detail.component.scss']
})
export class PrescriptionOrderDetailComponent implements OnInit, OnDestroy {
  order: PrescriptionOrderDetail = null;
  loading = false;
  busy = false;
  notFound = false;
  statusClass = ORDER_STATUS_CLASS;
  private permissions: string[] = [];
  private sub: Subscription;

  constructor(
    private route: ActivatedRoute,
    private location: Location,
    private orderSer: PrescriptionOrderService,
    private dialog: MatDialog,
    private notify: NotifierService,
  ) {
  }

  ngOnInit(): void {
    this.permissions = getAllPermissions();
    // Bấm thông báo khi đang ở một chi tiết khác: cùng component, chỉ đổi :id
    this.sub = this.route.paramMap.subscribe(p => this.load(+p.get('id')));
  }

  ngOnDestroy(): void {
    if (this.sub) {
      this.sub.unsubscribe();
    }
  }

  load(id: number) {
    this.loading = true;
    this.notFound = false;
    this.orderSer.view(id).subscribe(res => {
      this.order = res;
      this.loading = false;
    }, err => {
      this.loading = false;
      this.order = null;
      this.notFound = err && err.status === 404;
      if (!this.notFound) {
        this.showError(err, 'Không tải được đơn đặt thuốc.');
      }
    });
  }

  get canConfirm(): boolean {
    return this.order && this.order.status === 'new' && this.permissions.indexOf('Prescription-Order.Confirm') >= 0;
  }

  get canReturn(): boolean {
    return this.order && ['new', 'confirmed'].indexOf(this.order.status) >= 0
      && this.permissions.indexOf('Prescription-Order.Return') >= 0;
  }

  get missingItems(): string[] {
    return this.order ? this.order.items.filter(i => !i.enough_stock).map(i => i.product_name) : [];
  }

  get age(): number | null {
    const dob = this.order && this.order.patient.dob;
    if (!dob) {
      return null;
    }
    const d = new Date(dob + 'T00:00:00');
    if (isNaN(d.getTime())) {
      return null;
    }
    const now = new Date();
    let years = now.getFullYear() - d.getFullYear();
    if (now.getMonth() < d.getMonth() || (now.getMonth() === d.getMonth() && now.getDate() < d.getDate())) {
      years--;
    }
    return years;
  }

  genderLabel(g: string): string {
    return g === 'male' ? 'Nam' : (g === 'female' ? 'Nữ' : '');
  }

  actorLabel(by: string): string {
    return by === 'clinic' ? 'Phòng khám' : (by === 'staff' ? 'Nhà thuốc' : 'Hệ thống');
  }

  back() {
    this.location.back();
  }

  confirm() {
    this.busy = true;
    this.orderSer.confirm(this.order.id).subscribe(res => {
      this.order = res;
      this.busy = false;
      this.notify.notify('success', `Đã xác nhận đơn ${res.code}.`);
    }, err => {
      this.busy = false;
      this.showError(err, 'Không xác nhận được đơn.');
      this.load(this.order.id);
    });
  }

  openReturn() {
    const ref = this.dialog.open(PrescriptionOrderReturnDialogComponent, {
      width: '520px',
      maxWidth: '95vw',
      data: {code: this.order.code, missing: this.missingItems},
    });
    ref.afterClosed().subscribe(result => {
      if (!result) {
        return;
      }
      this.busy = true;
      this.orderSer.returnOrder(this.order.id, result.reason, result.note).subscribe(res => {
        this.order = res;
        this.busy = false;
        this.notify.notify('success', `Đã trả đơn ${res.code} về phòng khám.`);
      }, err => {
        this.busy = false;
        this.showError(err, 'Không trả được đơn.');
        this.load(this.order.id);
      });
    });
  }

  private showError(err: any, fallback: string) {
    const msg = err && err.error && (err.error.message || (Array.isArray(err.error) && err.error[0] && err.error[0].message));
    this.notify.notify('error', msg || fallback);
  }
}
