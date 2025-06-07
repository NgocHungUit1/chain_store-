import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { OrderService } from '../order.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ItemInvoice } from '../order.model';
import * as numeral from 'numeral';
import { ColumnVisibilityMap, SaleColumnVisibilityService } from '../../shared/sale-column-visibility.service';

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
    private saleColumnVisibilityService: SaleColumnVisibilityService
  ) { }

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
    this.dialogRef.close();
  }

  ngOnInit(): void {
    let typeValue = 'price';
    let numberValue = 0;
    this.saleColumnVisibilityService.visibility$.subscribe((map: ColumnVisibilityMap) => {
      typeValue = map.discount + "";
    });
    debugger;
    let listInvoice = this.orderService.getListInvoiceLocalStorage();
    const listItemInvoice = listInvoice.itemInvoice;
    let mItemInvoice = new ItemInvoice();

    listItemInvoice.forEach(element => {
      if (element.active === true) {
        mItemInvoice = element;
      }
    });

    const discountSiderBar = mItemInvoice.discountSiderBar;
    if (discountSiderBar !== null && discountSiderBar !== undefined && discountSiderBar.number > 0) {
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
          number: numeral(data.number).value(),
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
    if (data.type === 'percent' && numeral(data.number).value() > 100) {
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
          number: numeral(data.number).value(),
          type: data.type
        };
      }
    });
    this.orderService.setListInvoiceLocalStorage(listInvoice);
  }

  /**
    * Format input number
    * @Nghia 
    */
  inputformatNumber(event: any) {
    event.target.value = numeral(event.target.value).format('0,0');
  }
}
