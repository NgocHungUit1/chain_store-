import { Component, Input, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { NotifierService } from 'angular-notifier';
import { element } from 'protractor';
import { PopupDeleteDialogComponent } from '../../common/popup-delete-dialog/popup-delete-dialog.component';
import { ItemInvoice, ProductInfo } from '../../sale/order.model';
import { OrderService } from '../../sale/order.service';
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

  tongSoLuong: number = 0;
  tongTienHang: number = 0;
  giamGiaHoaDon: number = 0;
  KhachCanTra: number;
  KhachDaTra: number = 0;
  giamGiaHoaDonText = '';
  orderStatus = {
    'pending': 'Đang xử lý',
    'done': 'Hoàn thành'
  };

  constructor(
    private dialog: MatDialog,
    public notifySer: NotifierService,
    public invoiceService: InvoiceService,
    private orderService: OrderService,
    private router: Router
  ) { }

  ngOnInit(): void {
    // console.log(this.invoice);
    const invoiceData = this.invoice;
    const detail = this.invoice.detail;
    this.tongTienHang = invoiceData.total_price;
    this.KhachDaTra = invoiceData.total_payment;
    detail.forEach(element => {
      this.tongSoLuong = this.tongSoLuong + element?.amount;
    });

    if (invoiceData.discount_type === 'vnd') {
      this.giamGiaHoaDon = invoiceData.discount;
    } else {
      this.giamGiaHoaDon = this.tongTienHang * invoiceData.discount / 100;
      this.giamGiaHoaDonText = '(' + invoiceData.discount + '%)';
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

  reconnect(item) {
    this.invoiceService.reconnect(item.id).subscribe(res => {
      if (res['success'] === true) {
        this.notifySer.notify('success', 'Cập nhật liên thông thành công.');
      } else if (res['message'] !== undefined) {
        this.notifySer.notify('error', res['message']);
      }
    });
  }

  connect(item) {
    this.invoiceService.connect(item.id).subscribe(res => {
      if (res['success'] === true) {
        item.national_pharmacy_no = res['national_pharmacy_no'];
        this.notifySer.notify('success', 'Liên thông thành công.');
      } else if (res['message'] !== undefined) {
        this.notifySer.notify('error', res['message']);
      }
    });
  }

  disconnect(item) {
    this.invoiceService.disconnect(item.id).subscribe(res => {
      if (res['success'] === true) {
        item.national_pharmacy_no = null;
        this.notifySer.notify('success', 'Gỡ liên thông thành công.');
      } else if (res['message'] !== undefined) {
        this.notifySer.notify('error', res['message']);
      }
    });
  }

  updateInvoice(invoice) {
    // console.log(invoice);
    let mItemInvoice = new ItemInvoice();
    mItemInvoice.invoice_id = invoice.id;
    mItemInvoice.active = true;
    mItemInvoice.invoice_name = 'Cập nhật ' + invoice.invoice_no;
    mItemInvoice.price_book_id = invoice.price_book_id;
    mItemInvoice.customer = invoice.customer;
    mItemInvoice.user = {
      id: invoice.user.id,
      email: invoice.user.email,
      username: invoice.user.username
    };
    mItemInvoice.discountSiderBar = {
      number: invoice.discount,
      type: invoice.discount_type
    };
    // mItemInvoice.paymentSiderBar = { //@Nghia
    //   number: invoice.discount,
    //   type: invoice.discount_type
    // };
    let aProductInfo: ProductInfo[] = [];
    const detail = invoice.detail || [];
    detail.forEach(element => {
      let mProductInfo = new ProductInfo();
      mProductInfo.amount = element.amount;
      mProductInfo.product_id = element.product?.id;
      mProductInfo.product = element.product;
      aProductInfo.push(mProductInfo);
    });
    mItemInvoice.listProduct = aProductInfo;
    this.orderService.addItemInvoiceUpdate(mItemInvoice);
    this.router.navigate(['/sale']);
  }

}
