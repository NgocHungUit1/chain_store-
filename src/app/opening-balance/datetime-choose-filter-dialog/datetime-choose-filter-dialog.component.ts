import { Component, Inject, OnInit, Optional } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { NotifierService } from 'angular-notifier';
import { DateFilter } from '../../invoice/invoice.model';
import { OpeningBalanceService } from '../opening-balance.service';
import { MatDateProviders } from '../../shared/providers/mat-date.provider';

/**
 * Bản sao bộ chọn khoảng ngày dùng chung của app, gắn vào OpeningBalanceService.
 */
@Component({
  selector: 'app-datetime-choose-filter-dialog',
  templateUrl: './datetime-choose-filter-dialog.component.html',
  styleUrls: ['./datetime-choose-filter-dialog.component.css'],
  providers: [...MatDateProviders]
})
export class DatetimeChooseFilterDialogComponent implements OnInit {

  local_data: any;

  constructor(
    public dialogRef: MatDialogRef<DatetimeChooseFilterDialogComponent>,
    public notifySer: NotifierService,
    public openingBalanceService: OpeningBalanceService,
    private fb: FormBuilder,
    // @Optional() is used to prevent error if no data is passed
    @Optional() @Inject(MAT_DIALOG_DATA) public data: Object) {
    this.local_data = { ...data };
  }
  public form: FormGroup;


  initForm() {
    // Sau khi chọn "Toàn thời gian" thì date_from/date_to là null; new Date(null)
    // cho ra 01/01/1970 nên phải mặc định về khoảng 3 tháng gần nhất.
    const date = this.openingBalanceService.getDateFilter();
    const date_to = date && date.date_to ? new Date(date.date_to) : new Date();
    const date_from = date && date.date_from
      ? new Date(date.date_from)
      : new Date(date_to.getFullYear(), date_to.getMonth() - 3, date_to.getDate());

    this.form = this.fb.group({
      date_from: [
        date_from.toISOString(),
        Validators.compose([
          Validators.required,
          Validators.maxLength(32)
        ])
      ],
      date_to: [
        date_to.toISOString(),
        Validators.compose([
          Validators.required,
          Validators.maxLength(32)
        ])
      ],
    });
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  ngOnInit(): void {
    this.initForm();
  }

  submit() {
    if (this.form.valid) {
      const data = this.form.getRawValue();
      const obj = new DateFilter();
      let date_from;
      let date_to;
      if (data['date_from'] !== null) {
        date_from = new Date(data['date_from']);
      }
      if (data['date_to'] !== null) {
        date_to = new Date(data['date_to']);
      }
      // kiem tra date from lon hon date to
      if (date_to - date_from < 0) {
        date_from = date_to;
      }
      obj.date_from = this.openingBalanceService.convertDateYYYYMMDD(date_from);
      obj.date_to = this.openingBalanceService.convertDateYYYYMMDD(date_to);

      this.openingBalanceService.setDateFilter(obj);
      this.dialogRef.close();
    }
  }


}
