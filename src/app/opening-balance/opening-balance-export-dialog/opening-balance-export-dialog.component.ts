import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import * as moment from 'moment';

/**
 * Chọn ngày chốt trước khi xuất phiếu tồn đầu kỳ nộp CSDL Dược: file lấy số tồn
 * CUỐI ngày được chọn. Mặc định hôm nay = tồn hiện tại.
 *
 * Đóng popup trả về chuỗi 'YYYY-MM-DD', bấm Huỷ trả về undefined.
 */
@Component({
  selector: 'app-opening-balance-export-dialog',
  templateUrl: './opening-balance-export-dialog.component.html',
})
export class OpeningBalanceExportDialogComponent {

  constructor(public dialogRef: MatDialogRef<OpeningBalanceExportDialogComponent>) {
  }

  today = new Date();
  date: Date = new Date();

  isToday(): boolean {
    return !!this.date && moment(this.date).isSame(moment(), 'day');
  }

  confirm() {
    if (!this.date || moment(this.date).isAfter(moment(), 'day')) {
      return;
    }
    this.dialogRef.close(moment(this.date).format('YYYY-MM-DD'));
  }
}
