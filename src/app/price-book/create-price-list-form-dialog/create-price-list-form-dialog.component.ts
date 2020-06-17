import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef } from "@angular/material/dialog";
import { NotifierService } from "angular-notifier";
import { FormBuilder, FormGroup, Validators, FormControl } from "@angular/forms";
import { PriceListService } from "../price-list.service";

@Component({
  selector: 'app-create-price-list-form-dialog',
  templateUrl: './create-price-list-form-dialog.component.html',
  styleUrls: ['./create-price-list-form-dialog.component.css']
})

export class CreatePriceListFormDialogComponent implements OnInit {

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

    this.form = this.fb.group({
      name: [
        null,
        Validators.compose([
          Validators.required,
          Validators.maxLength(32)
        ])
      ],
    });
  }

  submit() {
    if (this.form.valid) {
      let data = this.form.getRawValue();
      this.dialogRef.close();
      this.priceListSer.create(data).subscribe(res => {
        this.notifySer.notify('success', 'Thêm bảng giá thành công!');
        this.dialogRef.close(res);
      });
    }
  }

}
