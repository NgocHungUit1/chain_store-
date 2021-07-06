import {Component, Inject, OnInit, Optional} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {NotifierService} from 'angular-notifier';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE} from '@angular/material/core';
import {MAT_MOMENT_DATE_ADAPTER_OPTIONS, MomentDateAdapter} from '@angular/material-moment-adapter';

export const MY_FORMATS = {
  parse: {
    dateInput: 'DD/MM/YYYY',
  },
  display: {
    dateInput: 'DD/MM/YYYY',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};

@Component({
  selector: 'app-warehouse-parcel-form-dialog',
  templateUrl: './warehouse-parcel-form-dialog.component.html',
  styleUrls: ['./warehouse-parcel-form-dialog.component.css'],
  providers: [
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS]
    },
    {provide: MAT_DATE_FORMATS, useValue: MY_FORMATS},
  ],
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
        const date = new Date(this.form.controls['expiration_date'].value);
        const effDate = new Date(date.getTime() + (420 * 60 * 1000));

        data['expiration_date'] = effDate.toISOString().split('T')[0];
      }

      this.dialogRef.close(data);
    }
  }

}
