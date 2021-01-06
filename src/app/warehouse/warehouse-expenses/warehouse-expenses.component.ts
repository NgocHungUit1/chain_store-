import { Component, Inject, OnInit, Optional } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { NotifierService } from 'angular-notifier';
import { ExpensesTransaction } from '../../expenses-transaction/expenses-transaction.model';
import { SelectionModel } from '@angular/cdk/collections';
import * as numeral from 'numeral';

@Component({
  selector: 'app-warehouse-expenses',
  templateUrl: './warehouse-expenses.component.html',
  styleUrls: ['./warehouse-expenses.component.css']
})
export class WarehouseExpensesComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<WarehouseExpensesComponent>,
    public notifySer: NotifierService,
    private dialog: MatDialog,
    // @Optional() is used to prevent error if no data is passed
    @Optional() @Inject(MAT_DIALOG_DATA) public data: Object) {
    this.local_data = {...data};
    this.expenses = this.local_data.expenses;
    this.status = this.local_data.status;
  }

  local_data: any;
  status: any;
  expenses: ExpensesTransaction[] = [];
  displayedColumns: string[] = ['select', 'no', 'name', 'value', 'type'];

  selection = new SelectionModel<ExpensesTransaction>(true, []);

  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    if (this.expenses !== null && this.expenses !== undefined) {
      const numSelected = this.selection.selected.length;
      const numRows = this.expenses.length;
      return numSelected === numRows;
    }
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle() {
    this.isAllSelected() ?
      this.selection.clear() :
      this.expenses.forEach(row => this.selection.select(row));

  }

  /** The label for the checkbox on the passed row */
  checkboxLabel(row?: ExpensesTransaction): string {
    if (!row) {
      return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.id + 1}`;
  }

  onNoClick(): void {
    this.dialogRef.close(null);
  }

  ngOnInit(): void {
    const initSelected = [];
    if (this.expenses !== null && this.expenses !== undefined) {
      this.expenses.forEach(element => {
        element = <ExpensesTransaction>element;
        if (element.auto === 1) {
          initSelected.push(element);
        }
        element.value = numeral(element.value).format('0,0');
      });
      this.selection = new SelectionModel<ExpensesTransaction>(true, initSelected);
    }

  }

  submit() {
    if (this.expenses !== null && this.expenses !== undefined) {
      this.expenses.forEach(element => {
        element.auto = 0;
        this.selection.selected.forEach(obj => {
          if (element === obj) {
            element.auto = 1;
          }
        });
        element.value = numeral(element.value).value();
      });
      this.dialogRef.close(this.expenses);
    }

  }

  /**
   * Format input number
   */
  inputformatNumber(event: any) {
    event.target.value = numeral(event.target.value).format('0,0');
  }

}
