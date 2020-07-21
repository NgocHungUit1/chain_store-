import { Component, Inject, OnInit, Optional } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { NotifierService } from 'angular-notifier';

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
    private fb: FormBuilder,
    // @Optional() is used to prevent error if no data is passed
    @Optional() @Inject(MAT_DIALOG_DATA) public data: Object) {
    this.local_data = { ...data };
  }
  public form: FormGroup;


  initForm() {
    const today = new Date();
    const todayISOstring = today.toISOString();
    const year = today.getFullYear();
    const month = today.getMonth();
    const day = today.getDate();
    const nextYear = new Date(year + 1, month, day);
    const nextYearISOstring = nextYear.toISOString();
    this.form = this.fb.group({
      date_from: [
        todayISOstring
      ], // todayISOstring
      date_to: [
        nextYearISOstring
      ], // nextYearISOstring
    });
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  ngOnInit(): void {
    this.initForm();
  }

  submit() {

  }

}
