import { Component, Inject, OnInit, Optional } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import * as numeral from 'numeral';

@Component({
  selector: 'app-warehouse-form-amount',
  templateUrl: './warehouse-form-amount.component.html',
  styleUrls: ['./warehouse-form-amount.component.css'],
})
export class WarehouseFormAmountComponent implements OnInit {
  price: any;
  sell_price: any;
  amount: any;
  discount: any;
  discount_type: any;
  vat: any;
  vat_type: any;
  local_data: any;
  quantity: any;

  constructor(
    public dialogRef: MatDialogRef<WarehouseFormAmountComponent>,
    private fb: FormBuilder,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: Object
  ) {
    this.local_data = { ...data };
    this.amount = this.local_data.amount;
    this.price = this.local_data.price;
    this.sell_price = this.local_data.sell_price;
    this.quantity = this.local_data.quantity;
    this.discount = this.local_data.discount;
    this.discount_type = this.local_data.discount_type;
    this.vat = this.local_data.vat ? this.local_data.vat : 0;
    this.vat_type = this.local_data.vat_type;
  }

  public form: FormGroup;

  onNoClick(): void {
    this.dialogRef.close(null);
  }

  ngOnInit(): void {
    this.form = this.fb.group({
      amount: [numeral(numeral(this.quantity).value() * numeral(this.price).value()).format('0,0')],
      price: [numeral(this.price)._value],
      sell_price: [numeral(this.sell_price).format('0,0')],
      discount: [numeral(this.discount).format('0,0')],
      discount_type: [this.discount_type],
      vat: [numeral(this.vat).format('0,0')],
      vat_type: [this.vat_type],
      final_amount: [numeral(this.amount).format('0,0')],
    });

    this.form.valueChanges.subscribe(res => {
      const discount = numeral(res.discount)._value;
      const amount = numeral(res.amount)._value;


      if (res.discount_type === 'percent' && discount > 100) {
        this.form.patchValue({ discount: 100 });
      }

      if (res.discount_type === 'price' && discount > amount) {
        this.form.patchValue({ discount: res.amount });
      }
    });
  }

  submit() {
    const data = this.form.getRawValue();
    this.dialogRef.close(data);
  }

  /**
   * Format input number and recalculate final amount
   * @param event Input event containing the field name and value
   */
  discountInputChange(event: any) {
    const { name, value } = event.target;

    // Format the input value using numeral
    const formattedValue = numeral(value).format('0,0');
    this.form.patchValue({ [name]: formattedValue }, { emitEvent: false });

    // Get current form values
    const formValues = this.form.getRawValue();
    const amount = numeral(formValues.amount).value() || 0;
    const discount = numeral(formValues.discount).value() || 0;
    const vat = numeral(formValues.vat).value() || 0;

    // Calculate discount amount
    let discountAmount = 0;
    if (formValues.discount_type === 'percent') {
      discountAmount = amount * (discount / 100);
    } else {
      discountAmount = discount;
    }

    // Calculate amount after discount
    const amountAfterDiscount = amount - discountAmount;

    // Calculate vat amount
    let vatAmount = 0;
    if (formValues.vat_type === 'percent') {
      vatAmount = amountAfterDiscount * (vat / 100);
    } else {
      vatAmount = vat;
    }

    const finalAmount = amountAfterDiscount + vatAmount;

    // Update amount and final amount in the form
    this.form.patchValue(
      {
        amount: numeral(amount).format('0,0'),
        final_amount: numeral(finalAmount).format('0,0'),
      },
      { emitEvent: false }
    );
  }
}
