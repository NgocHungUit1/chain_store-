import { Component, OnInit } from '@angular/core';
import {MatDialogRef} from "@angular/material/dialog";
import {NotifierService} from "angular-notifier";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {GroupService} from "../group.service";

@Component({
  selector: 'app-product-group-form-dialog',
  templateUrl: './product-group-form-dialog.component.html',
  styleUrls: ['./product-group-form-dialog.component.css']
})
export class ProductGroupFormDialogComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<ProductGroupFormDialogComponent>,
    public notifySer: NotifierService,
    private fb: FormBuilder,
    private groupSer: GroupService,
  ) { }

  public form: FormGroup;
  loading = false;

  ngOnInit(): void {
    this.form = this.fb.group({
      name: [
        null,
        Validators.compose([
          Validators.required,
          Validators.maxLength(32)
        ])
      ],
      parent_id: [
        null
      ],
    });
  }

}
