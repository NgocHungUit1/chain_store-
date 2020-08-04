import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { OrderService } from '../order.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ItemInvoice } from '../order.model';

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

    let listInvoice = this.orderService.getListInvoiceLocalStorage();
    const listItemInvoice = listInvoice.itemInvoice;
    let mItemInvoice = new ItemInvoice();

    listItemInvoice.forEach(element => {
      if (element.active === true) {
        mItemInvoice = element;
      }
    });

    const discountSiderBar = mItemInvoice.discountSiderBar;
    let numberValue = 0;
    let typeValue = 'vnd';
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
    let listInvoice = this.orderService.getListInvoiceLocalStorage();
    const listItemInvoice = listInvoice.itemInvoice;
    let activeiTemInvoice = new ItemInvoice();
    listItemInvoice.forEach(element => {
      if (element.active === true) {
        element.discountSiderBar = {
          number: data.number,
          type: data.type
        };
        activeiTemInvoice = element;
      }
    });
    this.orderService.setListInvoiceLocalStorage(listInvoice);
    this.dialogRef.close(activeiTemInvoice);
  }

  updateEvent() {
    const data = this.form.getRawValue();
    if (data.type === 'percent' && data.number > 100) {
      this.form.patchValue({
        number: 100,
      });
      return;
    }
    let listInvoice = this.orderService.getListInvoiceLocalStorage();
    const listItemInvoice = listInvoice.itemInvoice;
    listItemInvoice.forEach(element => {
      if (element.active === true) {
        element.discountSiderBar = {
          number: data.number,
          type: data.type
        };
      }
    });
    this.orderService.setListInvoiceLocalStorage(listInvoice);
  }
}
