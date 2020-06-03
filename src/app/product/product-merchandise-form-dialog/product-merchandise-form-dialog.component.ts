import { Component, OnInit } from '@angular/core';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from "@angular/material/dialog";
import {FormArray, FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {Observable} from 'rxjs';


@Component({
  selector: 'app-product-merchandise-form-dialog',
  templateUrl: './product-merchandise-form-dialog.component.html',
  styleUrls: ['./product-merchandise-form-dialog.component.css']
})
export class ProductMerchandiseFormDialogComponent implements OnInit {

  action: string;
  title: string;
  public form: FormGroup;
  loading = false;

  // groups: Group[] = [];
  usings = [];
  placements = [];
  manufacturers = [];

  // filteredMedicines: Observable<Medicine[]>;

  fieldLabels = {

  };

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<ProductMerchandiseFormDialogComponent>) {

  }


  initForm(){
    this.form = this.fb.group({
      name : [null, Validators.required],
    })
  }


  ngOnInit() {

    this.initForm();
  }

  closeDialog() {
    this.dialogRef.close({event: 'Cancel'});
  }
  submit(action){
    console.log();

  }

}
