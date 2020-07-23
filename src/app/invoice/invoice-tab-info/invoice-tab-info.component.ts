import { Component, Input, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { NotifierService } from 'angular-notifier';
import { PopupDeleteDialogComponent } from '../../common/popup-delete-dialog/popup-delete-dialog.component';
import { Invoice } from '../invoice.model';
import { InvoiceService } from '../invoice.service';

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
  GiamGiaHoaDonText = '';
  orderStatus = {
    'pending': 'Đang xử lý',
    'done': 'Hoàn thành'
  };

  constructor(
    private dialog: MatDialog,
    public notifySer: NotifierService,
    public invoiceService: InvoiceService,
  ) { }

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
      this.GiamGiaHoaDonText = '(' + invoiceData.discount + '%)';
    }
  }

  deleteInvoice(invoice) {
    const obj = {
      action: 'Delete',
      title: 'Xóa hàng hóa',
      content: 'Bạn có chắc chắn muốn hủy hóa đơn ' + invoice.invoice_no + ' này không?',
    };

    const dialogRef = this.dialog.open(PopupDeleteDialogComponent, {
      data: obj,
      width: '30%',
      minHeight: '80%',
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result.event === 'delete') {
        this.invoiceService.delete(invoice.id).subscribe(res => {
          this.notifySer.notify('success', 'Xóa hóa đơn thành công!');
        });
      }
    });
  }

}
