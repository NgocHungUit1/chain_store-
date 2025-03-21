import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-datetime-default-filter-dialog',
  template: `
    <h2 mat-dialog-title>Chọn thời gian</h2>
    <mat-dialog-content>
      <mat-selection-list #timeList [multiple]="false">
        <mat-list-option value="thisMonth" selected>Tháng này</mat-list-option>
        <mat-list-option value="lastMonth">Tháng trước</mat-list-option>
        <mat-list-option value="thisYear">Năm nay</mat-list-option>
      </mat-selection-list>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Hủy</button>
      <button mat-raised-button color="primary"
              (click)="selectTime(timeList.selectedOptions.selected[0]?.value)">
        Chọn
      </button>
    </mat-dialog-actions>
  `
})
export class DatetimeDefaultFilterDialogComponent {
  constructor(public dialogRef: MatDialogRef<DatetimeDefaultFilterDialogComponent>) {}

  selectTime(value: string) {
    let title = 'Tháng này';
    switch(value) {
      case 'lastMonth':
        title = 'Tháng trước';
        break;
      case 'thisYear':
        title = 'Năm nay';
        break;
    }
    this.dialogRef.close({ title, value });
  }
}
