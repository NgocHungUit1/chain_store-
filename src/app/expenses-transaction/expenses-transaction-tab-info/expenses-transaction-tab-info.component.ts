import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { ExpensesOrder } from '../../expenses-order/expenses-order.model';
import { MatDialog } from '@angular/material/dialog';
import { ExpensesOrderService } from '../../expenses-order/expenses-order.service';
import { NotifierService } from 'angular-notifier';
import { ExpensesOrderFormDialogComponent } from '../../expenses-order/expenses-order-form-dialog/expenses-order-form-dialog.component';
import { ExpensesTransactionFormDialogComponent } from '../expenses-transaction-form-dialog/expenses-transaction-form-dialog.component';
import { ExpensesTransactionService } from '../expenses-transaction.service';
import { ExpensesTransaction } from '../expenses-transaction.model';

@Component({
  selector: 'app-expenses-transaction-tab-info',
  templateUrl: './expenses-transaction-tab-info.component.html',
  styleUrls: ['./expenses-transaction-tab-info.component.css']
})
export class ExpensesTransactionTabInfoComponent implements OnChanges {

  @Input() expensesTransaction: ExpensesTransaction;
  @Input() expandedElement: boolean;
  @Output() reload: EventEmitter<any> = new EventEmitter();


  constructor(
    private dialog: MatDialog,
    public expensesOrderService: ExpensesOrderService,
    public expensesTransactionService: ExpensesTransactionService,
    public notifySer: NotifierService,
  ) {
  }

  ngOnChanges(changes: SimpleChanges) {
    if (this.expandedElement) {
      // console.log(this.expensesOrder);
    }
  }

  openExpensesTransactionFormDialog(id: string) {
    const obj = {
      expensesTransaction: this.expensesTransaction,
      expenses_transaction_id: this.expensesTransaction.id,
    };

    const dialogRef = this.dialog.open(ExpensesTransactionFormDialogComponent, {
      data: obj,
      width: '500px',
      minHeight: '80%',
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.reload.emit(null);
      }
    });
  }

  updateStatus(status: number) {
    this.expensesTransaction.status = status;
    this.expensesTransactionService.update(this.expensesTransaction.id, this.expensesTransaction).subscribe(res => {
      this.notifySer.notify('success', 'Cập nhật thành công!');
    });
  }

  deleteItem() {
    this.expensesTransactionService.delete(this.expensesTransaction.id).subscribe(res => {
      this.reload.emit(null);
    });
  }

}
