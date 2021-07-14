import { Component, Inject, OnInit, Optional } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import * as numeral from 'numeral';

@Component({
  selector: 'app-warehouse-form-price-dialog',
  templateUrl: './warehouse-form-price-dialog.component.html',
  styleUrls: ['./warehouse-form-price-dialog.component.css']
})
export class WarehouseFormPriceDialogComponent implements OnInit {

  price: any;
  discount: any;
  discount_type: any;
  vat: any;
  vat_type: any;
  local_data: any;

  filterVAT = [
    {name: 'VAT 10%', selelected: false, vat: 10, vat_type: 'percent'},
    {name: 'VAT 5%', selelected: false, vat: 5, vat_type: 'percent'},
    {name: 'VAT 0%', selelected: false, vat: 0, vat_type: 'percent'},
  ];

  constructor(
    public dialogRef: MatDialogRef<WarehouseFormPriceDialogComponent>,
    private fb: FormBuilder,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: Object) {
    this.local_data = {...data};
    this.price = this.local_data.price;
    this.discount = this.local_data.discount;
    this.discount_type = this.local_data.discount_type;
    this.vat = (this.local_data.vat) ? (this.local_data.vat) : 0;
    this.vat_type = this.local_data.vat_type;
  }

  public form: FormGroup;

  onNoClick(): void {
    this.dialogRef.close(null);
  }

  ngOnInit(): void {

    this.form = this.fb.group({
      price: [
        numeral(this.price).format('0,0')
      ],
      discount: [
        numeral(this.discount).format('0,0')
      ],
      discount_type: ['price'],
      vat: [
        numeral(this.vat).format('0,0')
      ],
      vat_type: ['price'],
    });

    this.form.valueChanges.subscribe(res => {
      if (res.discount_type === 'percent' && res.discount > 100) {
        this.form.patchValue({ discount: 100 });
      }

      if (res.vat_type === 'percent' && res.vat > 100) {
        this.form.patchValue({ discount: 100 });
      }

    });
  }

  submit() {
    const data = this.form.getRawValue();
    this.dialogRef.close(data);
  }

  /**
   * Format input number
   */
  inputformatNumber(event: any) {
    event.target.value = numeral(event.target.value).format('0,0');
  }

  selectBaseVAT(item: any, i) {
    this.form.patchValue({ vat: item.vat });
    this.form.patchValue({ vat_type: item.vat_type });
    this.filterVAT.forEach(element => {
      item.name !== element.name ? element.selelected = false : element.selelected = true;
    });
  }

}
