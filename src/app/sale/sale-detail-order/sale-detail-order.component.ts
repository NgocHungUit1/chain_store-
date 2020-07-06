import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { OrderService } from '../order.service';
import { ActivatedRoute } from '@angular/router';
import { PriceListProductService } from '../../price-book/price-list-product.service';

@Component({
  selector: 'app-sale-detail-order',
  encapsulation: ViewEncapsulation.None,
  templateUrl: './sale-detail-order.component.html',
  styleUrls: ['./sale-detail-order.component.css']
})
export class SaleDetailOrderComponent implements OnInit {

  listProduct: any = [];
  countProduct: number = 0;
  constructor(
    private orderService: OrderService,
    private route: ActivatedRoute,
    private priceListProductSer: PriceListProductService,
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
    this.orderService.subscribePriceBookID.subscribe(priceBookID => {
      if (priceBookID !== null) {
        const one = new Promise<string>((resolve, reject) => {
          this.orderService.setLoadProduct(true);
          this.loadData();
          resolve();
        }).then(() => {
          this.orderService.setLoadProduct(false);
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
}
