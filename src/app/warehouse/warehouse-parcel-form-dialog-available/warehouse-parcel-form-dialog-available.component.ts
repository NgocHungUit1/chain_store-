import {Component, Inject, OnInit, Optional} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {ParcelData} from "../warehouse-parcel-form-dialog-new/warehouse-parcel-form-dialog-new.component";

// interface AvailableParcelData extends AvailableParcel{
//   product_id: string;
// }

@Component({
  selector: 'app-warehouse-parcel-form-dialog-available',
  templateUrl: './warehouse-parcel-form-dialog-available.component.html',
  styleUrls: ['./warehouse-parcel-form-dialog-available.component.css']
})
export class WarehouseParcelFormDialogAvailableComponent {
  constructor(
    public dialogRef: MatDialogRef<WarehouseParcelFormDialogAvailableComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: object) {
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  onSave(): void {
    const raw = this.data['unit_cost'];
    this.data['unit_cost'] = raw !== null && raw !== undefined && raw !== ''
      ? Number(String(raw).replace(/,/g, ''))
      : null;
    this.dialogRef.close(this.data);
  }

}
