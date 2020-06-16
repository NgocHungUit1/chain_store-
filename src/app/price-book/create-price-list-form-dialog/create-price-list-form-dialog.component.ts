import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef } from "@angular/material/dialog";
import { NotifierService } from "angular-notifier";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";

@Component({
  selector: 'app-create-price-list-form-dialog',
  templateUrl: './create-price-list-form-dialog.component.html',
  styleUrls: ['./create-price-list-form-dialog.component.css']
})

export class CreatePriceListFormDialogComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<CreatePriceListFormDialogComponent>,
    public notifySer: NotifierService,
    private fb: FormBuilder,
  ) { }

  onNoClick(): void {
    this.dialogRef.close();
  }

  public formPriceList: FormGroup;

  loading = false;


  ngOnInit(): void {
    this.formPriceList = this.fb.group({
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
    if (this.formPriceList.valid) {
      let data = this.formPriceList.getRawValue();
      console.log(data);
      this.dialogRef.close();
      // this.mainSer.create(data).subscribe(res => {
      //   this.notifySer.notify('success', 'Thêm vị trí thành công!');
      //   this.dialogRef.close(res);
      // });
    }
  }

}
