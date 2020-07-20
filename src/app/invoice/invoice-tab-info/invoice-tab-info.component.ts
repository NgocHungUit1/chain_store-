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

  TongSoLuong: number;
  TongTienHang: number;
  GiamGiaHoaDon: number;
  KhachCanTra: number;
  KhachDaTra: number;
  constructor() { }

  ngOnInit(): void {
    // console.log(this.invoice);
    const detail = this.invoice.detail;
    detail.forEach(element => {
      console.log(element);
    });
    // @NGHIA
  }

}
