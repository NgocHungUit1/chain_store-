import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { OrderService } from '../order.service';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-payment-siderbar-dialog',
  templateUrl: './payment-siderbar-dialog.component.html',
  styleUrls: ['./payment-siderbar-dialog.component.css']
})
export class PaymentSiderbarDialogComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<PaymentSiderbarDialogComponent>,
    private orderService: OrderService,
    private fb: FormBuilder,
  ) { }
  chooseNumbers: any[] = [
    100000, 200000, 300000
  ];
  typeItems: any[] = [
    {
      'id': 'cash',
      'title': 'Tiền mặt'
    },
    {
      'id': 'card',
      'title': 'Thẻ'
    },
    {
      'id': 'transfer',
      'title': 'Chuyển khoản'
    }
  ];

  public form: FormGroup;


  onNoClick(): void {
    this.dialogRef.close();
  }

  ngOnInit(): void {
    const paymentSiderBar = this.orderService.getPaymentSiderBar();
    var numberValue = 0;
    var typeValue = 'cash';
    if (paymentSiderBar !== null) {
      numberValue = paymentSiderBar?.number;
      typeValue = paymentSiderBar?.type;
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
    this.orderService.setPaymentSiderBar({ number: data.number, type: data.type });
    this.dialogRef.close();
  }

  updateEvent() {
    const data = this.form.getRawValue();
    this.orderService.setPaymentSiderBar({ number: data.number, type: data.type });
  }

  add() {

  }
}
