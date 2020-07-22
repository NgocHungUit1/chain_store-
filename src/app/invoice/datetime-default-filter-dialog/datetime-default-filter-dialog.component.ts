import { D } from '@angular/cdk/keycodes';
import { Component, Inject, OnInit, Optional } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { NotifierService } from 'angular-notifier';
import { DateFilter } from '../invoice.model';
import { InvoiceService } from '../invoice.service';

@Component({
  selector: 'app-datetime-default-filter-dialog',
  templateUrl: './datetime-default-filter-dialog.component.html',
  styleUrls: ['./datetime-default-filter-dialog.component.css']
})
export class DatetimeDefaultFilterDialogComponent implements OnInit {

  local_data: any;
  public form: FormGroup;

  constructor(
    public dialogRef: MatDialogRef<DatetimeDefaultFilterDialogComponent>,
    public notifySer: NotifierService,
    private fb: FormBuilder,
    public invoiceService: InvoiceService,
    // @Optional() is used to prevent error if no data is passed
    @Optional() @Inject(MAT_DIALOG_DATA) public data: Object) {
    this.local_data = { ...data };
  }

  initForm() {


  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  ngOnInit(): void {
  }

  btnHomNay(): void {
    const today = new Date();
    const obj = new DateFilter();
    const date = this.invoiceService.convertDateYYYYMMDD(today);
    obj.date_from = date;
    obj.date_to = date;
    this.invoiceService.setDateFilter(obj);
    this.dialogRef.close({ 'title': 'Hôm nay' });
  }

  btnHomQua(): void {
    const today = new Date();
    const obj = new DateFilter();
    const homqua = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1);
    const date = this.invoiceService.convertDateYYYYMMDD(homqua);
    obj.date_from = date;
    obj.date_to = date;
    this.invoiceService.setDateFilter(obj);
    this.dialogRef.close({ 'title': 'Hôm  qua' });
  }

  btnTuanNay(): void {
    const today = new Date();
    const obj = new DateFilter();
    const dau_tuan = this.getMonday(today);
    obj.date_from = this.invoiceService.convertDateYYYYMMDD(dau_tuan);
    obj.date_to = this.invoiceService.convertDateYYYYMMDD(today);
    this.invoiceService.setDateFilter(obj);
    this.dialogRef.close({ 'title': 'Hôm này' });
  }

  btnTuanTruoc(): void {
    const today = new Date();
    const obj = new DateFilter();
    const dau_tuan = this.getMonday(today);

    console.log(this.getSunday(dau_tuan));

    obj.date_from = this.invoiceService.convertDateYYYYMMDD(dau_tuan);
    obj.date_to = this.invoiceService.convertDateYYYYMMDD(today);
    // this.invoiceService.setDateFilter(obj);
    // this.dialogRef.close({ 'title': 'Hôm này' });
  }

  getMonday(d) {
    d = new Date(d);
    const day = d.getDay(),
      diff = d.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
    return new Date(d.setDate(diff));
  }

  getSunday(d) {  // @NGHIA
    d = new Date(d);
    const day = d.getDay(),
      diff = d.getDate() - day - 1 + (day === 0 ? -6 : 1); // adjust when day is sunday
    return new Date(d.setDate(diff));
  }

}
