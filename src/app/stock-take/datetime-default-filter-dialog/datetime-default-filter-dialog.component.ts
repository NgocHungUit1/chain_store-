import { Component, Inject, OnInit, Optional } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { NotifierService } from 'angular-notifier';
import { InvoiceService } from '../../invoice/invoice.service';
import { DateFilter } from '../../invoice/invoice.model';
import { StockTakeService } from '../stock-take.service';

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
    public stockTakeService: StockTakeService,
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
    const date = this.stockTakeService.convertDateYYYYMMDD(today);
    obj.date_from = date;
    obj.date_to = date;
    this.stockTakeService.setDateFilter(obj);
    this.dialogRef.close({ 'title': 'Hôm nay' });
  }

  btnHomQua(): void {
    const today = new Date();
    const obj = new DateFilter();
    const homqua = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1);
    const date = this.stockTakeService.convertDateYYYYMMDD(homqua);
    obj.date_from = date;
    obj.date_to = date;
    this.stockTakeService.setDateFilter(obj);
    this.dialogRef.close({ 'title': 'Hôm  qua' });
  }

  btnTuanNay(): void {
    const today = new Date();
    const obj = new DateFilter();
    const dau_tuan = this.getNearMonday(today);
    obj.date_from = this.stockTakeService.convertDateYYYYMMDD(dau_tuan);
    obj.date_to = this.stockTakeService.convertDateYYYYMMDD(today);
    this.stockTakeService.setDateFilter(obj);
    this.dialogRef.close({ 'title': 'Tuần này' });
  }

  btnTuanTruoc(): void {
    const today = new Date();
    const obj = new DateFilter();
    const dau_tuan_nay = this.getNearMonday(today);
    const chu_nhat_tuan_truoc = this.getNearSunday(dau_tuan_nay);
    const thu_hai_tuan_truoc = this.getNearMonday(chu_nhat_tuan_truoc);
    // const dateChoose = new Date(2020, 6, 3);

    obj.date_from = this.stockTakeService.convertDateYYYYMMDD(thu_hai_tuan_truoc);
    obj.date_to = this.stockTakeService.convertDateYYYYMMDD(chu_nhat_tuan_truoc);
    this.stockTakeService.setDateFilter(obj);
    this.dialogRef.close({ 'title': 'Tuần trước' });
  }

  btnThangNay(): void {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    const first = new Date(year, month, 1);
    const obj = new DateFilter();
    // tháng này
    obj.date_from = this.stockTakeService.convertDateYYYYMMDD(first);
    obj.date_to = this.stockTakeService.convertDateYYYYMMDD(today);
    this.stockTakeService.setDateFilter(obj);
    this.dialogRef.close({ 'title': 'Tháng này' });
  }

  btnThangTruoc(): void {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    const first = new Date(year, month - 1, 1);
    const end = new Date(year, month, 0);

    const obj = new DateFilter();
    // tháng này
    obj.date_from = this.stockTakeService.convertDateYYYYMMDD(first);
    obj.date_to = this.stockTakeService.convertDateYYYYMMDD(end);
    this.stockTakeService.setDateFilter(obj);
    this.dialogRef.close({ 'title': 'Tháng trước' });
  }

  // out put ngay thu 2 gan nhat
  getNearMonday(d) {
    d = new Date(d);
    const day = d.getDay(),
      diff = d.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
    return new Date(d.setDate(diff));
  }

  // output ngay chu nhat gan nhat
  getNearSunday(d) {
    d = new Date(d);
    const day = d.getDay(),
      diff = d.getDate() - day - 1 + (day === 0 ? -6 : 1); // adjust when day is sunday
    return new Date(d.setDate(diff));
  }

}
