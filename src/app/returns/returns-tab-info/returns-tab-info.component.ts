import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-returns-tab-info',
  templateUrl: './returns-tab-info.component.html',
  styleUrls: ['./returns-tab-info.component.css']
})
export class ReturnsTabInfoComponent implements OnInit {

  @Input() detail: object[];


  displayedColumns: string[] = ['#', 'product_no', 'product_name', 'base_unit', 'amount', 'price', 'total_price'];

  columnsHeader = {
    '#': '#',
    'product_no': 'Mã sản phẩm',
    'product_name': 'Tên sản phẩm',
    'base_unit': 'Đơn vị',
    'amount': 'Số lượng',
    'price': 'Giá bán',
    'total_price': 'Thành tiền'
  };
  constructor() { }

  ngOnInit(): void {
    console.log(this.detail);

  }

}
