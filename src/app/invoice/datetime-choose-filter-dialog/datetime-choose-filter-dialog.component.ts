import { Component, Inject, OnInit, Optional } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { NotifierService } from 'angular-notifier';
import { DateFilter } from '../invoice.model';
import { InvoiceService } from '../invoice.service';

@Component({
  selector: 'app-datetime-choose-filter-dialog',
  templateUrl: './datetime-choose-filter-dialog.component.html',
  styleUrls: ['./datetime-choose-filter-dialog.component.css']
})
export class DatetimeChooseFilterDialogComponent implements OnInit {

  local_data: any;

  constructor(
    public dialogRef: MatDialogRef<DatetimeChooseFilterDialogComponent>,
    public notifySer: NotifierService,
    public invoiceService: InvoiceService,
    private fb: FormBuilder,
    // @Optional() is used to prevent error if no data is passed
    @Optional() @Inject(MAT_DIALOG_DATA) public data: Object) {
    this.local_data = { ...data };
  }
  public form: FormGroup;


  initForm() {
    const date = this.invoiceService.getDateFilter();
    const date_from = new Date(date.date_from);
    const date_to = new Date(date.date_to);

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
      obj.date_from = this.invoiceService.convertDateYYYYMMDD(date_from);
      obj.date_to = this.invoiceService.convertDateYYYYMMDD(date_to);

      this.invoiceService.setDateFilter(obj);
      this.dialogRef.close();
    }
  }


}
