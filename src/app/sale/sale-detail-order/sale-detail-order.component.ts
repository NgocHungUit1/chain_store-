import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { OrderService } from '../order.service';
import { ActivatedRoute } from '@angular/router';
import { PriceListProductService } from '../../price-book/price-list-product.service';
import { NoteDetailOrderDialogComponent } from '../note-detail-order-dialog/note-detail-order-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { observable } from 'rxjs';
import { PriceDetailOrderDialogComponent } from '../price-detail-order-dialog/price-detail-order-dialog.component';
import { Product } from '../../product/product.model';

@Component({
  selector: 'app-sale-detail-order',
  encapsulation: ViewEncapsulation.None,
  templateUrl: './sale-detail-order.component.html',
  styleUrls: ['./sale-detail-order.component.css']
})
export class SaleDetailOrderComponent implements OnInit {

  listProduct: any = [];
  countProduct: number = 0;
  isLoadingResults = true;

  constructor(
    private orderService: OrderService,
    private route: ActivatedRoute,
    private priceListProductSer: PriceListProductService,
    private dialog: MatDialog,
  ) { }

  loadData() {

    this.orderService.subscribeObjectOrder.subscribe(res => {
      if (res !== null && res['listProduct'] !== undefined) {
        const obj = res['listProduct'];
        this.listProduct = [];
        this.countProduct = 0;
        for (const prop of Object.keys(obj)) {
          this.listProduct.push(obj[prop]);
          this.countProduct++;
        }
        this.listProduct.reverse();


        // handel add common price
        const priceBookID = this.orderService.getPriceBookID();
        const list = this.listProduct;

        if (priceBookID !== null && Array.isArray(list)) {

          const listProductChoose = list.map(obj => obj.product.id);
          const common_id = priceBookID;
          // // tien hanh xu ly add common vao list
          this.priceListProductSer.getListProductCommon(common_id, listProductChoose).subscribe(resCommon => {
            if (Array.isArray(resCommon)) {
              const priceListProductCommonExist = resCommon;
              // code group array by key
              const group = priceListProductCommonExist.reduce((r, a) => {
                r[a.product_id] = [...r[a.product_id] || [], a];
                return r;
              }, {});
              // add common || null
              // neu co gia chung se chon common_price 
              this.listProduct.forEach(elementData => {
                if (group[elementData.product.id] !== undefined) {
                  elementData.common_price = group[elementData.product.id][0]['price'];
                } else {
                  elementData.common_price = elementData.product.sell_price;
                }
              });
            }
          });
        }
      }

    });


  }

  ngOnInit(): void {
    this.isLoadingResults = false;

    this.orderService.subscribeLoadDetailPage.subscribe(action => {
      if (action === true) {
        this.listProduct = null;
      }
    });

    this.orderService.subscribePriceBookID.subscribe(priceBookID => {
      if (priceBookID !== null) {
        const one = new Promise<string>((resolve, reject) => {
          this.isLoadingResults = true;
          this.loadData();
          resolve();
        }).then(() => {
          this.isLoadingResults = false;
        });
      }
    });

  }

  deleleProduct(itemProduct) {
    const id = itemProduct?.product?.id;
    this.orderService.deleteProduct(id);
  }

  upAmountProduct(product_id) {
    this.orderService.upAmountProduct(product_id);
  }

  downAmountProduct(product_id) {
    this.orderService.downAmountProduct(product_id);
  }

  inputAmountProduct(product_id, value) {
    this.orderService.inputAmountProduct(product_id, value);
  }

  openNoteDetailOrderDialog(id: string, note_detail_sale: string) {
    const obj = {
      id: id,
      note_detail_sale: note_detail_sale
    };
    const dialogRef = this.dialog.open(NoteDetailOrderDialogComponent, {
      data: obj,
      width: '40%',
      minHeight: '80%',
    });

    dialogRef.afterClosed().subscribe(result => {
      // this.loadData();
    });
  }

  openPriceDetailOrderDialog(product: Product, common_price: string) {
    const obj = {
      product: product,
      common_price: common_price
    };
    const dialogRef = this.dialog.open(PriceDetailOrderDialogComponent, {
      data: obj,
      width: '30%',
      minHeight: '80%',
    });

    dialogRef.afterClosed().subscribe(result => {
      // this.loadData();
    });
  }
}
