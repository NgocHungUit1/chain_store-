import { Component, OnInit } from '@angular/core';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from "@angular/material/dialog";
import {FormArray, FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";


@Component({
  selector: 'app-product-merchandise-form-dialog',
  templateUrl: './product-merchandise-form-dialog.component.html',
  styleUrls: ['./product-merchandise-form-dialog.component.css']
})
export class ProductMerchandiseFormDialogComponent implements OnInit {

  action: string;
  title: string;
  loading = false;
  public form: FormGroup;

  constructor(public dialogRef: MatDialogRef<ProductMerchandiseFormDialogComponent>) {

  }

  ngOnInit() {

  }

  closeDialog() {
    this.dialogRef.close({event: 'Cancel'});
  }

}
