import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-product-new-unit',
  templateUrl: './product-new-unit.component.html',
  styleUrls: ['./product-new-unit.component.css']
})
export class ProductNewUnitComponent implements OnInit {
  form: FormGroup;
  constructor(    public dialogRef: MatDialogRef<ProductNewUnitComponent>,
                  public formBuilder: FormBuilder,
  ) {
    this.form = new FormGroup({})
  }

  ngOnInit(): void {
    this.form = this.formBuilder.group({
      name: ''
    })
  }

  submit() {
    if(this.form.valid) {
      this.dialogRef.close(this.form.get('name').value);

    }
  }
  onNoClick(): void {
    this.dialogRef.close();
  }
}
