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
import { SaleMainComponent } from '../../sale/sale-main/sale-main.component';
import { MedicineService } from '../../medicine/medicine.service';

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

  autoPrintInSoLo: boolean = false;

  constructor(
    private dialog: MatDialog,
    public notifySer: NotifierService,
    public invoiceService: InvoiceService,
    private orderService: OrderService,
    private router: Router,
    private medicineService: MedicineService,
  ) {
  }

  ngOnInit(): void {
    // console.log(this.invoice);
    const invoiceData = this.invoice;
    const detail = this.invoice.detail;
    this.tongTienHang = invoiceData.total_price;
    this.KhachDaTra = invoiceData.total_payment;
    detail.forEach(element => {
      this.tongSoLuong = this.tongSoLuong + element?.amount;
    });

    if (invoiceData.discount_type === 'price') {
      this.giamGiaHoaDon = invoiceData.discount;
    } else {
      this.giamGiaHoaDon = this.tongTienHang * invoiceData.discount / 100;
      this.giamGiaHoaDonText = '(' + invoiceData.discount + '%)';
    }
  }

  deleteInvoice(invoice) {
    if (invoice['returns'].length > 0) {
      this.notifySer.notify('warning', 'Hóa đơn đã có trả hàng, không thể hủy đơn !');
      return;
    }

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
          // console.log(res);
          if (res === true) {
            this.notifySer.notify('success', 'Xóa hóa đơn thành công!');
            this.invoiceService.setLoadInvoice(true);
          }
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
    if (invoice['returns'].length > 0) {
      this.notifySer.notify('warning', 'Hóa đơn đã có trả hàng, không thể mở phiếu để cập nhật !');
      return;
    }
    let mItemInvoice = new ItemInvoice();
    mItemInvoice.invoice_id = invoice.id;
    mItemInvoice.active = true;
    mItemInvoice.is_return = false;
    mItemInvoice.invoice_name = 'Cập nhật ' + invoice.invoice_no;
    mItemInvoice.price_book_id = invoice.price_book_id;
    mItemInvoice.customer = invoice.customer;
    mItemInvoice.branch_id = invoice.branch_id;
    mItemInvoice.user = {
      id: invoice.user.id,
      email: invoice.user.email,
      username: invoice.user.username
    };
    mItemInvoice.discountSiderBar = {
      number: invoice.discount,
      type: invoice.discount_type
    };

    let aProductInfo: ProductInfo[] = [];
    const detail = invoice.detail || [];

    detail.forEach(element => {
      let units = element?.product?.productUnits;
      let item = units.find(element => element.is_base == 1);

      const mProductInfo = new ProductInfo();
      mProductInfo.amount = element.amount;
      mProductInfo.product_id = element.product?.id;
      mProductInfo.product = element.product;
      mProductInfo.product.end_price = element.price;
      mProductInfo.common_price = element.price;
      // mProductInfo.product_unit_id = element.product_unit_id;
      // mProductInfo.product_unit_value = element.product_unit_value;
      mProductInfo.product_unit_id = item['id'];
      mProductInfo.product_unit_value = item['value'];
      mProductInfo.base_unit = element.base_unit;
      aProductInfo.push(mProductInfo);
    });
    mItemInvoice.listProduct = aProductInfo;
    this.orderService.addItemInvoiceUpdate(mItemInvoice);
    // debugger;
    this.router.navigate(['/sale']);
  }

  /**
   * In so lo
   * @param e
   */
  onChangeSlideToggleInSoLo(e: any) {
    this.autoPrintInSoLo = e.checked;
  }

  actionPrintInvoice(invoice) {
    this.printInvoice(invoice.id);
  }

  /**
   * Print Invoice
   */
  printInvoice(invoice_id: number) {
    this.orderService.getDataInvoiceToPrint(invoice_id).subscribe(res => {
      const address = (res?.customer?.address !== null && res?.customer?.address !== undefined) ? res?.customer?.address : '';
      const customer_name = (res?.customer?.name !== null && res?.customer?.name !== undefined) ? res?.customer?.name : 'Khách lẻ';
      const customer_phone = (res?.customer?.phone !== null && res?.customer?.phone !== undefined) ? res?.customer?.phone : '';
      let printContent = '<title>' + res?.invoice_no + '</title>';
      printContent += '<style>table {' +
        // 'font-family: arial, sans-serif;' +
        'border-collapse: collapse;' +
        'width: 100%;' +
        '}' +
        'td, th {' +
        'border: 1px solid #dddddd;' +
        'text-align: left;' +
        'padding: 8px;' +
        '}</style>' +
        '<section style="padding: 10px;">' +
        '<p style="text-align:center;">Địa chỉ : ' + res?.store?.name + '</p>' +
        '<p style="text-align:center; font-weight:600;">HÓA ĐƠN BÁN HÀNG</p>' +
        '<p style="text-align:center; font-weight:600;">Số HĐ: ' + res?.invoice_no + '</p>' +
        '<p style="text-align:center;"> ' + res?.created_at + ' </p>' +
        '<p style="">Khách hàng: ' + customer_name + '</p>' +
        '<p style="">SĐT: ' + customer_phone + '</p>' +
        '<p style="">Địa chỉ: ' + address + '</p>' +
        '<table>' +
        '<tr>' +
        '<th>Đơn giá</th>' +
        '<th style="text-align:center;">Số lượng</th>';

      if (this.autoPrintInSoLo == true) {
        printContent += '<th style="text-align:left;">Số lô</th>';
      }

      printContent += '<th style="text-align:center;">Thành tiền</th>' +
        '</tr>';

      const detail = res.detail;

      /**
       * Chi tiet don hang
       */
      detail.forEach(element => {
        if (element?.base_unit == null) {
          printContent += '<tr>' +
            '<td>' + element.product?.product_name + '<br>' + element.price + '</td>' +
            '<td style="text-align:center;">' + element.amount + '</td>';
          if (this.autoPrintInSoLo == true) {
            printContent += '<td style="text-align:left;">' + element.so_lo + '</td>';
          }
          printContent += '<td style="text-align:right;">' + element.total + '</td>' +
            '</tr>';
        } else {
          printContent += '<tr>' +
            '<td>' + element.product?.product_name + ' - ' + element?.base_unit + '<br>' + element.price + '</td>' +
            '<td style="text-align:center;">' + element.amount + '</td>';
          if (this.autoPrintInSoLo === true) {
            printContent += '<td style="text-align:left;">' + element.so_lo + '</td>';
          }
          printContent += '<td style="text-align:right;">' + element.total + '</td>' +
            '</tr>';
        }
      });

      /**
       * Tong tien hang
       */
      let colspan = 2;
      if (this.autoPrintInSoLo === true) {
        colspan = 3;
      }
      printContent += '<tr>' +
        '<td style="text-align:right; font-weight:600;" colspan="' + colspan + '">Tổng tiền hàng :</td>' +
        '<td style="text-align:right; font-weight:600;">' + res.total_price + '</td>' +
        '</tr>';
      printContent += '<tr>' +
        '<td style="text-align:right; font-weight:600;" colspan="' + colspan + '">Chiết khấu :</td>' +
        '<td style="text-align:right; font-weight:600;">' + res.discount + '</td>' +
        '</tr>';
      printContent += '<tr>' +
        '<td style="text-align:right; font-weight:600;" colspan="' + colspan + '">Tổng thanh toán :</td>' +
        '<td style="text-align:right; font-weight:600;">' + res.sum_payment + '</td>' +
        '</tr>';
      if (res.debt !== null) {
        printContent += '<tr>' +
          '<td style="text-align:right; font-weight:600;" colspan="' + colspan + '">Còn nợ :</td>' +
          '<td style="text-align:right; font-weight:600;">' + res.debt + '</td>' +
          '</tr>';
      }
      printContent += '</table>';
      printContent += '<p style="text-align:center;font-style: italic;" >Cám ơn và hẹn gặp lại.</p>';
      printContent += '</section>';

      const WindowPrt = window.open('', '', 'left=0,top=0,width=900,height=900,toolbar=0,scrollbars=0,status=0');
      WindowPrt.document.write(printContent);
      WindowPrt.document.close();
      WindowPrt.focus();
      WindowPrt.print();
      WindowPrt.close();
    });

  }

  /**
   * Tra hang
   * @param invoice
   */
  returnInvoice(invoice) {
    this.orderService.getReturns(invoice.id).subscribe(resultReturn => {

      // return;
      let mItemInvoice = new ItemInvoice();
      mItemInvoice.invoice_id = invoice.id;
      mItemInvoice.active = true;
      mItemInvoice.is_return = true;
      mItemInvoice.invoice_name = 'Trả hàng ' + invoice.invoice_no;
      mItemInvoice.price_book_id = invoice.price_book_id;
      mItemInvoice.customer = invoice.customer;
      mItemInvoice.branch_id = invoice.branch_id;
      mItemInvoice.user = {
        id: invoice.user.id,
        email: invoice.user.email,
        username: invoice.user.username
      };
      mItemInvoice.discountSiderBar = {
        number: invoice.discount,
        type: invoice.discount_type
      };

      let aProductInfo: ProductInfo[] = [];
      const detail = invoice.detail || [];

      if (resultReturn !== undefined && resultReturn !== null) {
        detail.forEach(element => {

          let units = element?.product?.productUnits;
          let item = units.find(element => element.is_base == 1);
          const mProductInfo = new ProductInfo();
          if (resultReturn[item['id']] !== undefined) {
            mProductInfo.amount = 0;
            mProductInfo.product_id = element.product?.id;
            mProductInfo.product = element.product;
            mProductInfo.product.end_price = element.price;
            mProductInfo.common_price = element.price;
            mProductInfo.product_unit_id = item['id'];
            mProductInfo.product_unit_value = item['value'];
            mProductInfo.base_unit = element.base_unit;
            mProductInfo.is_return = true;
            mProductInfo.max_amount_return = element.amount - resultReturn[item['id']];
          } else {
            mProductInfo.amount = 0;
            mProductInfo.product_id = element.product?.id;
            mProductInfo.product = element.product;
            mProductInfo.product.end_price = element.price;
            mProductInfo.common_price = element.price;
            mProductInfo.product_unit_id = item['id'];
            mProductInfo.product_unit_value = item['value'];
            mProductInfo.base_unit = element.base_unit;
            mProductInfo.is_return = true;
            mProductInfo.max_amount_return = element.amount;
          }

          if (mProductInfo.max_amount_return > 0) {
            aProductInfo.push(mProductInfo);
          }
        });
      } else {
        detail.forEach(element => {
          let units = element?.product?.productUnits;
          let item = units.find(element => element.is_base == 1);
          const mProductInfo = new ProductInfo();
          mProductInfo.amount = 0;
          mProductInfo.product_id = element.product?.id;
          mProductInfo.product = element.product;
          mProductInfo.product.end_price = element.price;
          mProductInfo.common_price = element.price;
          mProductInfo.product_unit_id = item['id'];
          mProductInfo.product_unit_value = item['value'];
          mProductInfo.base_unit = element.base_unit;
          mProductInfo.is_return = true;
          mProductInfo.max_amount_return = element.amount;
          aProductInfo.push(mProductInfo);
        });
      }

      if (aProductInfo.length !== 0) {
        mItemInvoice.listProduct = aProductInfo;
        this.orderService.addItemInvoiceUpdate(mItemInvoice);
        // debugger;
        this.router.navigate(['/sale']);

      } else {
        this.notifySer.notify('warning', 'Đã trả hết hàng.');

      }

    }); // getReturns list

  }

  /**
   * Thanh toan no
   * @param invoice
   */
  payTheDebt(invoice) {
    this.invoiceService.payTheDebt(invoice.id).subscribe(res => {
      if (res === true) {
        this.notifySer.notify('success', 'Thanh toán nợ thành công.');
      } else {
        this.notifySer.notify('error', 'Thanh toán không thành công.');
      }
    });
  }

  /**
   * Lien thong san pham
   * @param item
   */
  connectItem(item) {
    this.medicineService.connect(item.id).subscribe(res => {
      if (res['success']) {
        item.medicine_no = res['medicine_no'];
        this.notifySer.notify('success', 'Liên thông thành công.');
      }
    });
  }

}
