import {Component, Inject, OnInit} from '@angular/core';
import {MatDialogRef} from "@angular/material/dialog";
import {NotifierService} from "angular-notifier";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {PlacementService} from "../placement.service";

@Component({
  selector: 'app-product-placement-form-dialog',
  templateUrl: './product-placement-form-dialog.component.html',
  styleUrls: ['./product-placement-form-dialog.component.css']
})
export class ProductPlacementFormDialogComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<ProductPlacementFormDialogComponent>,
    public notifySer: NotifierService,
    private fb: FormBuilder,
    private mainSer: PlacementService,
  ) { }

  onNoClick(): void {
    this.dialogRef.close();
  }

  public form: FormGroup;
  loading = false;

  ngOnInit(): void {
    this.form = this.fb.group({
      store_id: [1],
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
      let data = this.form.getRawValue();
      this.mainSer.create(data).subscribe(res => {
        this.notifySer.notify('success', 'Thêm vị trí thành công!');
        this.dialogRef.close(res);
      });
    }
  }

}
