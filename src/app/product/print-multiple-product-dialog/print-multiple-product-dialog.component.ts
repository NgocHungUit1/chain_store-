import {ChangeDetectionStrategy, Component, Inject, OnInit, Optional} from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { NotifierService } from 'angular-notifier';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ViewIdCodeFormDialogComponent } from '../view-id-code-form-dialog/view-id-code-form-dialog.component';
import {ProductService} from '../product.service';
import {IdCodeFormDialogComponent} from '../id-code-form-dialog/id-code-form-dialog.component';
import {MatTableDataSource} from '@angular/material/table';

@Component({
  selector: 'app-print-multiple-product-dialog',
  templateUrl: './print-multiple-product-dialog.component.html',
  styleUrls: ['./print-multiple-product-dialog.component.css'],
  changeDetection: ChangeDetectionStrategy.Default
})
export class PrintMultipleProductDialogComponent implements OnInit {

  local_data: any;
  selected: [];
  dataSource: MatTableDataSource<any> = new MatTableDataSource<any>([]);
  isLoadingResults = false;
  tempData = [];

  constructor(
    public dialogRef: MatDialogRef<PrintMultipleProductDialogComponent>,
    public notifySer: NotifierService,
    public productSer: ProductService,
    private fb: FormBuilder,
    private dialog: MatDialog,
  @Optional() @Inject(MAT_DIALOG_DATA) public data: Object) {
    this.local_data = {...data};
    this.selected = this.local_data.selected;
  }

  onNoClick(): void {
    this.dialogRef.close();
  }


  ngOnInit(): void {
    this.loadData();
  }

  loadData() {
    const tmpData = [];

    this.selected.forEach(item => {
      console.log(item);
      tmpData.push(
        {
          product_no: item['product_no'],
          product_name: item['product_name'],
          print_quantity: item['print_quantity'] ?? 1,
          selected_unit_id: item['productUnits'][0]['id'],
          product_units: item['productUnits'],
        });
    });

    this.tempData = tmpData;

    this.updateDatasource();
  }

  updateDatasource() {
    this.dataSource.data = this.tempData;
  }

  openViewIdCodeFormDialog() {
    const obj = {
      printProductData: this.tempData,
    };

    const dialogRef = this.dialog.open(IdCodeFormDialogComponent, {
      data: obj,
      width: '80%',
      minHeight: '80%',
    });

    dialogRef.afterClosed().subscribe(result => {

    });

  }

  remove(index) {
    this.tempData.splice(index, 1);

    this.updateDatasource();
  }

}
