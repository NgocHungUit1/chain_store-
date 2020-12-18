import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { NotifierService } from 'angular-notifier';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ManufacturerService } from '../manufacturer.service';

@Component({
  selector: 'app-product-manufacturer-form-dialog',
  templateUrl: './product-manufacturer-form-dialog.component.html',
  styleUrls: ['./product-manufacturer-form-dialog.component.css']
})
export class ProductManufacturerFormDialogComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<ProductManufacturerFormDialogComponent>,
    public notifySer: NotifierService,
    private fb: FormBuilder,
    private mainSer: ManufacturerService,
  ) { }

  public form: FormGroup;
  loading = false;

  onNoClick(): void {
    this.dialogRef.close();
  }

  ngOnInit(): void {
    this.form = this.fb.group({
      name: [
        null,
        Validators.compose([
          Validators.required,
          Validators.maxLength(200)
        ])
      ],
    });
  }

  submit() {
    if (this.form.valid) {
      const data = this.form.getRawValue();
      this.mainSer.create(data).subscribe(res => {
        this.notifySer.notify('success', 'Thêm vị trí thành công!');
        this.dialogRef.close(res);
      });
    }
  }

}
