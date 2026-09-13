import { Component, Inject, OnInit, Optional } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { NotifierService } from 'angular-notifier';

@Component({
  selector: 'app-stock-take-balance-dialog',
  templateUrl: './stock-take-balance-dialog.component.html',
  styleUrls: ['./stock-take-balance-dialog.component.css']
})
export class StockTakeBalanceDialogComponent implements OnInit {

  action: string;
  title: string;
  content: string;
  local_data: any;

  /** Dòng có tồn hiện tại khác số đã chốt: {product_no, product_name, parcel_no, unit_name, snapshot, current, actual_number} */
  changes: any[] = [];
  /** 'subtract' = cộng phần phát sinh vào số thực tế · 'keep' = giữ số đã đếm */
  mode = 'subtract';

  constructor(
    public dialogRef: MatDialogRef<StockTakeBalanceDialogComponent>,
    public notifySer: NotifierService,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: Object) {
    this.local_data = { ...data };
    this.action = this.local_data.action;
    this.title = this.local_data.title;
    this.content = this.local_data.content;
    this.changes = this.local_data.changes || [];
  }

  ngOnInit(): void {
  }

  /** Số thực tế sẽ lưu nếu chọn "trừ phần phát sinh". */
  adjustedActual(change): number {
    return Math.max(0, Number(change.actual_number) + (change.current - change.snapshot));
  }

  closeDialog() {
    this.dialogRef.close({ event: 'cancel' });
  }

  submit() {
    this.dialogRef.close({ event: 'accept', mode: this.mode });
  }

}
