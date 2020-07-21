import { Component, Input, OnInit } from '@angular/core';
import { Invoice } from '../invoice.model';

@Component({
  selector: 'app-invoice-tab-info',
  templateUrl: './invoice-tab-info.component.html',
  styleUrls: ['./invoice-tab-info.component.css']
})
export class InvoiceTabInfoComponent implements OnInit {

  @Input() invoice: Invoice;

  displayedColumns: string[] = ['product_no', 'product_name', 'amount', 'common_price', 'discount', 'price', 'total_price'];

  columnsHeader = {
    'product_no': 'Mã hàng',
    'product_name': 'Tên hàng',
    'amount': 'Số lượng',
    'common_price': 'Đơn giá',
    'discount': 'Giảm giá',
    'price': 'Giá bán',
    'total_price': 'Thành tiền'
  };

  TongSoLuong: number = 0;
  TongTienHang: number = 0;
  GiamGiaHoaDon: number = 0;
  KhachCanTra: number;
  KhachDaTra: number = 0;
  constructor() { }

  ngOnInit(): void {
    // console.log(this.invoice);
    const invoiceData = this.invoice;
    const detail = this.invoice.detail;
    this.TongTienHang = invoiceData.total_price;
    this.KhachDaTra = invoiceData.total_payment;
    detail.forEach(element => {
      this.TongSoLuong = this.TongSoLuong + element?.amount;
    });

    if (invoiceData.discount_type === 'vnd') {
      this.GiamGiaHoaDon = invoiceData.discount;
    } else {
      this.GiamGiaHoaDon = this.TongTienHang * invoiceData.discount / 100;
    }
  }

}
