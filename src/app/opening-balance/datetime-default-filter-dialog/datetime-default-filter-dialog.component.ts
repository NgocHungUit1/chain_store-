import { Component, Inject, OnInit, Optional } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { NotifierService } from 'angular-notifier';
import { DateFilter } from '../../invoice/invoice.model';
import { OpeningBalanceService } from '../opening-balance.service';
import * as moment from 'moment';

/**
 * Bản sao bộ lọc thời gian dùng chung của app, gắn vào OpeningBalanceService.
 * Mỗi module tự khai báo một bản (giống stock-take, customer, doctor) để state
 * ngày lọc không lẫn sang màn khác.
 */
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
    public openingBalanceService: OpeningBalanceService,
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
    const date = this.openingBalanceService.convertDateYYYYMMDD(today);
    obj.date_from = date;
    obj.date_to = date;
    this.openingBalanceService.setDateFilter(obj);
    this.dialogRef.close({ 'title': 'Hôm nay' });
  }

  btnHomQua(): void {
    const today = new Date();
    const obj = new DateFilter();
    const homqua = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1);
    const date = this.openingBalanceService.convertDateYYYYMMDD(homqua);
    obj.date_from = date;
    obj.date_to = date;
    this.openingBalanceService.setDateFilter(obj);
    this.dialogRef.close({ 'title': 'Hôm qua' });
  }

  btnAllTime(): void {
    const obj = new DateFilter();
    obj.date_from = null;
    obj.date_to = null;
    this.openingBalanceService.setDateFilter(obj);
    this.dialogRef.close({ 'title': 'Toàn thời gian' });
  }

  btnTuanNay(): void {
    const today = new Date();
    const obj = new DateFilter();
    const dau_tuan = this.getNearMonday(today);
    obj.date_from = this.openingBalanceService.convertDateYYYYMMDD(dau_tuan);
    obj.date_to = this.openingBalanceService.convertDateYYYYMMDD(today);
    this.openingBalanceService.setDateFilter(obj);
    this.dialogRef.close({ 'title': 'Tuần này' });
  }

  btnTuanTruoc(): void {
    const today = new Date();
    const obj = new DateFilter();
    const dau_tuan_nay = this.getNearMonday(today);
    const chu_nhat_tuan_truoc = this.getNearSunday(dau_tuan_nay);
    const thu_hai_tuan_truoc = this.getNearMonday(chu_nhat_tuan_truoc);
    // const dateChoose = new Date(2020, 6, 3);

    obj.date_from = this.openingBalanceService.convertDateYYYYMMDD(thu_hai_tuan_truoc);
    obj.date_to = this.openingBalanceService.convertDateYYYYMMDD(chu_nhat_tuan_truoc);
    this.openingBalanceService.setDateFilter(obj);
    this.dialogRef.close({ 'title': 'Tuần trước' });
  }

  btnThangNay(): void {
    let today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    if (this.local_data.typeReport === 'expiration-date') {
      today = new Date(year, month, this.daysInMonth(month, year) - 1);
    }
    const first = new Date(year, month, 1);
    const obj = new DateFilter();
    // tháng này
    obj.date_from = this.openingBalanceService.convertDateYYYYMMDD(first);
    obj.date_to = this.openingBalanceService.convertDateYYYYMMDD(today);
    this.openingBalanceService.setDateFilter(obj);
    this.dialogRef.close({ 'title': 'Tháng này' });
  }

  daysInMonth (month, year) {
    return new Date(year, month, 0).getDate();
  }

  btnThangTruoc(): void {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    const first = new Date(year, month - 1, 1);
    const end = new Date(year, month, 0);

    const obj = new DateFilter();
    // tháng này
    obj.date_from = this.openingBalanceService.convertDateYYYYMMDD(first);
    obj.date_to = this.openingBalanceService.convertDateYYYYMMDD(end);
    this.openingBalanceService.setDateFilter(obj);
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

  btn3ThangTruoc() {
    const obj = new DateFilter();
    obj.date_to = moment().format("YYYY-MM-DD");
    obj.date_from = moment().subtract(3, 'months').format("YYYY-MM-DD");
    this.openingBalanceService.setDateFilter(obj);
    this.dialogRef.close({ 'title': '3 tháng trước' });
  }

  btn6ThangTruoc(){
    const obj = new DateFilter();
    obj.date_to = moment().format("YYYY-MM-DD");
    obj.date_from = moment().subtract(6, 'months').format("YYYY-MM-DD");
    this.openingBalanceService.setDateFilter(obj);
    this.dialogRef.close({ 'title': '6 tháng trước' });
  }

}
