import { Component, OnInit, Inject, Optional } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { OrderService } from '../order.service';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { Product } from '../../product/product.model';
import { ColumnVisibilityMap, SaleColumnVisibilityService } from '../../shared/sale-column-visibility.service';
import { SaleNewVatPercentDialogComponent } from '../sale-new-vat-percent-dialog/sale-new-vat-percent-dialog.component';

const SALE_VAT_PERCENT_STORAGE_KEY = 'rx20_sale_vat_percents';

@Component({
  selector: 'app-price-detail-order-dialog',
  templateUrl: './price-detail-order-dialog.component.html',
  styleUrls: ['./price-detail-order-dialog.component.css']
})
export class PriceDetailOrderDialogComponent implements OnInit {

  local_data: any;
  i: any;
  product: Product;
  common_price: any;
  commonPriceDetailOrderText: string;

  isVat = false;
  vatPercentOptions = [
    {name: 'VAT 0%', value: 0},
    {name: 'VAT 5%', value: 5},
    {name: 'VAT 8%', value: 8},
    {name: 'VAT 10%', value: 10},
  ];

  constructor(
    public dialogRef: MatDialogRef<PriceDetailOrderDialogComponent>,
    private orderService: OrderService,
    private fb: FormBuilder,
    private dialog: MatDialog,
    private saleColumnVisibilityService: SaleColumnVisibilityService,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: Object) {
    this.local_data = { ...data };
    this.i = this.local_data.i;
    this.product = this.local_data.product;
    this.common_price = this.local_data.common_price;
    this.isVat = this.local_data.is_vat || false;

    // Lấy vatPercentOptions từ storage nếu có
    if (localStorage.getItem(SALE_VAT_PERCENT_STORAGE_KEY) !== null) {
      let storageData: { name: string; value: number; }[];
      try {
        storageData = JSON.parse(localStorage.getItem(SALE_VAT_PERCENT_STORAGE_KEY));
      } catch (e) {
        console.log(e);
      }
      this.vatPercentOptions = storageData ? storageData : this.vatPercentOptions;
    }

    if (this.product.vat_percent !== null) {
      const vatPercentExist = this.vatPercentOptions.find(x => x.value === this.product.vat_percent);
      if (!vatPercentExist) {
        this.vatPercentOptions.push({
          name: `VAT ${this.product.vat_percent}%`,
          value: this.product.vat_percent
        });
        this.vatPercentOptions.sort((a, b) => a.value - b.value);
        localStorage.setItem(SALE_VAT_PERCENT_STORAGE_KEY, JSON.stringify(this.vatPercentOptions));
      }
    }
  }

  public form: FormGroup;

  typeItems: any[] = [
    {
      'id': 'price',
      'title': 'VNĐ'
    },
    {
      'id': 'percent',
      'title': '%'
    }
  ];

  onNoClick(): void {
    this.dialogRef.close();
  }


  ngOnInit(): void {
    var discountType = 'price';
    var discountPrice = '0';
    this.saleColumnVisibilityService.visibility$.subscribe((map: ColumnVisibilityMap) => {
      if (map.discount) {
        discountType = map.discount + "";
      }
    });

    let endPrice = this.common_price;
    const vatPercent = this.product.vat_percent || 0;

    if (this.product.discount_type) {
      discountType = this.product.discount_type;
    }
    if (this.product.discount) {
      discountPrice = this.product.discount;
    }
    if (this.product.end_price) {
      endPrice = this.product.end_price;
    }

    const priceWithVat = this.isVat ? Math.round(this.parseToNumber(endPrice) *  (1 + vatPercent / 100)) : this.parseToNumber(endPrice);

    this.commonPriceDetailOrderText = this.common_price;
    this.form = this.fb.group({
      commonPriceDetailOrder: [
        this.common_price,
        Validators.compose([
          Validators.required,
          Validators.maxLength(32)
        ])
      ],
      discountTypePriceDetailOrder: [discountType],
      discountPriceDetailOrder: [discountPrice],
      endPriceDetailOrder: [endPrice],
      vatPercentSelect: [vatPercent],
      priceWithVat: [priceWithVat]
    });

  }

  submit() {
    const product = this.product;
    product.discount_type = this.form.controls['discountTypePriceDetailOrder'].value;
    product.discount = this.form.controls['discountPriceDetailOrder'].value;
    product.end_price = this.parseToNumber(this.form.controls['endPriceDetailOrder'].value).toString();
    product.vat_percent = this.parseToNumber(this.form.controls['vatPercentSelect'].value);
    this.orderService.updateProduct(this.i, product);
    this.dialogRef.close();
  }

  updateEvent() {
    const data = this.form.getRawValue();
    if (data.discountTypePriceDetailOrder === 'percent' && data.discountPriceDetailOrder > 100) {
      this.form.patchValue({
        discountPriceDetailOrder: 100,
      });
      return;
    }
    if (data.discountTypePriceDetailOrder === 'percent') {
      const endPrice = this.common_price * (100 - data.discountPriceDetailOrder) / 100;
      this.form.patchValue({
        endPriceDetailOrder: endPrice,
      });
      return;
    }
    if (data.discountTypePriceDetailOrder === 'price') {
      const endPrice = parseInt(this.common_price) - parseInt(data.discountPriceDetailOrder);
      this.form.patchValue({
        endPriceDetailOrder: endPrice,
      });
      return;
    }
  }

  onEndPriceChange() {
    this.form.patchValue({
      discountPriceDetailOrder: 0,
      discountTypePriceDetailOrder: 'price'
    });

    const price = this.parseToNumber(this.form.controls['endPriceDetailOrder'].value) || 0;
    const vatPercent = this.parseToNumber(this.form.controls['vatPercentSelect'].value) || 0;

    this.form.controls['priceWithVat'].setValue(Math.round(price * (1 + Number(vatPercent) / 100)));
  }

  onChangeVatPercent(value: number) {
    this.form.controls['vatPercentSelect'].setValue(value);

    const price = this.parseToNumber(this.form.controls['endPriceDetailOrder'].value) || 0;
    this.form.controls['priceWithVat'].setValue(Math.round(price * (1 + Number(value) / 100)));
  }

  onChangePriceWithVat() {
    const vatPercent = this.parseToNumber(this.form.controls['vatPercentSelect'].value) || 0;
    const priceWithVat =  this.parseToNumber(this.form.controls['priceWithVat'].value) || 0;

    const price = Math.round(priceWithVat / (1 + (vatPercent / 100)));
    this.form.controls['endPriceDetailOrder'].setValue(price);
  }

  onOpenAddNewVatPercentDialog(): void {
    const dialogRef = this.dialog.open(SaleNewVatPercentDialogComponent, {
      width: '80%',
      maxWidth: '400px',
      minHeight: '80%',
      maxHeight: '400px',
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && result.success) {
        const vatPercentExist = this.vatPercentOptions.find(x => x.value === Number(result.data));
        if (!vatPercentExist) {
          this.vatPercentOptions.push({
            name: `VAT ${result.data}%`,
            value: Number(result.data)
          });

          this.vatPercentOptions.sort((a, b) => a.value - b.value);
          localStorage.setItem(SALE_VAT_PERCENT_STORAGE_KEY, JSON.stringify(this.vatPercentOptions));
        }

        this.onChangeVatPercent(Number(result.data));
      }
    });
  }

  parseToNumber(value: any): number {
    if (!value) { return 0; }

    const strValue = String(value);
    return Number(strValue.replace(/,/g, ''));
  }
}
