import { Component, OnInit, Inject, Optional } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-warehouse-discount-dialog',
  templateUrl: './warehouse-discount-dialog.component.html',
  styleUrls: ['./warehouse-discount-dialog.component.css']
})
export class WarehouseDiscountDialogComponent implements OnInit {

  discount_amount: number;
  discount_type: string;
  local_data: any;

  constructor(
    public dialogRef: MatDialogRef<WarehouseDiscountDialogComponent>,
    private fb: FormBuilder,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: Object) {
    this.local_data = { ...data };
    this.discount_amount = this.local_data.discount_amount;
    this.discount_type = this.local_data.discount_type;
  }

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
  public form: FormGroup;

  onNoClick(): void {
    this.dialogRef.close(null);
  }

  ngOnInit(): void {

    let numberValue = 0;
    let typeValue = 'price';
    if (this.discount_amount) {
      numberValue = this.discount_amount;
    }
    if (this.discount_type) {
      typeValue = this.discount_type;
    }
    this.form = this.fb.group({
      number: [
        numberValue,
        Validators.compose([
          Validators.required,
          Validators.maxLength(32)
        ])
      ],
      type: [typeValue],
    });

    this.form.valueChanges.subscribe(res => {
      if (res.type === 'percent' && res.number > 100) {
        this.form.patchValue({ number: 100 });
      }
    });
  }

  submit() {
    const data = this.form.getRawValue();
    this.dialogRef.close(data);
  }

}
