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
  price_list_common_id: string;
  element_common_price: any;
  price_data: any; // cho view de fix loi khong bi day gia
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
      'id': 'price',
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
    this.price_list_common_id = this.local_data.price_list_common_id;
    this.element_common_price = this.local_data.element_common_price;
    this.price_data = this.local_data.price;
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  public form: FormGroup;

  ngOnInit(): void {
    this.form = this.fb.group({
      choose: ['sell'],
      calculation: ['plus'],
      type: ['price'],
      numberInput: [0],
      allow_all: [0],
      element_common_price: this.element_common_price
    });
    this.updatePriceEvent();
  }

  // cong thuc
  // result = a + calculation*b
  // result = a + calculation*b*a/100

  updatePriceEvent() {
    const data = this.form.getRawValue();
    if (data.type === 'percent' && data.numberInput > 100) {
      this.form.patchValue({
        numberInput: 100,
      });
      this.notifySer.notify('warning', 'Phần trăm không đúng!');
      return;
    }
    this.form.patchValue({
      numberInput: data.numberInput,
    });

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
      if (this.element_common_price === null) {
        a = this.local_data.price;
      } else {
        a = this.element_common_price; // lay gia tri cua bang gia chung
      }
    }

    if (data.type === 'price') {
      result = a + calculation * b;
    } else {
      result = a + calculation * b * a / 100;
    }
    this.price_data = result; // khac voi submit de khong bi day gia
  }

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
          if (data.element_common_price === null) {
            a = this.local_data.price;
          } else {
            a = data.element_common_price; // lay gia tri cua bang gia chung
          }
        }

        if (data.type === 'price') {
          result = a + calculation * b;
        } else {
          result = a + calculation * b * a / 100;
        }
        if (result < 0) {
          this.notifySer.notify('warning', 'Giá chung không được nhỏ hơn 0!');
          return;
        }
        var element = this.local_data;
        element['price'] = result; // add gia tri moi
        this.priceListProductSer.update(this.local_data.id, element).subscribe(element => {
          this.notifySer.notify('success', 'Lưu thành công!');
        });

        this.dialogRef.close();
      } else { // not allow all
        this.priceListProductSer.updatePriceAll(this.local_data.price_list_id, this.price_list_common_id, data).subscribe(result => {
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
