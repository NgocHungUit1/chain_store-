import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-datetime-choose-filter-dialog',
  template: `
    <h2 mat-dialog-title>Chọn khoảng thời gian</h2>
    <mat-dialog-content>
      <mat-form-field appearance="outline" class="full-width">
        <mat-label>Từ ngày</mat-label>
        <input matInput [matDatepicker]="fromPicker" [(ngModel)]="fromDate">
        <mat-datepicker-toggle matSuffix [for]="fromPicker"></mat-datepicker-toggle>
        <mat-datepicker #fromPicker></mat-datepicker>
      </mat-form-field>

      <mat-form-field appearance="outline" class="full-width">
        <mat-label>Đến ngày</mat-label>
        <input matInput [matDatepicker]="toPicker" [(ngModel)]="toDate">
        <mat-datepicker-toggle matSuffix [for]="toPicker"></mat-datepicker-toggle>
        <mat-datepicker #toPicker></mat-datepicker>
      </mat-form-field>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Hủy</button>
      <button mat-raised-button color="primary"
              (click)="dialogRef.close({fromDate: fromDate, toDate: toDate})">
        Chọn
      </button>
    </mat-dialog-actions>
  `,
  styles: ['.full-width { width: 100%; margin-bottom: 16px; }']
})
export class DatetimeChooseFilterDialogComponent implements OnInit {
  fromDate: Date;
  toDate: Date;

  constructor(
    public dialogRef: MatDialogRef<DatetimeChooseFilterDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit() {
    this.fromDate = this.data?.fromDate || new Date();
    this.toDate = this.data?.toDate || new Date();
  }
}
