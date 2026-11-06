import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Move, MoveDetail } from '../move.model';
import { MoveService } from '../move.service';
import { NotifierService } from 'angular-notifier';

/** Một dòng kiểm đếm: một lô (thuốc theo lô) hoặc một dòng thuốc không theo lô. Số lượng theo đơn vị cơ bản */
interface ReceiveLine {
  kind: 'parcel' | 'detail';
  id: number;
  productName: string;
  parcelNo: string;
  expirationDate: string;
  unitName: string;
  sent: number;
  received: number;
}

/**
 * Chi nhánh nhận kiểm đếm phiếu chuyển đang chuyển và xác nhận (chốt 06/11/2026): mặc định nhận đủ, sửa số thực nhận
 * khi thiếu (vỡ, thất lạc) kèm ghi chú. Xác nhận xong hàng / lô vào kho chi nhánh này.
 */
@Component({
  selector: 'app-move-receive-dialog',
  templateUrl: './move-receive-dialog.component.html',
  styleUrls: ['./move-receive-dialog.component.css']
})
export class MoveReceiveDialogComponent {
  lines: ReceiveLine[] = [];
  note = '';
  saving = false;

  constructor(
    public dialogRef: MatDialogRef<MoveReceiveDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { move: Move, details: MoveDetail[] },
    private moveService: MoveService,
    private notifySer: NotifierService,
  ) {
    for (const detail of data.details) {
      const product = detail.product || {};
      const unitName = product['base_unit'] || '';
      if (detail.parcels && detail.parcels.length) {
        for (const p of detail.parcels) {
          this.lines.push({kind: 'parcel', id: p.id, productName: product['product_name'], parcelNo: p.parcel_no,
            expirationDate: p.expiration_date, unitName, sent: p.quantity, received: p.quantity});
        }
      } else {
        const sent = Number(detail.amount) * Number(detail.productUnit ? detail.productUnit['value'] : 1);
        this.lines.push({kind: 'detail', id: Number(detail.id), productName: product['product_name'], parcelNo: '',
          expirationDate: '', unitName, sent, received: sent});
      }
    }
  }

  invalid(line: ReceiveLine): boolean {
    const v = Number(line.received);
    return line.received === null || line.received === undefined || String(line.received) === ''
      || !Number.isInteger(v) || v < 0 || v > line.sent;
  }

  hasInvalid(): boolean {
    return this.lines.some(l => this.invalid(l));
  }

  shortage(): number {
    return this.lines.reduce((sum, l) => sum + Math.max(l.sent - (Number(l.received) || 0), 0), 0);
  }

  confirm() {
    if (this.hasInvalid() || this.saving) {
      return;
    }
    if (this.shortage() > 0 && !this.note.trim()) {
      this.notifySer.notify('warning', 'Nhận thiếu hàng: ghi lý do (vỡ, thất lạc...) vào ô ghi chú.');
      return;
    }
    const parcels = {};
    const details = {};
    for (const l of this.lines) {
      (l.kind === 'parcel' ? parcels : details)[l.id] = Number(l.received);
    }
    this.saving = true;
    this.moveService.receive({id: this.data.move.id, parcels, details, note: this.note.trim()}).subscribe(() => {
      this.saving = false;
      this.notifySer.notify('success', 'Đã nhận hàng, hàng đã vào kho chi nhánh này.');
      this.dialogRef.close(true);
    }, () => {
      this.saving = false;
    });
  }
}
