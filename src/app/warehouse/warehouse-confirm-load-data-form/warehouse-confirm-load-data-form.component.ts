import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-warehouse-confirm-load-data-form',
  templateUrl: './warehouse-confirm-load-data-form.component.html',
  styleUrls: ['./warehouse-confirm-load-data-form.component.css']
})
export class WarehouseConfirmLoadDataFormComponent implements OnInit {

  constructor(  public dialogRef: MatDialogRef<WarehouseConfirmLoadDataFormComponent>) { }
  onNoClick(): void {
    this.dialogRef.close(false);
  }
  ngOnInit(): void {
  }

  onSave() {
    this.dialogRef.close(true);
  }
}
