import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormControl, FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { NotifierService } from 'angular-notifier';
import { Observable } from 'rxjs';
import { Product } from '../../product/product.model';

@Component({
  selector: 'app-sale-main',
  encapsulation: ViewEncapsulation.None,
  templateUrl: './sale-main.component.html',
  styleUrls: ['./sale-main.component.css']
})
export class SaleMainComponent implements OnInit {


  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private dialog: MatDialog,
    private notifySer: NotifierService,
  ) { 
    // super();
  }

  selectProduct = new FormControl();
  filteredProducts: Observable<Product[]>;

  ngOnInit(): void {

  }
  

  onSelectedProduct(product) {
    // const priceListID = this.priceListForm.controls['priceLists'].value;

    // if (priceListID === undefined) {
    //   this.notifySer.notify('warning', 'Chưa chọn bảng giá!');
    // } else {
    //   this.handlePriceListProduct(product, priceListID);
    // }
    // this.selectProduct.patchValue(null);
  }

}
