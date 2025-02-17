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

  onNumberInput(event: any, controlName: string): void {
    // Early return for percentage-based VAT and discount
    if (controlName === "vat" && this.vat_type === "percent") return;
    if (controlName === "discount" && this.discount_type === "percent") return;
    
    // Get the current form control and its current value
    const control = this.form.get(controlName);

    // Remove existing commas from the input
    let inputValue = event.target.value.replace(/,/g, '');
    
    // Convert to number for validation
    const numValue = Number(inputValue);
    
    if (!isNaN(numValue)) {
        const formattedValue = numeral(numValue).format('0,0');
        event.target.value = formattedValue;
        control.setValue(formattedValue, { emitEvent: false });
        this[controlName] = formattedValue;
    } else {
        event.target.value = this[controlName];
        control.setValue(this[controlName], { emitEvent: false });
    }
  }
  

  submit() {
    const data = this.form.getRawValue();
    this.dialogRef.close(data);
  }
}
