import { Component, Input, OnInit } from '@angular/core';
import { Invoice } from '../invoice.model';

@Component({
  selector: 'app-invoice-tab-info',
  templateUrl: './invoice-tab-info.component.html',
  styleUrls: ['./invoice-tab-info.component.css']
})
export class InvoiceTabInfoComponent implements OnInit {

  @Input() invoice: Invoice;

  displayedColumns: string[] = ['#', 'product_id'];

  columnsHeader = {
    '#': '#',
    'product_id': 'Sản phẩm',
  };

  constructor() { }

  ngOnInit(): void {
  }

}
