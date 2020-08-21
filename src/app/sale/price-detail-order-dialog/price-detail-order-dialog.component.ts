import { Component, OnInit, Inject, Optional } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { OrderService } from '../order.service';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Product } from '../../product/product.model';

@Component({
  selector: 'app-price-detail-order-dialog',
  templateUrl: './price-detail-order-dialog.component.html',
  styleUrls: ['./price-detail-order-dialog.component.css']
})
export class PriceDetailOrderDialogComponent implements OnInit {

  local_data: any;
  product: Product;
  common_price: any;
  commonPriceDetailOrderText: string;
  constructor(
    public dialogRef: MatDialogRef<PriceDetailOrderDialogComponent>,
    private orderService: OrderService,
    private fb: FormBuilder,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: Object) {
    this.local_data = { ...data };
    this.product = this.local_data.product;
    this.common_price = this.local_data.common_price;
  }

  public form: FormGroup;

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

  onNoClick(): void {
    this.dialogRef.close();
  }


  ngOnInit(): void {
    var discountType = 'price';
    var discountPrice = '0';
    var endPrice = this.common_price;
    if (this.product.discount_type) {
      discountType = this.product.discount_type;
    }
    if (this.product.discount) {
      discountPrice = this.product.discount;
    }
    if (this.product.end_price) {
      endPrice = this.product.end_price;
    }
    this.commonPriceDetailOrderText = this.common_price;
    this.form = this.fb.group({
      commonPriceDetailOrder: [
        this.common_price,
        Validators.compose([
          Validators.required,
          Validators.maxLength(32)
        ])
      ],
      discountTypePriceDetailOrder: [discountType],
      discountPriceDetailOrder: [discountPrice],
      endPriceDetailOrder: [endPrice],
    });
  }

  submit() {
    const product = this.product;
    product.discount_type = this.form.controls['discountTypePriceDetailOrder'].value;
    product.discount = this.form.controls['discountPriceDetailOrder'].value;
    product.end_price = this.form.controls['endPriceDetailOrder'].value;
    this.orderService.updateProduct(product.id, product);
    this.dialogRef.close();
  }

  updateEvent() {
    const data = this.form.getRawValue();
    if (data.discountTypePriceDetailOrder === 'percent' && data.discountPriceDetailOrder > 100) {
      this.form.patchValue({
        discountPriceDetailOrder: 100,
      });
      return;
    }
    if (data.discountTypePriceDetailOrder === 'percent') {
      const endPrice = this.common_price * (100 - data.discountPriceDetailOrder) / 100;
      this.form.patchValue({
        endPriceDetailOrder: endPrice,
      });
      return;
    }
    if (data.discountTypePriceDetailOrder === 'price') {
      const endPrice = parseInt(this.common_price) - parseInt(data.discountPriceDetailOrder);
      this.form.patchValue({
        endPriceDetailOrder: endPrice,
      });
      return;
    }
  }

  onEndPriceChange() {
    this.form.patchValue({
      discountPriceDetailOrder: 0,
      discountTypePriceDetailOrder: 'price'
    });

  }
}
