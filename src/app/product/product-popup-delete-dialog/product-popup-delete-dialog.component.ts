import { Component,Optional ,Inject, OnInit } from '@angular/core';
import {ProductService} from "../product.service";
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from "@angular/material/dialog";
import {FormArray, FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {Observable} from 'rxjs';
import {NotifierService} from "angular-notifier";
import {GroupService} from "../group.service";
import {Group, GroupFilter} from "../group.model";
import {PlacementService} from "../placement.service";
import {PlacementFilter} from "../placement.model";
@Component({
  selector: 'app-product-popup-delete-dialog',
  templateUrl: './product-popup-delete-dialog.component.html',
  styleUrls: ['./product-popup-delete-dialog.component.css']
})
export class ProductPopupDeleteDialogComponent implements OnInit {

  action: string;
  title: string;
  local_data: any;
  product_id: string;


  constructor(
    public dialogRef: MatDialogRef<ProductPopupDeleteDialogComponent>,
    private fb: FormBuilder,
    private productSer: ProductService,
    private groupSer: GroupService,
    public notifySer: NotifierService,
    private placementSer: PlacementService,
    private dialog: MatDialog,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: Object) {
      this.local_data = {...data};
      this.action = this.local_data.action;
      this.title = this.local_data.title;
      this.product_id = this.local_data.product_id;
  }

  ngOnInit(): void {
  }

  closeDialog() {
    this.dialogRef.close({event: 'Cancel'});
  }

  delete(){
    this.productSer.delete(this.product_id).subscribe(product => {
      this.notifySer.notify('success', 'Xóa hàng hóa thành công!');
      this.dialogRef.close({event: 'Delete'});
    });
  }

}
