import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { element } from 'protractor';
import { ProductUnit, Quantity } from '../product.model';

@Component({
  selector: 'app-product-tab-stock',
  templateUrl: './product-tab-stock.component.html',
  styleUrls: ['./product-tab-stock.component.css']
})
export class ProductTabStockComponent implements OnInit {

  @Input() units: ProductUnit[];
  @Input() quantity: Quantity;

  displayedColumns: string[] = ['#', 'no', 'name', 'value', 'sell_price', 'quantity_of_stock'];

  columnsHeader = {
    '#': '#',
    'no': 'Mã',
    'name': 'Đơn vị',
    'value': 'Giá trị quy đổi',
    'sell_price': 'Gía bán',
    'quantity_of_stock': 'Tồn kho'
  };


  constructor() {
  }

  ngOnInit(): void {
    const units = this.units;
    let quantity_number = 0;
    if (this.quantity?.number !== undefined) {
      quantity_number = this.quantity?.number;
    }
    // tslint:disable-next-line:no-shadowed-variable
    units.forEach(element => {
      element.quantity_of_stock = Math.floor(quantity_number / element.value);
    });
    this.units = units;
  }


}
