import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-product-tab-stock',
  templateUrl: './product-tab-stock.component.html',
  styleUrls: ['./product-tab-stock.component.css']
})
export class ProductTabStockComponent implements OnInit {

  @Input() units: object[];

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
  }

}
