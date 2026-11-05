import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {BranchShipper, PrescriptionOrderService} from '../prescription-order.service';

/**
 * Giao đơn cho shipper của chi nhánh, hoặc để trống cho shipper tự nhận (chốt S2, 05/11/2026).
 * Đóng với {shipperId: number | null}; bỏ qua thì đóng không giá trị.
 */
@Component({
  selector: 'app-prescription-order-assign-dialog',
  templateUrl: './prescription-order-assign-dialog.component.html',
  styleUrls: ['../prescription-order-return-dialog/prescription-order-return-dialog.component.scss',
    '../prescription-order-complete-dialog/prescription-order-complete-dialog.component.scss']
})
export class PrescriptionOrderAssignDialogComponent implements OnInit {
  shippers: BranchShipper[] = [];
  loading = true;
  /** 0 = để shipper tự nhận; undefined = chưa chọn */
  choice: number = undefined;

  constructor(
    public dialogRef: MatDialogRef<PrescriptionOrderAssignDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { code: string, clinic: string, address: string | null, currentShipperId: number | null },
    private orderSer: PrescriptionOrderService,
  ) {
  }

  ngOnInit(): void {
    this.orderSer.shippers().subscribe(res => {
      this.shippers = res || [];
      this.loading = false;
    }, () => this.loading = false);
  }

  submit() {
    if (this.choice === undefined) {
      return;
    }
    this.dialogRef.close({shipperId: this.choice === 0 ? null : this.choice});
  }
}
