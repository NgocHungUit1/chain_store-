import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-invoice-tab-payment',
  templateUrl: './invoice-tab-payment.component.html',
  styleUrls: ['./invoice-tab-payment.component.css']
})
export class InvoiceTabPaymentComponent implements OnInit {

  @Input() payment: object[];

  displayedColumns: string[] = ['#', 'payment_no', 'payment_method', 'total_price', 'created_by'];

  columnsHeader = {
    '#': '#',
    'payment_no': 'Mã thanh toán',
    'payment_method': 'Phương thức',
    'total_price': 'Tiền thanh toán',
    'created_by': 'Người tạo',
  };

  constructor() { }

  ngOnInit(): void {
    // console.log(this.payment);
  }

}
