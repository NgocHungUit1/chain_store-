import {Component, Input, OnInit} from '@angular/core';
import {ProductService} from "../product.service";
import {Product} from "../product.model";
import {ProductMedicineDialogComponent} from "../product-medicine-dialog/product-medicine-dialog.component";
import {MatDialog} from "@angular/material/dialog";


@Component({
  selector: 'app-product-tab-info',
  templateUrl: './product-tab-info.component.html',
  styleUrls: ['./product-tab-info.component.css']
})
export class ProductTabInfoComponent implements OnInit {

  @Input() product: Product;

  images: string[] = [];
  imageIndex = 0;

  constructor(
    private productSer: ProductService,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    const data = [];

    this.product.images.forEach(pImage => {
      data.push(pImage['link']);
    });

    this.images = data;
  }

  openMedicineDialog(id, copy_product_id = null) {
    const obj = {
      action: copy_product_id !== null ? 'Copy' : 'Update',
      title: copy_product_id !== null ? 'Sao chép thuốc' : 'Cập nhật thuốc',
      product_id: id,
      copy_product_id: copy_product_id
    };

    const dialogRef = this.dialog.open(ProductMedicineDialogComponent, {
      data: obj,
      width: '60%',
      minHeight: '80%',
    });

    dialogRef.afterClosed().subscribe(result => {
      // this.product = result;
    });
  }

}
