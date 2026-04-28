import {Component, OnInit, Inject, Optional} from '@angular/core';
import {MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';

@Component({
  selector: 'app-warehouse-discount-dialog',
  templateUrl: './warehouse-discount-dialog.component.html',
  styleUrls: ['./warehouse-discount-dialog.component.css']
})
export class WarehouseDiscountDialogComponent implements OnInit {

  discount_amount: number;
  discount_type: string;
  local_data: any;
  total_price: number = 0;
  errorMessage: string = '';

  constructor(
    public dialogRef: MatDialogRef<WarehouseDiscountDialogComponent>,
    private fb: FormBuilder,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: Object) {
    this.local_data = {...data};
    this.discount_amount = this.local_data.discount_amount;
    this.discount_type = this.local_data.discount_type;
    this.total_price = this.local_data.total_price ?? 0;
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
      const resNumber = res.number ? Number(res.number.toString().replace(/,/g, '')) : 0;
      if (res.type === 'percent' && resNumber > 100) {
        this.form.patchValue({number: 100});
      }

      if (res.number < 0) {
        this.form.patchValue({number: 0});
      }
    });
  }

  submit() {
    const data = this.form.getRawValue();
    data.number = data.number ? Number(data.number.toString().replace(/,/g, '')) : 0;
    if (data.type === 'price' && this.total_price > 0 && data.number > this.total_price) {
      this.errorMessage = 'Chiết khấu không được lớn hơn tổng tiền hàng';
      return;
    }
    if (data.type === 'percent' && data.number > 100) {
      this.errorMessage = 'Chiết khấu theo % không được lớn hơn 100%';
      return;
    }
    this.errorMessage = '';
    this.dialogRef.close(data);
  }

}
