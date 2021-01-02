import { Component, Inject, OnInit, Optional } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { NotifierService } from 'angular-notifier';
import * as numeral from 'numeral';
import { ExpensesTransactionService } from '../expenses-transaction.service';
import { ExpensesTransaction } from '../expenses-transaction.model';

@Component({
  selector: 'app-expenses-transaction-form-dialog',
  templateUrl: './expenses-transaction-form-dialog.component.html',
  styleUrls: ['./expenses-transaction-form-dialog.component.css']
})
export class ExpensesTransactionFormDialogComponent implements OnInit {

  form: FormGroup;
  local_data: any;
  expenses_transaction_id: string;
  expensesTransaction: ExpensesTransaction;

  constructor(
    public dialogRef: MatDialogRef<ExpensesTransactionFormDialogComponent>,
    public notifySer: NotifierService,
    public expensesTransactionService: ExpensesTransactionService,
    private fb: FormBuilder,
    private dialog: MatDialog,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: Object
  ) {
    this.local_data = {...data};
    this.expenses_transaction_id = this.local_data.expenses_transaction_id;
    this.expensesTransaction = this.local_data.expensesTransaction;
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
      method: ['import']
    });
  }

  ngOnInit(): void {
    this.buildForm();
    if (this.expenses_transaction_id === null || this.expenses_transaction_id === undefined) {
      this.expensesTransactionService.getRenderExpensesTransactionNo().subscribe(res => {
        this.form.patchValue({
          no: 'TK' + res,
        });
      });
    } else {
      this.form.patchValue({
        no: this.expensesTransaction.no,
        name: this.expensesTransaction.name,
        value: numeral(this.expensesTransaction.value).format('0,0'),
        type: this.expensesTransaction.type,
        auto: this.expensesTransaction.auto,
        return_auto: this.expensesTransaction.return_auto,
        sort: this.expensesTransaction.sort,
        method: this.expensesTransaction.method,
      });
    }

  }

  submit() {
    if (this.form.valid) {
      const data = this.form.getRawValue();
      data.auto = (data.auto === true) ? 1 : 0;
      data.return_auto = (data.return_auto === true) ? 1 : 0;
      data.value = numeral(data.value).value();

      if (this.expenses_transaction_id !== null && this.expenses_transaction_id !== undefined) {
        this.expensesTransactionService.update(this.expenses_transaction_id, data).subscribe(res => {
          this.notifySer.notify('success', 'Cập nhật thành công!');
          this.dialogRef.close(res);
        });
      } else {
        this.expensesTransactionService.create(data).subscribe(res => {
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
