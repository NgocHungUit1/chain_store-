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
  printProductData: any[] = [];

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
    data['productData'].forEach(item => {
      const selectedUnit = item['product_units'].find(unit => unit['id'] === item['selected_unit_id']);
      if (selectedUnit) {
        item['selected_unit'] = selectedUnit;
      }
    });

    this.productSer.getPdfBarcode(data).subscribe((res: any) => {
      if (res && res.success === true) {
        const obj = {
          base64: res.data,
        };

        const dialogRef = this.dialog.open(ViewIdCodeFormDialogComponent, {
          data: obj,
          width: '80%',
          height: '80%',
          maxWidth: '800px',
          maxHeight: '500px',
          panelClass: 'rx20',
        });

        dialogRef.afterClosed().subscribe(result => {});
      } else {
        this.notifySer.notify('error', res.message || 'Lỗi không thể tạo mã vạch');
      }
    });
    // 130/83

  }

}
