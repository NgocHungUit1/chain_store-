import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import * as numeral from 'numeral';
import { ProductService } from '../../product/product.service';
import { Product } from '../../product/product.model';
import { NotifierService } from 'angular-notifier';

@Component({
  selector: 'app-warehouse-unit-create-dialog',
  templateUrl: './warehouse-unit-create-dialog.component.html',
  styleUrls: ['./warehouse-unit-create-dialog.component.css']
})
export class WarehouseUnitCreateDialogComponent implements OnInit {

  form: FormGroup;

  public product: any;
  constructor(
    public fb: FormBuilder,
    public dialogRef: MatDialogRef<WarehouseUnitCreateDialogComponent>,
    private productService: ProductService,
    private notifySer: NotifierService,
    @Inject(MAT_DIALOG_DATA) public data: any) {
    this.product = data.product;
  }

  ngOnInit(): void {
    this.initForm();
    console.log(this.data);
  }


  get units() {
    return this.form.get('units') as FormArray;
  }


  initForm() {
    this.form = this.fb.group({
      units: new FormArray([]),
    });
  }

  changeUnitValue(event: any, i) {
    const value = event.target.value;
    this.units.controls[i].patchValue({
      unit_price: numeral(value * numeral(this.data.price).value()).value(),
    });
  }

  changeBaseUnitValue(event: any, i) {
    const value = numeral(event.target.value).value();
    this.units.controls[i].patchValue({
      unit_price: numeral(value).value(),
    });
  }

  removeUnit(i) {
    this.units.removeAt(i);
  }

  addUnit() {
    const index = this.units.length + 1;

    const unitPrice = numeral(2 * numeral(this.data.price).value()).value();
    const group = new FormGroup({
      unit_name: new FormControl('', Validators.required),
      unit_value: new FormControl(2, Validators.required),
      unit_price: new FormControl(unitPrice, Validators.required),
      unit_no: new FormControl(this.product.product_no + '-' + this.data.productUnits.length + index)
    });

    this.units.push(group);
  }

  save() {
    if (!this.form.valid) { return; }

    const units = this.form.value['units'];

    let isValidUnitNo = true;
    units.forEach((unit) => {
      if (this.data.productUnits.find(productUnit => productUnit.no === unit.unit_no)) {
        isValidUnitNo = false;
        this.notifySer.notify('error', 'Đã tồn tại mã đơn vị ' + unit.unit_no);
        return;
      }
      if (this.data.productUnits.find(productUnit => productUnit.name === unit.unit_name)) {
        isValidUnitNo = false;
        this.notifySer.notify('error', 'Tên đơn vị "' + unit.unit_name + '" đã tồn tại trong sản phẩm này');
        return;
      }
    });

    if (!isValidUnitNo) {
      return;
    }

    this.product['units'] = units;
    const unitFormActive = units[0];

    this.productService.update(this.product.id, this.product, 'productUnits').subscribe(
      (product: Product) => {
        this.notifySer.notify('success', ' Thêm đơn vị cho sản phầm thành công!');
        const  productUnits = product.productUnits;

        const unitActive = productUnits.find(
          unit => unit.no === unitFormActive.unit_no
        );
        this.dialogRef.close({
          success: true,
          data: product.productUnits,
          unit_id_active: unitActive ? unitActive.id : null
        });
      },
      error => {
        console.log(error);
        this.notifySer.notify('error', 'Có lỗi trong quá trình thêm đơn vị cho SP!');
      });

  }
}
