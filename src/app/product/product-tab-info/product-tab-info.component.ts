import { Component, Input, OnInit } from '@angular/core';
import { ProductService } from "../product.service";
import { Product } from "../product.model";
import { ProductMedicineDialogComponent } from "../product-medicine-dialog/product-medicine-dialog.component";
import { ProductMerchandiseFormDialogComponent } from "../product-merchandise-form-dialog/product-merchandise-form-dialog.component";
import { ProductPopupDeleteDialogComponent } from "../product-popup-delete-dialog/product-popup-delete-dialog.component";
import { MatDialog } from "@angular/material/dialog";
import { NotifierService } from "angular-notifier";

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
    public notifySer: NotifierService,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    const data = [];

    this.product.images.forEach(pImage => {
      data.push(pImage['link']);
    });

    this.images = data;
  }

  loadProduct(id) {
    this.productSer.getProducts(id, 'images,productPlacements,productUnits').subscribe(res => {
      this.product = res;
    });

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
      if (result.event == 'Update') {
        this.loadProduct(result.data.id);
      }

      if (obj.action == 'Copy') { 
        debugger;
        this.productSer.setLoadProduct(false);
      }
    });
  }

  openMerchandiseFormDialog(id, copy_product_id = null) {
    let obj = {
      action: copy_product_id !== null ? 'Copy' : 'Update',
      title: copy_product_id !== null ? 'Sao chép hàng hóa' : 'Cập nhật hàng hóa',
      product_id: id,
      copy_product_id: copy_product_id
    };

    const dialogRef = this.dialog.open(ProductMerchandiseFormDialogComponent, {
      data: obj,
      width: '60%',
      minHeight: '80%',
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result.event !== 'Cancel') {
        this.loadProduct(result.data.id);
      }
    });
  }

  deleteMerchandise(id) {

    let obj = {
      action: 'Delete',
      title: 'Xóa hàng hóa',
      product_id: id,
    };

    const dialogRef = this.dialog.open(ProductPopupDeleteDialogComponent, {
      data: obj,
      width: '20%',
      minHeight: '80%',
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result.event == 'Delete') {
        // BUG
        this.product = null;
      }
    });
  }

  deleteMedicine(id) {
    const obj = {
      action: 'Delete',
      title: 'Xóa thuốc',
      product_id: id,
    };
    const dialogRef = this.dialog.open(ProductPopupDeleteDialogComponent, {
      data: obj,
      width: '20%',
      minHeight: '80%',
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result.event === 'Delete') {
        // BUG
        this.product = null;
      }
    });
  }

}
