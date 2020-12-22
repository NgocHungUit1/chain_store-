import { Component, Inject, OnInit, Optional } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { NotifierService } from 'angular-notifier';
import { ExpensesOrderService } from '../expenses-order.service';
import * as numeral from 'numeral';
import { log } from 'util';
import { ExpensesOrder } from '../expenses-order.model';

@Component({
  selector: 'app-expenses-order-form-dialog',
  templateUrl: './expenses-order-form-dialog.component.html',
  styleUrls: ['./expenses-order-form-dialog.component.css']
})
export class ExpensesOrderFormDialogComponent implements OnInit {

  form: FormGroup;
  local_data: any;
  expenses_order_id: string;
  expensesOrder: ExpensesOrder;

  constructor(
    public dialogRef: MatDialogRef<ExpensesOrderFormDialogComponent>,
    public notifySer: NotifierService,
    public expensesOrderService: ExpensesOrderService,
    private fb: FormBuilder,
    private dialog: MatDialog,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: Object
  ) {
    this.local_data = {...data};
    this.expenses_order_id = this.local_data.expenses_order_id;
    this.expensesOrder = this.local_data.expensesOrder;
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  buildForm() {
    this.form = this.fb.group({
      no: [null, Validators.compose([
        Validators.required,
        Validators.maxLength(32)
      ])],
      name: [null, Validators.compose([
        Validators.maxLength(255)
      ])],
      value: [null, Validators.compose([
        Validators.maxLength(20)
      ])],
      type: ['price'],
      auto: [true],
      return_auto: [null],
      sort: [null],
      status: [10],
    });
  }

  ngOnInit(): void {
    this.buildForm();
    if (this.expenses_order_id === null || this.expenses_order_id === undefined) {
      this.expensesOrderService.getRenderExpensesOrderNo().subscribe(res => {
        this.form.patchValue({
          no: 'T' + res,
        });
      });
    } else {
      this.form.patchValue({
        no: this.expensesOrder.no,
        name: this.expensesOrder.name,
        value: numeral(this.expensesOrder.value).format('0,0'),
        type: this.expensesOrder.type,
        auto: this.expensesOrder.auto,
        return_auto: this.expensesOrder.return_auto,
        sort: this.expensesOrder.sort,
      });
    }

  }

  submit() {
    if (this.form.valid) {
      const data = this.form.getRawValue();
      data.auto = (data.auto === true) ? 1 : 0;
      data.return_auto = (data.return_auto === true) ? 1 : 0;
      data.value = numeral(data.value).value();

      if (this.expenses_order_id !== null && this.expenses_order_id !== undefined) {
        this.expensesOrderService.update(this.expenses_order_id, data).subscribe(res => {
          this.notifySer.notify('success', 'Cập nhật thành công!');
          this.dialogRef.close(res);
        });
      } else {
        this.expensesOrderService.create(data).subscribe(res => {
          this.notifySer.notify('success', 'Thêm thành công!');
          this.dialogRef.close(res);
        });
      }
    }
  }

  /**
   * Format input number
   * @Nghia
   */
  inputformatNumber(event: any) {
    event.target.value = numeral(event.target.value).format('0,0');
  }

}
