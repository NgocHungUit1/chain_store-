import { Component, Inject, OnInit, Optional } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { NotifierService } from "angular-notifier";
import { FormBuilder, FormGroup, Validators, FormControl } from "@angular/forms";
import { PriceListService } from "../price-list.service";
import * as moment from 'moment';
import { element } from 'protractor';

@Component({
  selector: 'app-create-price-list-form-dialog',
  templateUrl: './create-price-list-form-dialog.component.html',
  styleUrls: ['./create-price-list-form-dialog.component.css']
})

export class CreatePriceListFormDialogComponent implements OnInit {

  title: string;
  local_data: any;
  action: string;
  priceListChoose: any;
  statusItems: any[] = [
    {
      'id': 10,
      'title': 'Áp dụng'
    },
    {
      'id': 0,
      'title': 'Chưa áp dụng'
    }
  ];

  constructor(
    public dialogRef: MatDialogRef<CreatePriceListFormDialogComponent>,
    public notifySer: NotifierService,
    private fb: FormBuilder,
    private priceListSer: PriceListService,
    // @Optional() is used to prevent error if no data is passed
    @Optional() @Inject(MAT_DIALOG_DATA) public data: Object) {
    this.local_data = { ...data };
    this.action = this.local_data.action;
    this.priceListChoose = this.local_data.priceListChoose;
    this.title = this.local_data.title;
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  public form: FormGroup;
  loading = false;
  minDateTo: Date = null;

  initForm() {
    const today = new Date();
    const todayISOstring = today.toISOString();
    const year = today.getFullYear();
    const month = today.getMonth();
    const day = today.getDate();
    const nextYear = new Date(year + 1, month, day);
    const nextYearISOstring = nextYear.toISOString();
    this.form = this.fb.group({
      name: [
        null,
        Validators.compose([
          Validators.required,
          Validators.maxLength(32)
        ])
      ],
      date_from: [
        todayISOstring
      ],
      date_to: [nextYearISOstring],
      status: 10
    });
  }

  ngOnInit(): void {
    this.initForm();
    this.minDateTo = new Date(this.form.controls['date_from'].value);
    this.form.controls['date_from'].valueChanges.subscribe(value => {
      if (value) {
        this.minDateTo = new Date(value);
        const dateTo = this.form.controls['date_to'].value;
        if (dateTo && new Date(dateTo) < new Date(value)) {
          this.form.controls['date_to'].setValue(null);
        }
      }
    });
    if (this.action === 'update') {
      this.loadForm();
    }
  }

  loadForm() {
    const priceListChoose = this.priceListChoose;
    this.priceListSer.getDetail(priceListChoose.id).subscribe(element => {
      let date_from = null;
      let date_to = null;
      if (element['date_from'] !== null) {
        date_from = new Date(element['date_from']).toISOString();
      }
      if (element['date_to'] !== null) {
        date_to = new Date(element['date_to']).toISOString();
      }
      this.form.patchValue({
        name: priceListChoose.name,
        date_from: date_from,
        date_to: date_to,
        status: element['status']
      });
      if (date_from) {
        this.minDateTo = new Date(date_from);
      }
    });

  }


  submit() {
    if (this.form.valid) {
      const data = this.form.getRawValue();

      if (data['date_from'] !== null) {
        const momentDate = new Date(data['date_from']);
        const formattedDate = moment(momentDate).format('YYYY-MM-DD');
        data['date_from'] = formattedDate;
      }
      if (data['date_to'] !== null) {
        const momentDate = new Date(data['date_to']);
        const formattedDate = moment(momentDate).format('YYYY-MM-DD');
        data['date_to'] = formattedDate;
      }

      if (!this.priceListChoose) {
        this.priceListSer.exist(data).subscribe(res => {
          if (res === true) {
            this.notifySer.notify('warning', 'Bảng giá đã tồn tại!');
          } else {
            this.priceListSer.create(data).subscribe(res => {
              this.notifySer.notify('success', 'Thêm bảng giá thành công!');
              this.dialogRef.close(res);
            });
          }
        });
      } else {
        this.priceListSer.update(this.priceListChoose.id, data).subscribe(res => {
          this.notifySer.notify('success', 'Cập nhật bảng giá thành công!');
          this.dialogRef.close(res);
        });
      }
    }
  }

}
