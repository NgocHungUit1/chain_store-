import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { element } from 'protractor';
import { Product, ProductUnit, Quantity } from '../product.model';
import { ProductService } from '../product.service';

@Component({
  selector: 'app-product-tab-stock',
  templateUrl: './product-tab-stock.component.html',
  styleUrls: ['./product-tab-stock.component.css']
})
export class ProductTabStockComponent implements OnChanges {

  @Input() product_id: string;
  @Input() expandedElement: boolean;
  @Output() reload: EventEmitter<any> = new EventEmitter();
  quantity: Quantity;
  units: any;
  displayedColumns: string[] = ['#', 'no', 'name', 'value', 'sell_price', 'quantity_of_stock'];

  columnsHeader = {
    '#': '#',
    'no': 'Mã',
    'name': 'Đơn vị',
    'value': 'Giá trị quy đổi',
    'sell_price': 'Gía bán',
    'quantity_of_stock': 'Tồn kho'
  };

  constructor(
    private productService: ProductService,
  ) {
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.expandedElement) {
      let units = [];
      this.productService.getDetail(this.product_id, 'medicine,productUnits,quantity').subscribe(res => {
        // @ts-ignore
        units = res?.productUnits;
        // @ts-ignore
        this.quantity = res?.quantity;

        let quantity_number = 0;
        if (this.quantity?.number !== undefined) {
          quantity_number = this.quantity?.number;
        }
        // tslint:disable-next-line:no-shadowed-variable
        units.forEach(element => {
          element.quantity_of_stock = Math.floor(quantity_number / element.value);
        });
        this.units = units;
      });
    }


  }


}
