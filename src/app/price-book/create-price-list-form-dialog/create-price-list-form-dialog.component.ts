import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef } from "@angular/material/dialog";
import { NotifierService } from "angular-notifier";
import { FormBuilder, FormGroup, Validators, FormControl } from "@angular/forms";
import { PriceListService } from "../price-list.service";
import * as moment from 'moment';

@Component({
  selector: 'app-create-price-list-form-dialog',
  templateUrl: './create-price-list-form-dialog.component.html',
  styleUrls: ['./create-price-list-form-dialog.component.css']
})

export class CreatePriceListFormDialogComponent implements OnInit {


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
  ) { }

  onNoClick(): void {
    this.dialogRef.close();
  }

  public form: FormGroup;
  loading = false;


  ngOnInit(): void {
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

      this.dialogRef.close();
      this.priceListSer.create(data).subscribe(res => {
        this.notifySer.notify('success', 'Thêm bảng giá thành công!');
        this.dialogRef.close(res);
      });
    }
  }

}
