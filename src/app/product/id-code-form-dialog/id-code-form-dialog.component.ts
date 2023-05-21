import { Component, Inject, OnInit, Optional } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { NotifierService } from 'angular-notifier';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ViewIdCodeFormDialogComponent } from '../view-id-code-form-dialog/view-id-code-form-dialog.component';
import {ProductService} from '../product.service';

@Component({
  selector: 'app-id-code-form-dialog',
  templateUrl: './id-code-form-dialog.component.html',
  styleUrls: ['./id-code-form-dialog.component.css']
})
export class IdCodeFormDialogComponent implements OnInit {

  local_data: any;
  product_id: string;

  constructor(
    public dialogRef: MatDialogRef<IdCodeFormDialogComponent>,
    public notifySer: NotifierService,
    public productSer: ProductService,
    private fb: FormBuilder,
    private dialog: MatDialog,
  @Optional() @Inject(MAT_DIALOG_DATA) public data: Object) {
    this.local_data = {...data};
    this.product_id = this.local_data.product_id;
  }

  public form: FormGroup;
  selected = 'option2';

  onNoClick(): void {
    this.dialogRef.close();
  }


  ngOnInit(): void {
    // console.log(this.product_id);
    this.form = this.fb.group({
      so_luong: [
        30,
      ],
      in_ma: [
        'ma_hang',
      ],
      in_gia: [
        'yes'
      ],
      in_vnd: [
        'yes'
      ],
      in_don_vi: [
        'yes'
      ],
      in_ten_cua_hang: [
        'no'
      ],
    });

  }

  submit() {

  }

  openViewIdCodeFormDialog(type: string) {
    const data = this.form.getRawValue();
    data['type'] = type;

    this.productSer.getPdfBarcode(this.product_id, data).subscribe(res => {

      const obj = {
        base64: res,
        // product_id: this.product_id,
        // option: data,
        // type: type,
      };

      const dialogRef = this.dialog.open(ViewIdCodeFormDialogComponent, {
        data: obj,
        width: '500px',
        height: '300px',
        panelClass: 'rx20',
      });

      dialogRef.afterClosed().subscribe(result => {

      });
    });
    // 130/83

  }

}
