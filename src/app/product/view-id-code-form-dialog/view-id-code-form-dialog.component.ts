import { Component, Inject, OnInit, Optional } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { NotifierService } from 'angular-notifier';
import { FormBuilder } from '@angular/forms';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { ProductService } from '../product.service';
import { Option, Product } from '../product.model';
import { CustomerService } from '../../customer/customer.service';
import * as numeral from 'numeral';
const JsBarcode = require('jsbarcode');
import * as htmlToImage from 'html-to-image';
import * as download from 'downloadjs';
import { toPng, toJpeg, toBlob, toPixelData, toSvg } from 'html-to-image';


@Component({
  selector: 'app-view-id-code-form-dialog',
  templateUrl: './view-id-code-form-dialog.component.html',
  styleUrls: ['./view-id-code-form-dialog.component.css']
})

export class ViewIdCodeFormDialogComponent implements OnInit {

  local_data: any;
  product_id: string;
  product: Product;
  option: Option;
  nameStore: string;
  money: string;

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


    // console.log('nghia');
    // return;
  }

  generatePDF() {
    // this.notifySer.
    // const data = document.getElementById('contentToConvert');
    // const data = document.getElementById('image-print');
    //
    // html2canvas(data).then(canvas => {
    //   const imgWidth = 102;
    //   const imgHeight = canvas.height * imgWidth / canvas.width;
    //
    //   const img = new Image();
    //   img.src = canvas.toDataURL('image/png');
    //   img.width = 83;
    //   const pdf = new jsPDF('l', 'mm', [104, 22]);
    //   const position = 0;
    //   pdf.addImage(img.src, 'PNG', 0, position, imgWidth, imgHeight);
    //
    //   // const contentDataURL = canvas.toDataURL('image/png');
    //   // const pdf = new jsPDF('l', 'mm', [104, 22]);
    //   // const position = 0;
    //   // pdf.addImage(contentDataURL, 'PNG', 0, position, imgWidth, imgHeight);
    //   // pdf.setLineWidth(100);
    //   pdf.save('Ma_Vach.pdf');
    // });

    const data = document.getElementById('image-print');

    htmlToImage.toPng(data)
      .then(function (dataUrl) {

        // const imgWidth = 102;
        // const imgHeight = canvas.height * imgWidth / canvas.width;

        const img = new Image();
        img.src = dataUrl;
        download(dataUrl, 'my-node.png');
        // img.width = 83;
        // // document.body.appendChild(img);
        // const pdf = new jsPDF('l', 'mm', [104, 22]);
        // const position = 0;
        // pdf.addImage(img.src, 'PNG', 0, position, 130, 83);
        // pdf.save('Ma_Vach.pdf');
      })
      .catch(function (error) {
        console.error('oops, something went wrong!', error);
      });
  }

}
