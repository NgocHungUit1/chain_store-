import { Component, Inject, OnInit, Optional } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { NotifierService } from 'angular-notifier';
import { OrderService } from '../order.service';

@Component({
  selector: 'app-sale-print-invoice-dialog',
  templateUrl: './sale-print-invoice-dialog.component.html',
  styleUrls: ['./sale-print-invoice-dialog.component.css']
})
export class SalePrintInvoiceDialogComponent implements OnInit {

  local_data: any;
  invoice_id: number;

  constructor(
    public dialogRef: MatDialogRef<SalePrintInvoiceDialogComponent>,
    public notifySer: NotifierService,
    private orderService: OrderService,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: Object) {
    this.local_data = { ...data };
    this.invoice_id = this.local_data.invoice_id;
  }

  ngOnInit(): void {
    this.orderService.getDataInvoiceToPrint(this.invoice_id).subscribe(res => {
      console.log(res);
      // @Nghia
    });
    console.log(this.invoice_id);

  }

  closeDialog() {
    this.dialogRef.close({ event: 'cancel' });
  }

  delete() {
    this.dialogRef.close({ event: 'delete' });
  }

}
