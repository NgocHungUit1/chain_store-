import { Component, OnInit, Inject, Optional } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { NotifierService } from "angular-notifier";
import { FormBuilder, FormGroup, Validators, FormControl } from "@angular/forms";
import { PriceListService } from "../price-list.service";
import { PriceListProductService } from '../price-list-product.service';

@Component({
  selector: 'app-setup-common-price-dialog',
  templateUrl: './setup-common-price-dialog.component.html',
  styleUrls: ['./setup-common-price-dialog.component.css']
})
export class SetupCommonPriceDialogComponent implements OnInit {

  local_data: any;
  chooseItems: any[] = [
    {
      'id': 'sell',
      'title': 'Giá bán'
    },
    {
      'id': 'original',
      'title': 'Giá vốn'
    },
    {
      'id': 'common',
      'title': 'Giá chung'
    }
  ];
  calculationItems: any[] = [
    {
      'id': 'plus',
      'title': '+'
    },
    {
      'id': 'subtract',
      'title': '-'
    }
  ];
  typeItems: any[] = [
    {
      'id': 'vnd',
      'title': 'VNĐ'
    },
    {
      'id': 'percent',
      'title': '%'
    }
  ];
  constructor(
    public dialogRef: MatDialogRef<SetupCommonPriceDialogComponent>,
    public notifySer: NotifierService,
    private fb: FormBuilder,
    private priceListProductSer: PriceListProductService,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: Object
  ) {
    this.local_data = { ...data };
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  public form: FormGroup;

  ngOnInit(): void {
    this.form = this.fb.group({
      choose: ['sell'],
      calculation: ['plus'],
      type: ['vnd'],
      numberInput: [0],
      allow_all: [0]
    });
  }

  // cong thuc 
  // result = a + calculation*b
  // result = a + calculation*b*a/100
  submit() {
    if (this.form.valid) {
      const data = this.form.getRawValue();
      if (data.type === 'percent' && data.numberInput > 100) {
        this.notifySer.notify('warning', 'Phần trăm không đúng!');
        return;
      }
      
      if (data.allow_all === 0) {
        var result = 0;
        var b = data.numberInput;
        var a = 0;
        var calculation = 1;
        if (data.calculation !== 'plus') {
          calculation = -1;
        }

        if (data.choose === 'sell') {
          a = this.local_data.product.sell_price;
        } else if (data.choose === 'original') {
          a = this.local_data.product.original_price;
        } else {
          a = this.local_data.price;
        }

        if (data.type === 'vnd') {
          result = a + calculation * b;
        } else {
          result = a + calculation * b * a / 100;
        }
        var element = this.local_data;
        element['price'] = result;
        this.priceListProductSer.update(this.local_data.id, element).subscribe(element => {
          this.notifySer.notify('success', 'Lưu thành công!');
        });

        this.dialogRef.close();
      } else { // not allow all
        this.priceListProductSer.updatePriceAll(this.local_data.price_list_id, data).subscribe(result => {
          if (result === true) {
            this.notifySer.notify('success', 'Cập nhật tất cả thành công!');
            this.dialogRef.close();
          } else {
            this.notifySer.notify('warning', 'Không thành công!');
          }
        });

      }

    }
  }

}
