import {Component, Inject, OnInit} from '@angular/core';
import {MatDialogRef} from '@angular/material/dialog';
import {NotifierService} from 'angular-notifier';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';

@Component({
  selector: 'app-warehouse-parcel-form-dialog',
  templateUrl: './warehouse-parcel-form-dialog.component.html',
  styleUrls: ['./warehouse-parcel-form-dialog.component.css']
})
export class WarehouseParcelFormDialogComponent implements OnInit {
  public form: FormGroup;

  constructor(
    public dialogRef: MatDialogRef<WarehouseParcelFormDialogComponent>,
    public notifySer: NotifierService,
    private fb: FormBuilder,
  ) { }

  onNoClick(): void {
    this.dialogRef.close();
  }

  ngOnInit(): void {
    this.form = this.fb.group({
      parcel_no: [
        null,
        Validators.compose([
          Validators.required,
          Validators.maxLength(32)
        ])
      ],
      quantity: [1],
      expiration_date: [null, Validators.required],
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
