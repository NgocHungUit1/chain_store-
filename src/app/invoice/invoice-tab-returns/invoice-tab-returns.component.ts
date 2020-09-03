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
    this.returns.forEach(elementData => {
      const date = new Date(1000 * elementData['created_at']).toJSON().slice(0, 16);
        elementData['created_at'] = date.slice(8, 10) + '/'
          + date.slice(5, 7) + '/'
          + date.slice(0, 4) + ' '
          + date.slice(11, 16);
    });
    
  }

}
