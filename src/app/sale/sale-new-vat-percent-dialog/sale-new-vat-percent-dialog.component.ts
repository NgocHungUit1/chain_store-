import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-sale-new-vat-percent-dialog',
  templateUrl: './sale-new-vat-percent-dialog.component.html',
  styleUrls: ['./sale-new-vat-percent-dialog.component.css'],
})
export class SaleNewVatPercentDialogComponent implements OnInit {
  form: FormGroup;

  constructor(
    public dialogRef: MatDialogRef<SaleNewVatPercentDialogComponent>,
    public formBuilder: FormBuilder,
  ) {
    this.form = new FormGroup({});
  }

  ngOnInit(): void {
    this.form = this.formBuilder.group({
      vat: [0, [Validators.required, Validators.min(0), Validators.max(100)]],
    });
  }

  public submit(): void {
    if (this.form.invalid) {
      return;
    }

    this.dialogRef.close({
      success: true,
      data: this.form.controls['vat'].value,
    });

  }

  public onNoClick(): void {
    this.dialogRef.close();
  }
}
