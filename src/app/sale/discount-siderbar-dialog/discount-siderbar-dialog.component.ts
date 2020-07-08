import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { OrderService } from '../order.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'app-discount-siderbar-dialog',
  templateUrl: './discount-siderbar-dialog.component.html',
  styleUrls: ['./discount-siderbar-dialog.component.css']
})
export class DiscountSiderbarDialogComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<DiscountSiderbarDialogComponent>,
    private orderService: OrderService,
    private fb: FormBuilder,
  ) { }

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

  public form: FormGroup;

  onNoClick(): void {
    this.dialogRef.close();
  }

  ngOnInit(): void {
    const discountSiderBar = this.orderService.getDiscountSiderBar();
    var numberValue = 0;
    var typeValue = 'vnd';
    if (discountSiderBar !== null) {
      numberValue = discountSiderBar?.number;
      typeValue = discountSiderBar?.type;
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
  }

  submit() {
    const data = this.form.getRawValue();
    this.orderService.setDiscountSiderBar({ number: data.number, type: data.type });
    this.dialogRef.close();
  }

  updateEvent() {
    const data = this.form.getRawValue();
    if (data.type === 'percent' && data.number > 100) {
      this.form.patchValue({
        number: 100,
      });
      return;
    }
    this.orderService.setDiscountSiderBar({ number: data.number, type: data.type });
  }
}
