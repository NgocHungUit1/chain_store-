import { Component, Inject, OnInit, Optional } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { NotifierService } from 'angular-notifier';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-warehouse-parcel-form-dialog',
  templateUrl: './warehouse-parcel-form-dialog.component.html',
  styleUrls: ['./warehouse-parcel-form-dialog.component.css']
})
export class WarehouseParcelFormDialogComponent implements OnInit {
  public form: FormGroup;
  local_data: any;
  parcels: object[];

  constructor(
    public dialogRef: MatDialogRef<WarehouseParcelFormDialogComponent>,
    public notifySer: NotifierService,
    private fb: FormBuilder,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.data = {...data};
    this.parcels = this.data.parcels;
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  ngOnInit(): void {
    let parcel_no_value = null;
    let expiration_date_value = null;
    if (this.parcels.length > 0) {
      const aParcel = this.parcels;
      parcel_no_value = aParcel[0]['parcel_no'];
      expiration_date_value = aParcel[0]['expiration_date'];
    }
    this.form = this.fb.group({
      parcel_no: [
        parcel_no_value,
        Validators.compose([
          Validators.required,
          Validators.maxLength(32)
        ])
      ],
      quantity: [1],
      expiration_date: [expiration_date_value, Validators.required],
    });
  }

  submit() {
    if (this.form.valid) {
      const data = this.form.getRawValue();

      if (this.form.controls['expiration_date'].value !== null && typeof this.form.controls['expiration_date'].value === 'object') {
        const effDate = new Date(this.form.controls['expiration_date'].value.getTime() + (420 * 60 * 1000));

        data['expiration_date'] = effDate.toISOString().split('T')[0];
      }

      this.dialogRef.close(data);
    }
  }

}
