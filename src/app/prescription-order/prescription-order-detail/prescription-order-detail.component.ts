import {Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {Location} from '@angular/common';
import {MatDialog} from '@angular/material/dialog';
import {Subscription} from 'rxjs';
import {NotifierService} from 'angular-notifier';
import {ORDER_STATUS_CLASS, PrescriptionOrderDetail, PrescriptionOrderService} from '../prescription-order.service';
import {PrescriptionOrderReturnDialogComponent} from '../prescription-order-return-dialog/prescription-order-return-dialog.component';
import {PrescriptionOrderCompleteDialogComponent} from '../prescription-order-complete-dialog/prescription-order-complete-dialog.component';
import {PrescriptionOrderWarnDialogComponent} from '../prescription-order-warn-dialog/prescription-order-warn-dialog.component';
import {PrescriptionOrderAssignDialogComponent} from '../prescription-order-assign-dialog/prescription-order-assign-dialog.component';
import {OrderService} from '../../sale/order.service';
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
    private router: Router,
    private saleOrderSer: OrderService,
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
    return this.order && (['new', 'confirmed'].indexOf(this.order.status) >= 0 || this.preparingNoInvoice)
      && this.permissions.indexOf('Prescription-Order.Return') >= 0;
  }

  private get preparingNoInvoice(): boolean {
    return this.order && this.order.status === 'preparing' && !this.order.invoice_id;
  }

  /** Bốc thuốc: đơn đã xác nhận, hoặc đang soạn mà chưa lưu hoá đơn (mở lại màn bán hàng) */
  get canPick(): boolean {
    return this.order && (this.order.status === 'confirmed' || this.preparingNoInvoice)
      && this.permissions.indexOf('Prescription-Order.Pick') >= 0;
  }

  get canUnpick(): boolean {
    return this.preparingNoInvoice && this.permissions.indexOf('Prescription-Order.Unpick') >= 0;
  }

  /** Đang soạn, đã lập hoá đơn, chưa giao cho shipper: giao cho shipper hoặc phòng khám tự lấy (chốt S9) */
  private get readyToDeliver(): boolean {
    return this.order && this.order.status === 'preparing' && !!this.order.invoice_id && !(this.order.delivery && this.order.delivery.active);
  }

  get canAssign(): boolean {
    return this.readyToDeliver && this.permissions.indexOf('Prescription-Order.Assign-Shipper') >= 0;
  }

  get canSelfPickup(): boolean {
    return this.readyToDeliver && this.permissions.indexOf('Prescription-Order.Complete') >= 0;
  }

  /** Phiếu giao chưa lấy hàng: đổi người / huỷ giao được */
  private get deliveryNotPicked(): boolean {
    const d = this.order && this.order.delivery;
    return !!d && (d.status === 'created' || d.status === 'picking');
  }

  get canChangeShipper(): boolean {
    return this.deliveryNotPicked && this.permissions.indexOf('Prescription-Order.Assign-Shipper') >= 0;
  }

  get canCancelDelivery(): boolean {
    return this.deliveryNotPicked && this.permissions.indexOf('Prescription-Order.Cancel-Delivery') >= 0;
  }

  /** Đơn đang giao kiểu cũ (nhân viên tự giao, không có phiếu giao shipper) */
  get canComplete(): boolean {
    return this.order && this.order.status === 'delivering' && !(this.order.delivery && this.order.delivery.active)
      && this.permissions.indexOf('Prescription-Order.Complete') >= 0;
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
    // Vượt hạn mức nợ: chỉ cảnh báo, vẫn xác nhận được (chốt Q6, P3)
    if (this.order.credit && this.order.credit.over_limit) {
      this.warn({
        title: 'Vượt hạn mức nợ', subtitle: (this.order.clinic?.name || 'Phòng khám') + ' · đơn ' + this.order.code,
        message: this.order.credit.message, confirmLabel: 'Vẫn xác nhận', icon: 'check_circle',
      }, () => this.doConfirm());
      return;
    }
    this.doConfirm();
  }

  private doConfirm() {
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

  /** Mở màn bán hàng với tab hoá đơn dựng sẵn từ đơn (khách = phòng khám, đúng thuốc, ghi nợ) */
  pick() {
    if (!this.order.all_in_stock) {
      this.warn({
        title: 'Chi nhánh không đủ hàng', subtitle: 'Đơn ' + this.order.code,
        message: 'Không đủ hàng cho ' + this.missingItems.join(', ') + '.',
        hint: 'Thiếu hàng thì nên trả đơn để bác sĩ sửa. Vẫn mở màn bán hàng?', confirmLabel: 'Vẫn bốc thuốc', icon: 'shopping_cart',
      }, () => this.doPick());
      return;
    }
    this.doPick();
  }

  private doPick() {
    this.busy = true;
    this.orderSer.pick(this.order.id).subscribe(res => {
      this.busy = false;
      this.order = res.order;
      this.saleOrderSer.addPrescriptionOrderInvoice(res.cart);
      this.router.navigate(['/sale']);
    }, err => {
      this.busy = false;
      this.showError(err, 'Không bốc thuốc được.');
      this.load(this.order.id);
    });
  }

  unpick() {
    this.runAction(this.orderSer.unpick(this.order.id), 'Đã huỷ soạn, đơn về Đã xác nhận.', 'Không huỷ soạn được.');
  }

  openAssign() {
    const ref = this.dialog.open(PrescriptionOrderAssignDialogComponent, {
      width: '480px',
      maxWidth: '95vw',
      data: {code: this.order.code, clinic: this.order.clinic?.name || 'Phòng khám', address: this.order.clinic?.address || null,
        currentShipperId: this.order.delivery && this.order.delivery.active ? this.order.delivery.shipper_id : null},
    });
    ref.afterClosed().subscribe(result => {
      if (!result) {
        return;
      }
      this.runAction(this.orderSer.assignShipper(this.order.id, result.shipperId),
        result.shipperId ? 'Đã giao đơn cho shipper.' : 'Đơn đã vào danh sách chờ shipper nhận.', 'Không giao cho shipper được.');
    });
  }

  cancelDelivery() {
    this.runAction(this.orderSer.cancelDelivery(this.order.id), 'Đã huỷ giao, đơn về chờ giao.', 'Không huỷ giao được.');
  }

  /** selfPickup: phòng khám tự đến lấy (đơn đang soạn); false: hoàn thành đơn đang giao kiểu cũ */
  openComplete(selfPickup: boolean) {
    const ref = this.dialog.open(PrescriptionOrderCompleteDialogComponent, {
      width: '520px',
      maxWidth: '95vw',
      data: {code: this.order.code, clinic: this.order.clinic?.name || 'Phòng khám',
        invoiceNo: this.order.invoice?.invoice_no, debt: this.order.invoice?.debt || 0, selfPickup},
    });
    ref.afterClosed().subscribe(result => {
      if (!result) {
        return;
      }
      this.runAction(this.orderSer.complete(this.order.id, result.method),
        result.method === 'debt' ? 'Đã hoàn thành đơn, ghi nợ phòng khám.' : 'Đã hoàn thành đơn và ghi phiếu trả nợ.', 'Không hoàn thành được đơn.');
    });
  }

  private warn(data: { title: string, subtitle: string, message: string, hint?: string, confirmLabel: string, icon: string }, onOk: () => void) {
    this.dialog.open(PrescriptionOrderWarnDialogComponent, {width: '480px', maxWidth: '95vw', data})
      .afterClosed().subscribe(ok => ok && onOk());
  }

  private runAction(req, okMessage: string, fallback: string) {
    this.busy = true;
    req.subscribe(res => {
      this.order = res;
      this.busy = false;
      this.notify.notify('success', okMessage);
    }, err => {
      this.busy = false;
      this.showError(err, fallback);
      this.load(this.order.id);
    });
  }

  private showError(err: any, fallback: string) {
    const msg = err && err.error && (err.error.message || (Array.isArray(err.error) && err.error[0] && err.error[0].message));
    this.notify.notify('error', msg || fallback);
  }
}
