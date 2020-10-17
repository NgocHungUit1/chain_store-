import { Component, Inject, OnInit, Optional } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { NotifierService } from 'angular-notifier';

@Component({
  selector: 'app-stock-take-balance-dialog',
  templateUrl: './stock-take-balance-dialog.component.html',
  styleUrls: ['./stock-take-balance-dialog.component.css']
})
export class StockTakeBalanceDialogComponent implements OnInit {

  action: string;
  title: string;
  content: string;
  local_data: any;

  constructor(
    public dialogRef: MatDialogRef<StockTakeBalanceDialogComponent>,
    public notifySer: NotifierService,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: Object) {
    this.local_data = { ...data };
    this.action = this.local_data.action;
    this.title = this.local_data.title;
    this.content = this.local_data.content;
  }

  ngOnInit(): void {
  }

  closeDialog() {
    this.dialogRef.close({ event: 'cancel' });
  }

  submit() {
    this.dialogRef.close({ event: 'accept' });
  }

}
