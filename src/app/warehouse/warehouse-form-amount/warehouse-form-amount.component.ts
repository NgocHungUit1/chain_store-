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
  }

  public form: FormGroup;

  onNoClick(): void {
    this.dialogRef.close(null);
  }

  ngOnInit(): void {
    this.form = this.fb.group({
      amount: [numeral(this.amount).format('0,0')],
      final_amount: [numeral(this.amount).format('0,0')],
    });
  }

  submit() {
    const data = this.form.getRawValue();
    this.dialogRef.close(data);
  }
}
