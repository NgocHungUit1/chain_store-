import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { NotifierService } from 'angular-notifier';
import { FormBuilder } from '@angular/forms';

const JsBarcode = require('jsbarcode');

@Component({
  selector: 'app-view-id-code-form-dialog',
  templateUrl: './view-id-code-form-dialog.component.html',
  styleUrls: ['./view-id-code-form-dialog.component.css']
})
export class ViewIdCodeFormDialogComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<ViewIdCodeFormDialogComponent>,
    public notifySer: NotifierService,
    private fb: FormBuilder) {
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  ngOnInit(): void {
    // <img id="barcode"/>

    JsBarcode('#barcode')
      .options({font: 'OCR-B'}) // Will affect all barcodes
      .CODE128('HH036-12', {fontSize: 16, textMargin: 0, width: 2, height: 25})
      // .blank(20) // Create space between the barcodes
      // .EAN5('12345', {height: 85, textPosition: 'top', fontSize: 16, marginTop: 15})
      .render();
    // console.log('nghia');
    // return;
  }

}
