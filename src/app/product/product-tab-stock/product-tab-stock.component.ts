import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { element } from 'protractor';
import { ProductUnit } from '../product.model';

@Component({
  selector: 'app-product-tab-stock',
  templateUrl: './product-tab-stock.component.html',
  styleUrls: ['./product-tab-stock.component.css']
})
export class ProductTabStockComponent implements OnInit {

  @Input() units: ProductUnit[];
  @Input() quantity_of_stock: number;

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
    units.forEach(element => {
      element.quantity_of_stock = Math.floor(this.quantity_of_stock / element.value);
    });
    this.units = units;
  }


}
