import { Component, Inject, OnInit, Optional } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { NotifierService } from 'angular-notifier';
import * as numeral from 'numeral';
import { SelectionModel } from '@angular/cdk/collections';
import { ExpensesTransaction } from '../../expenses-transaction/expenses-transaction.model';


@Component({
  selector: 'app-warehouse-parcel-list-dialog',
  templateUrl: './warehouse-parcel-list-dialog.component.html',
  styleUrls: ['./warehouse-parcel-list-dialog.component.css']
})
export class WarehouseParcelListDialogComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<WarehouseParcelListDialogComponent>,
    public notifySer: NotifierService,
    private dialog: MatDialog,
    // @Optional() is used to prevent error if no data is passed
    @Optional() @Inject(MAT_DIALOG_DATA) public data: Object) {
    this.local_data = {...data};
    this.parcels = this.local_data.parcels;
  }

  local_data: any;
  status: any;
  parcels: object[] = [];
  isLoadingResults = true;
  isRateLimitReached = false;

  displayedColumns: string[] = ['parcel_no', 'quantity', 'expiration_date'];


  onNoClick(): void {
    this.dialogRef.close(null);
  }

  ngOnInit(): void {
    this.isLoadingResults = false;
  }

  submit() {
    this.parcels.forEach(element => {
      if (element['expiration_date'] !== null && typeof element['expiration_date'] === 'object') {
        const effDate = new Date(element['expiration_date'].getTime() + (420 * 60 * 1000));
        element['expiration_date'] = effDate.toISOString().split('T')[0];
      }
    });
    this.dialogRef.close(this.parcels);
  }

  /**
   * Format input number
   */
  inputformatNumber(event: any) {
    event.target.value = numeral(event.target.value).format('0,0');
  }

  newParcel() {
    this.isLoadingResults = true;
    const obj = {
      'parcel_no': '',
      'quantity': 1,
      'expiration_date': null
    };
    setTimeout(() => {
      this.parcels.push(obj);
      this.parcels = [...this.parcels];
      this.isLoadingResults = false;
    }, 50);
  }

}
