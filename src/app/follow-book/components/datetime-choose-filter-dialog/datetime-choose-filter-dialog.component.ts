import { Component, OnInit, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DateFilterResult } from '../datetime-default-filter-dialog/datetime-default-filter-dialog.component';

@Component({
  selector: 'app-datetime-choose-filter-dialog',
  template: `
    <h2 mat-dialog-title>Chọn khoảng thời gian</h2>
    <form [formGroup]="form" (ngSubmit)="submit()">
      <div mat-dialog-content>
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Từ ngày</mat-label>
          <input matInput [matDatepicker]="fromPicker" formControlName="fromDate">
          <mat-datepicker-toggle matSuffix [for]="fromPicker"></mat-datepicker-toggle>
          <mat-datepicker #fromPicker></mat-datepicker>
          <mat-error *ngIf="form.get('fromDate').hasError('required')">
            Vui lòng chọn ngày bắt đầu
          </mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Đến ngày</mat-label>
          <input matInput [matDatepicker]="toPicker" formControlName="toDate">
          <mat-datepicker-toggle matSuffix [for]="toPicker"></mat-datepicker-toggle>
          <mat-datepicker #toPicker></mat-datepicker>
          <mat-error *ngIf="form.get('toDate').hasError('required')">
            Vui lòng chọn ngày kết thúc
          </mat-error>
        </mat-form-field>

        <div *ngIf="form.hasError('dateRange')" class="error-message">
          Ngày kết thúc phải sau ngày bắt đầu
        </div>
      </div>

      <div mat-dialog-actions align="end">
        <button mat-button type="button" mat-dialog-close>
          <mat-icon>cancel</mat-icon> Hủy
        </button>
        <button mat-raised-button color="primary" type="submit" [disabled]="form.invalid">
          <mat-icon>check_circle</mat-icon> Xác nhận
        </button>
      </div>
    </form>
  `,
  styles: [`
    .full-width {
      width: 100%;
      margin-bottom: 16px;
    }
    .error-message {
      color: #f44336;
      font-size: 12px;
      margin-top: -8px;
      margin-bottom: 16px;
    }
  `]
})
export class DatetimeChooseFilterDialogComponent implements OnInit {
  form: FormGroup;

  constructor(
    public dialogRef: MatDialogRef<DatetimeChooseFilterDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder
  ) {}

  ngOnInit() {
    this.initForm();
  }

  initForm() {
    // Convert string date to Date object if available
    let fromDate = this.data?.date_from ? new Date(this.data.date_from) : new Date();
    let toDate = this.data?.date_to ? new Date(this.data.date_to) : new Date();

    this.form = this.fb.group({
      fromDate: [fromDate, Validators.required],
      toDate: [toDate, Validators.required]
    }, { validators: this.dateRangeValidator });
  }

  dateRangeValidator(formGroup: FormGroup) {
    const fromDate = formGroup.get('fromDate').value;
    const toDate = formGroup.get('toDate').value;

    if (fromDate && toDate) {
      const from = new Date(fromDate);
      const to = new Date(toDate);
      if (from > to) {
        return { dateRange: true };
      }
    }

    return null;
  }

  submit() {
    if (this.form.valid) {
      const fromDate = new Date(this.form.get('fromDate').value);
      const toDate = new Date(this.form.get('toDate').value);

      const fromFormatted = this.formatDate(fromDate);
      const toFormatted = this.formatDate(toDate);
      const displayTitle = `${this.formatDisplayDate(fromDate)} - ${this.formatDisplayDate(toDate)}`;

      const result: DateFilterResult = {
        title: displayTitle,
        filter_key: 'custom',
        date_from: fromFormatted,
        date_to: toFormatted,
        skip_filter: false
      };

      this.dialogRef.close(result);
    }
  }

  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private formatDisplayDate(date: Date): string {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }
}
