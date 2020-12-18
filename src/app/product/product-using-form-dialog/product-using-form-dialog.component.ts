import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { NotifierService } from 'angular-notifier';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UsingService } from '../using.service';

@Component({
  selector: 'app-product-using-form-dialog',
  templateUrl: './product-using-form-dialog.component.html',
  styleUrls: ['./product-using-form-dialog.component.css']
})
export class ProductUsingFormDialogComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<ProductUsingFormDialogComponent>,
    public notifySer: NotifierService,
    private fb: FormBuilder,
    private mainSer: UsingService,
  ) {
  }

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
          Validators.maxLength(32)
        ])
      ],
    });
  }

  submit() {
    if (this.form.valid) {
      const data = this.form.getRawValue();
      this.mainSer.create(data).subscribe(res => {
        this.notifySer.notify('success', 'Thêm đường dùng thành công!');
        this.dialogRef.close(res);
      });
    }
  }

}
