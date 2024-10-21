import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import * as numeral from 'numeral';

@Component({
  selector: 'app-warehouse-unit-create-dialog',
  templateUrl: './warehouse-unit-create-dialog.component.html',
  styleUrls: ['./warehouse-unit-create-dialog.component.css']
})
export class WarehouseUnitCreateDialogComponent implements OnInit {

  form: FormGroup;
  constructor(
    public fb: FormBuilder,
    public dialogRef: MatDialogRef<WarehouseUnitCreateDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) { }

  ngOnInit(): void {
    this.initForm();
    console.log(this.data);
  }


  get units() {
    return this.form.get('units') as FormArray;
  }


  initForm() {
    this.form = this.fb.group({
      units: new FormArray([]),
    });
  }

  changeUnitValue(event: any, i) {
    const value = event.target.value;
    this.units.controls[i].patchValue({
      unit_price: numeral(value * numeral(this.data.price).value()).value(),
    });
  }

  changeBaseUnitValue(event: any, i) {
    const value = numeral(event.target.value).value();
    this.units.controls[i].patchValue({
      unit_price: numeral(value).value(),
    });
  }

  removeUnit(i) {
    this.units.removeAt(i);
  }

  addUnit() {
    const index = this.units.length + 1;
    const group = new FormGroup({
      unit_name: new FormControl('', Validators.required),
      unit_value: new FormControl(2, Validators.required),
      unit_price: new FormControl(+this.data.price, Validators.required),
      unit_no: new FormControl(this.data.product.product_no + '-' + this.data.productUnits.length + index)
    });
    this.units.push(group);
  }

  save() {
    if (!this.form.valid) { return; }

    this.dialogRef.close(this.form.value['units']);
  }
}
