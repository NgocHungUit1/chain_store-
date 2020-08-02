import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { OrderService } from '../order.service';
import { MatDialogRef } from '@angular/material/dialog';
import { ItemInvoice } from '../order.model';

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

    let listInvoice = this.orderService.getListInvoiceLocalStorage();
    const listItemInvoice = listInvoice.itemInvoice;
    let mItemInvoice = new ItemInvoice();

    listItemInvoice.forEach(element => {
      if (element.active === true) {
        mItemInvoice = element;
      }
    });

    const paymentSiderBar = mItemInvoice.paymentSiderBar;

    let numberValue = 0;
    let typeValue = 'cash';

    if (paymentSiderBar !== null) {
      numberValue = (paymentSiderBar?.number !== null) ? paymentSiderBar?.number : 0;
      typeValue = (paymentSiderBar?.type !== null) ? paymentSiderBar?.type : 'cash';
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
    let listInvoice = this.orderService.getListInvoiceLocalStorage();
    const listItemInvoice = listInvoice.itemInvoice;
    listItemInvoice.forEach(element => {
      if (element.active === true) {
        element.paymentSiderBar = {
          number: data.number,
          type: data.type
        };
      }
    });
    this.orderService.setListInvoiceLocalStorage(listInvoice);
    this.dialogRef.close();
  }

  updateEvent() {
    const data = this.form.getRawValue();
    let listInvoice = this.orderService.getListInvoiceLocalStorage();
    const listItemInvoice = listInvoice.itemInvoice;
    listItemInvoice.forEach(element => {
      if (element.active === true) {
        element.paymentSiderBar = {
          number: data.number,
          type: data.type
        };
      }
    });
    this.orderService.setListInvoiceLocalStorage(listInvoice);
  }

}
