import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-invoice-tab-payment',
  templateUrl: './invoice-tab-payment.component.html',
  styleUrls: ['./invoice-tab-payment.component.css']
})
export class InvoiceTabPaymentComponent implements OnInit {

  @Input() payment: object[];

  displayedColumns: string[] = ['#', 'payment_no', 'total_price', 'payment_method', 'created_by'];

  columnsHeader = {
    '#': '#',
    'payment_no': 'Mã thanh toán',
    'payment_method': 'Phương thức',
    'total_price': 'Tiền thanh toán',
    'created_by': 'Người tạo',
  };


  typeMethods = {
      'cash': 'Tiền mặt',
      'card': 'Thẻ',
      'transfer': 'Chuyển khoản',
    };
  constructor() { }

  ngOnInit(): void {
    // console.log(this.payment);
  }

}
