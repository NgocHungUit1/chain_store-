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
  printProductData: [];

  constructor(
    public dialogRef: MatDialogRef<IdCodeFormDialogComponent>,
    public notifySer: NotifierService,
    public productSer: ProductService,
    private fb: FormBuilder,
    private dialog: MatDialog,
  @Optional() @Inject(MAT_DIALOG_DATA) public data: Object) {
    this.local_data = {...data};
    this.printProductData = this.local_data.printProductData;
  }

  public form: FormGroup;
  selected = 'option2';

  onNoClick(): void {
    this.dialogRef.close();
  }


  ngOnInit(): void {
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

    let totalPrint = 0;
    this.printProductData.forEach(item => {
      totalPrint = totalPrint + item['print_quantity'];
    });
    this.form.patchValue({so_luong: totalPrint});
    if (this.printProductData.length > 1) {
      this.form.controls['so_luong'].disable();
    }

  }

  submit() {

  }

  openViewIdCodeFormDialog(type: string) {
    const data = this.form.getRawValue();
    data['type'] = type;
    data['productData'] = this.printProductData;

    this.productSer.getPdfBarcode(data).subscribe(res => {

      const obj = {
        base64: res
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
