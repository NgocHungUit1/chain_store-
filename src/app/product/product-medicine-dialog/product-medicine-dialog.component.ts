import {Component, Inject, OnInit, Optional} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {CustomValidators} from "ngx-custom-validators";
import {ProductService} from "../product.service";
import {NotifierService} from "angular-notifier";

@Component({
  selector: 'app-product-medicine-dialog',
  templateUrl: './product-medicine-dialog.component.html',
  styleUrls: ['./product-medicine-dialog.component.css']
})
export class ProductMedicineDialogComponent implements OnInit {

  action: string;
  title: string;
  local_data: any;
  public form: FormGroup;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private productSer: ProductService,
    public dialogRef: MatDialogRef<ProductMedicineDialogComponent>,
    public notifySer: NotifierService,
    //@Optional() is used to prevent error if no data is passed
    @Optional() @Inject(MAT_DIALOG_DATA) public data: Object) {
    // console.log(data);
    this.local_data = { ...data };
    this.action = this.local_data.action;
    this.title = this.local_data.title;
  }

  ngOnInit() {
    this.form = this.fb.group({
      product_no: [
        null,
        Validators.compose([
          Validators.required,
          Validators.minLength(5),
          Validators.maxLength(10)
        ])
      ],
      barcode: [
        null
      ],
      product_type: [
        'medicine'
      ],
      store_id: [
        1
      ],
      shortcut: [
        null
      ],
      using_id: [
        1
      ],
      group_id: [
        1
      ],
      product_name: [
        null,
        Validators.required
      ],
      sell_price: [
        null
      ],
      original_price: [
        null
      ],
      weight: [
        null
      ],
    });
  }

  submit() {
    if (this.form.valid) {
      this.loading = true;
      const data = this.form.getRawValue();
      this.productSer.create(data).subscribe(res => {
        this.loading = false;
        this.notifySer.notify('success', 'Thêm thuốc thành công!');
        this.dialogRef.close({ event: this.action, data: res });
      });
    }
  }

  doAction() {
    this.dialogRef.close({ event: this.action, data: this.local_data });
  }

  closeDialog() {
    this.dialogRef.close({ event: 'Cancel' });
  }

}
