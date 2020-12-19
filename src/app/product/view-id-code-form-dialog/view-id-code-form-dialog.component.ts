import { Component, Inject, OnInit, Optional, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { NotifierService } from 'angular-notifier';
import { FormBuilder } from '@angular/forms';
import { jsPDF } from 'jspdf';
import { ProductService } from '../product.service';
import { Option, Product } from '../product.model';
import { CustomerService } from '../../customer/customer.service';
import * as numeral from 'numeral';
import domtoimage from 'dom-to-image';

const JsBarcode = require('jsbarcode');


@Component({
  selector: 'app-view-id-code-form-dialog',
  templateUrl: './view-id-code-form-dialog.component.html',
  styleUrls: ['./view-id-code-form-dialog.component.css']
})

export class ViewIdCodeFormDialogComponent implements OnInit {

  @ViewChild('container') container;

  local_data: any;
  product_id: string;
  product: Product;
  option: Option;
  nameStore: string;
  money: string;
  type: string;

  constructor(
    public dialogRef: MatDialogRef<ViewIdCodeFormDialogComponent>,
    public notifySer: NotifierService,
    private fb: FormBuilder,
    private productSerivce: ProductService,
    private customerService: CustomerService,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: Object) {
    this.local_data = {...data};
    this.product_id = this.local_data.product_id;
    this.option = this.local_data.option;
    this.type = this.local_data.type;
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  ngOnInit(): void {
    // <img id="barcode"/>
    this.productSerivce.getDetail(this.product_id).subscribe(res => {
      this.product = <Product>res;
      if (this.option.in_ten_cua_hang === 'yes') {
        this.customerService.getNameStore().subscribe(name => {
          this.nameStore = name;
        });
      }
      if (this.option.in_gia === 'yes') {
        this.money = numeral(this.product.sell_price).format('0,0');
        if (this.option.in_vnd === 'yes') {
          this.money = this.money + '/VNĐ';
        }
      }
      if (this.option.in_don_vi === 'yes') {
        this.product.product_name = this.product.product_name + ' (' + this.product.base_unit + ')';
      }
      let barcode = this.product.barcode;
      if (this.option.in_ma === 'ma_hang') {
        barcode = this.product.product_no;
      }
      JsBarcode('#barcode')
        .options({font: 'OCR-B'}) // Will affect all barcodes
        .CODE128(barcode, {fontSize: 14, textMargin: 0, width: 1.3, height: 25})
        // .blank(20) // Create space between the barcodes
        // .EAN5('12345', {height: 85, textPosition: 'top', fontSize: 16, marginTop: 15})
        .render();
    });

  }

  generateImage() {
    const product_name = this.product?.product_name;
    setTimeout(() => domtoimage.toPng(this.container.nativeElement)
      .then(function (dataUrl) {
        const img = new Image();
        img.src = dataUrl;

        const link = document.createElement('a');
        link.download = product_name + '.png';
        link.href = dataUrl;
        link.click();
      })
      .catch(function (error) {
        console.error('oops, something went wrong!', error);
      }), 500);

  }

  generatePDF() {
    const product_name = this.product?.product_name;
    const so_luong = this.option.so_luong;
    const type = this.type;
    setTimeout(() => domtoimage.toPng(this.container.nativeElement)
      .then(function (dataUrl) {
        const img = new Image();
        img.src = dataUrl;

        if (type === '104x22') {
          const format = [105, 22];
          const pdf = new jsPDF('l', 'mm', format);
          let position = 2;
          let height = 18;
          if (product_name.length > 40) {
            position = 1;
            height = 20;
          }
          const phan_du = so_luong % 3;
          const so_trang = Math.floor(so_luong / 3);

          if (so_trang > 0) {
            for (let i = 1; i <= so_trang; i++) {
              pdf.addImage(img.src, 'PNG', 0, position, 35, height);
              pdf.addImage(img.src, 'PNG', 35, position, 35, height);
              pdf.addImage(img.src, 'PNG', 70, position, 35, height);
              if (so_trang - i > 0) {
                pdf.addPage(format, 'l');
              }
            }
          }

          if (phan_du > 0) {
            pdf.addPage(format, 'l');
            if (phan_du === 1) {
              pdf.addImage(img.src, 'PNG', 0, position, 35, height);
            } else {
              pdf.addImage(img.src, 'PNG', 0, position, 35, height);
              pdf.addImage(img.src, 'PNG', 35, position, 35, height);
            }
          }
          pdf.save(product_name + '.pdf');

        } // END '104x22'


        if (type === '72x22') {
          const format = [70, 22];
          const pdf = new jsPDF('l', 'mm', format);
          let position = 2;
          let height = 18;
          if (product_name.length > 40) {
            position = 1;
            height = 20;
          }
          const phan_du = so_luong % 2;
          const so_trang = Math.floor(so_luong / 2);

          if (so_trang > 0) {
            for (let i = 1; i <= so_trang; i++) {
              pdf.addImage(img.src, 'PNG', 0, position, 35, height);
              pdf.addImage(img.src, 'PNG', 35, position, 35, height);
              if (so_trang - i > 0) {
                pdf.addPage(format, 'l');
              }
            }
          }

          if (phan_du > 0) {
            pdf.addPage(format, 'l');
            pdf.addImage(img.src, 'PNG', 0, position, 35, height);
          }
          pdf.save(product_name + '.pdf');

        } // END '72x22'


        if (type === '74x22') {
          const format = [74, 22];
          const pdf = new jsPDF('l', 'mm', format);
          let position = 2;
          let height = 18;
          if (product_name.length > 40) {
            position = 1;
            height = 20;
          }
          const phan_du = so_luong % 2;
          const so_trang = Math.floor(so_luong / 2);

          if (so_trang > 0) {
            for (let i = 1; i <= so_trang; i++) {
              pdf.addImage(img.src, 'PNG', 0, position, 36, height);
              pdf.addImage(img.src, 'PNG', 38, position, 36, height);
              if (so_trang - i > 0) {
                pdf.addPage(format, 'l');
              }
            }
          }

          if (phan_du > 0) {
            pdf.addPage(format, 'l');
            pdf.addImage(img.src, 'PNG', 0, position, 36, height);
          }
          pdf.save(product_name + '.pdf');

        } // END '74x22'


        // pdf.addImage(img.src, 'PNG', 0, position, 35, height);
        // pdf.addImage(img.src, 'PNG', 35, position, 35, height);
        // pdf.addImage(img.src, 'PNG', 70, position, 35, height);
        //
        // pdf.addPage([105, 22], 'l');
        // pdf.addImage(img.src, 'PNG', 0, position, 35, height);
        // pdf.addImage(img.src, 'PNG', 35, position, 35, height);
        // pdf.addImage(img.src, 'PNG', 70, position, 35, height);


      })
      .catch(function (error) {
        console.error('oops, something went wrong!', error);
      }), 500);

  }


}
