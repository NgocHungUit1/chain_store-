import {Component, Inject, OnInit, Optional} from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from "@angular/material/dialog";
import {FormControl, FormGroup, Validators} from "@angular/forms";

export interface ParcelData  {
  parcel_no: string;
  expiration_date: Date;
  quantity: number;
  product_id: string;
}


@Component({
  selector: 'app-warehouse-parcel-form-dialog-new',
  styleUrls: ['./warehouse-parcel-form-dialog-new.component.css'],
  templateUrl: './warehouse-parcel-form-dialog-new.component.html',
})
export class WarehouseParcelFormDialogNewComponent implements OnInit {
  parcelForm: FormGroup;
  constructor(
    public dialogRef: MatDialogRef<WarehouseParcelFormDialogNewComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: ParcelData) {

    console.log('Dialog data:', data);
    this.parcelForm = new FormGroup({
      parcel_no: new FormControl('', [Validators.required]),
      expiration_date: new FormControl('', [Validators.required]),
      quantity: new FormControl('', [
        Validators.required,
        Validators.min(1),
      ])
    });
  }
  onNoClick(): void {
    this.dialogRef.close();
  }
  ngOnInit() {
    // If editing, set initial values
    if (this.data) {
      this.parcelForm.patchValue({
        parcel_no: this.data.parcel_no,
        expiration_date: this.data.expiration_date,
        quantity: this.data.quantity
      });
    }
  }
  onSave(): void {
    if (this.parcelForm.valid) {

      this.dialogRef.close(this.parcelForm.value);
    } else {
      this.markFormGroupTouched(this.parcelForm);
    }
  }
  private markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }
}
