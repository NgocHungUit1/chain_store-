import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-invoice-tab-returns',
  templateUrl: './invoice-tab-returns.component.html',
  styleUrls: ['./invoice-tab-returns.component.css']
})
export class InvoiceTabReturnsComponent implements OnInit {

  @Input() returns: object[];

  displayedColumns: string[] = ['#', 'return_no', 'created_at', 'total_price'];

  columnsHeader = {
    '#': '#',
    'return_no': 'Mã trả hàng',
    'created_at': 'Thời gian',
    'total_price': 'Tổng cộng',
  };

  constructor() { }

  ngOnInit(): void {
  }

}
