import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ExpensesOrder } from '../expenses-order.model';
import { ExpensesOrderFormDialogComponent } from '../expenses-order-form-dialog/expenses-order-form-dialog.component';
import { ExpensesOrderService } from '../expenses-order.service';
import { NotifierService } from 'angular-notifier';

@Component({
  selector: 'app-expenses-order-tab-info',
  templateUrl: './expenses-order-tab-info.component.html',
  styleUrls: ['./expenses-order-tab-info.component.css']
})
export class ExpensesOrderTabInfoComponent implements OnChanges {

  @Input() expensesOrder: ExpensesOrder;
  @Input() expandedElement: boolean;
  @Output() reload: EventEmitter<any> = new EventEmitter();

  constructor(
    private dialog: MatDialog,
    public expensesOrderService: ExpensesOrderService,
    public notifySer: NotifierService,
  ) {
  }

  ngOnChanges(changes: SimpleChanges) {
    if (this.expandedElement) {
      // console.log(this.expensesOrder);
    }
  }

  openExpensesOrderFormDialog(id: string) {
    const obj = {
      expensesOrder: this.expensesOrder,
      expenses_order_id: this.expensesOrder.id,
    };

    const dialogRef = this.dialog.open(ExpensesOrderFormDialogComponent, {
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
    this.expensesOrder.status = status;
    this.expensesOrderService.update(this.expensesOrder.id, this.expensesOrder).subscribe(res => {
      this.notifySer.notify('success', 'Cập nhật thành công!');
    });
  }

  deleteItem() {
    this.expensesOrderService.delete(this.expensesOrder.id).subscribe(res => {
      this.reload.emit(null);
    });
  }

}
