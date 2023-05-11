import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
import {MatDialog, MatDialogRef} from '@angular/material/dialog';
import {Router} from '@angular/router';
import {NotifierService} from 'angular-notifier';
import {PopupDeleteDialogComponent} from '../../common/popup-delete-dialog/popup-delete-dialog.component';
import {ItemInvoice, ProductInfo} from '../../sale/order.model';
import {OrderService} from '../../sale/order.service';
import {Invoice, InvoiceDetail, InvoiceDetailFilter} from '../invoice.model';
import {InvoiceService} from '../invoice.service';
import {MedicineService} from '../../medicine/medicine.service';
import {PrescriptionService} from '../../sale/prescription.service';
import {Prescription} from '../../sale/prescription.model';
import {OptionStoreService} from '../../common/option-store.service';
import {StoreService} from '../../store/store.service';
import {Store} from '../../store/store.model';

@Component({
  selector: 'app-invoice-tab-info',
  templateUrl: './invoice-tab-info.component.html',
  styleUrls: ['./invoice-tab-info.component.css']
})
export class InvoiceTabInfoComponent implements OnChanges {

  @Input() invoice: Invoice;
  @Input() expandedElement: boolean;
  @Input() store: Store;
  @Output() reload: EventEmitter<any> = new EventEmitter();

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

  tongSoLuong = 0;
  tongTienHang = 0;
  giamGiaHoaDon = 0;
  KhachCanTra: number;
  KhachDaTra = 0;
  giamGiaHoaDonText = '';
  orderStatus = {
    'pending': 'Đang xử lý',
    'done': 'Hoàn thành'
  };

  orderStatusColor = {
    'pending': 'label label-warning',
    'done': 'label label-success'
  };

  autoPrintInSoLo = false;
  allPermission: any;
  isAdminStore: boolean;

  domPrint = '';
  prescription: Prescription;
  logo = null;
  description = null;

  sexItems = {
    '1': 'Nam',
    '0': 'Nữ'
  };

  constructor(
    private dialog: MatDialog,
    public notifySer: NotifierService,
    public invoiceService: InvoiceService,
    public storeSer: StoreService,
    private orderService: OrderService,
    private router: Router,
    private medicineService: MedicineService,
    public prescriptionService: PrescriptionService,
    public optionStoreService: OptionStoreService
  ) {
  }

  ngOnChanges(changes: SimpleChanges): void {
    // console.log(this.expandedElement);
    if (this.expandedElement) {
      // console.log(this.invoice.prescription_id);
      if (this.invoice.prescription_id !== null) {
        this.prescriptionService.getDetail(this.invoice.prescription_id,
          'doctor,medicalFacility').subscribe(res => {
          // console.log(res);
          this.prescription = res;

        });
      }

      const invoiceData = this.invoice;
      const detail = this.invoice.detail;
      this.tongTienHang = invoiceData.total_price;
      this.KhachDaTra = invoiceData.total_payment;
      // tslint:disable-next-line:no-shadowed-variable
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
    this.allPermission = sessionStorage.getItem('allPermission').split(',');
    this.isAdminStore = sessionStorage.getItem('isAdminStore') === 'true';
  }

  // ngOnInit(): void {
  //   // console.log(this.invoice);
  //   const invoiceData = this.invoice;
  //   const detail = this.invoice.detail;
  //   this.tongTienHang = invoiceData.total_price;
  //   this.KhachDaTra = invoiceData.total_payment;
  //   // tslint:disable-next-line:no-shadowed-variable
  //   detail.forEach(element => {
  //     this.tongSoLuong = this.tongSoLuong + element?.amount;
  //   });
  //
  //   if (invoiceData.discount_type === 'price') {
  //     this.giamGiaHoaDon = invoiceData.discount;
  //   } else {
  //     this.giamGiaHoaDon = this.tongTienHang * invoiceData.discount / 100;
  //     this.giamGiaHoaDonText = '(' + invoiceData.discount + '%)';
  //   }
  //
  //   this.allPermission = sessionStorage.getItem('allPermission').split(',');
  //   this.isAdminStore = sessionStorage.getItem('isAdminStore') === 'true';
  // }

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
    const mItemInvoice = new ItemInvoice();
    mItemInvoice.invoice_id = invoice.id;
    mItemInvoice.active = true;
    mItemInvoice.is_return = false;
    mItemInvoice.invoice_name = 'Cập nhật ' + invoice.invoice_no;
    mItemInvoice.price_book_id = invoice.price_book_id;
    mItemInvoice.customer = invoice.customer;
    mItemInvoice.branch_id = invoice.branch_id;
    mItemInvoice.today = invoice.today;
    console.log(mItemInvoice.today);
    mItemInvoice.time = invoice.time;
    mItemInvoice.prescription_id = invoice.prescription_id;
    mItemInvoice.user = {
      id: invoice.user.id,
      email: invoice.user.email,
      username: invoice.user.username
    };
    mItemInvoice.discountSiderBar = {
      number: invoice.discount,
      type: invoice.discount_type
    };
    const aProductInfo: ProductInfo[] = [];
    const invoiceDetailFilter = new InvoiceDetailFilter();
    invoiceDetailFilter.invoice_id = invoice.id;
    invoiceDetailFilter.expand = 'product,quantity,productUnits';
    this.invoiceService.getInvoiceDetailList(invoiceDetailFilter).subscribe(res => {
      const detail = res.body; // invoice.detail || [];
      detail.forEach(element => {
        const units = element.productUnits;
        units.forEach(item => {
          item.quantity_of_stock = Math.floor(element.quantity.number / item.value);
        });
        element.product.productUnits = units;

        const item = units.find(ele => ele.is_base === 1);

        const mProductInfo = new ProductInfo();
        mProductInfo.amount = element.amount;
        mProductInfo.product_id = element.product?.id;
        mProductInfo.product = element.product;
        mProductInfo.product.end_price = element.price;
        mProductInfo.common_price = element.price;
        mProductInfo.product_unit_id = item['id'];
        mProductInfo.product_unit_value = item['value'];
        mProductInfo.base_unit = element.base_unit;
        aProductInfo.push(mProductInfo);
      });
      mItemInvoice.listProduct = aProductInfo;
      this.orderService.addItemInvoiceUpdate(mItemInvoice);
      this.router.navigate(['/sale']);
    });

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
    let _font_size = '11px';
    let _margin = '4px;';
    let _padding = '3px;';
    let _solo = 'text-align:left;';
    this.optionStoreService.getValue('print_type').subscribe(res => {
      // console.log(res);
      if (res.value === 'K58') {
        _font_size = '11px;';
        _margin = '4px;';
        _padding = '3px;';
        _solo = 'text-align:left;';
      } else { // A4
        _font_size = '14px;';
        _margin = '6px;';
        _padding = '6px;';
        _solo = 'text-align:left; min-width: 100px;';
      }

      // this.storeSer.getDetail().subscribe(res => {
      if (this.store !== null && this.store['logo'] !== null && this.store['logo'].length > 0) {
        this.logo = this.store['logo'];
      }
      this.description = this.store.description;

      this.orderService.getDataInvoiceToPrint(invoice_id).subscribe(res => {
        const customer_name = (res?.customer?.name !== null && res?.customer?.name !== undefined) ? res?.customer?.name : 'Khách lẻ';
        const customer_phone = (res?.customer?.phone !== null && res?.customer?.phone !== undefined) ? res?.customer?.phone : '';
        let printContent = '<title>' + res?.invoice_no + '</title>';
        printContent += '<style> ' +
          'p,table,div {' +
          'font-family: Arial, sans-serif;' +
          'font-size: ' + _font_size +
          'margin: ' + _margin +
          '}' +
          'table, th, td {' +
          // 'font-family: arial, sans-serif;' +
          'border-collapse: collapse;' +
          'border: 1px solid black;' +
          'width: 100%;' +
          '}' +
          'td, th {' +
          'border: 1px solid black;' +
          'text-align: left;' +
          'padding: ' + _padding +
          '}</style>' +
          '<section style="padding: 10px; font-size: ' + _font_size + ' ">' +
          (this.logo !== null ? '<p style="text-align:center; margin-bottom: 10px"><img src="' + this.logo + '" style="max-width: 160px;"></p>' : '') +
          '<p style="text-align:center;">' + res?.store?.name + '</p>' +
          '<p style="text-align:center; font-weight:600;">HÓA ĐƠN BÁN HÀNG</p>' +
          '<p style="text-align:center; font-weight:600;">Số HĐ: ' + res?.invoice_no + '</p>' +
          '<p style="text-align:center;"> ' + res?.created_at + ' </p>' +
          '<p style="">Khách hàng: ' + customer_name + '</p>';

        if (customer_phone !== '') {
          printContent += '<p style="">SĐT: ' + customer_phone + '</p>';
        }

        printContent += '<table>' +
          '<tr>' +
          '<th>Tên thuốc</th>' +
          '<th style="text-align:center;">SL</th>';

        if (this.autoPrintInSoLo === true) {
          printContent += '<th style="' + _solo + '">Số lô</th>';
        }

        printContent += '<th style="text-align:center;">T.Tiền</th>' +
          '</tr>';

        const detail = res.detail;

        /**
         * Chi tiet don hang
         */
        // tslint:disable-next-line:no-shadowed-variable
        detail.forEach(element => {
          if (element?.base_unit == null) {
            printContent += '<tr>' +
              '<td>' + element.product?.product_name + '<br>' + element.price + '</td>' +
              '<td style="text-align:center;">' + element.amount + '</td>';
            if (this.autoPrintInSoLo === true) {
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
        if (this.description !== null && this.description.length > 0) {
          printContent += '<p style="text-align:center; font-weight: bold;font-size: 1.1rem" >' + this.description + '</p>';
        } else {
          printContent += '<p style="text-align:center;font-style: italic;" >Cám ơn và hẹn gặp lại.</p>';
        }
        // printContent += '<p style="text-align:left; font-size: 12px;font-style: italic;" >Hổ trợ : 0972 574 506</p>';

        printContent += '</section>';

        const WindowPrt = window.open('', '', 'left=0,top=0,width=900,height=900,toolbar=0,scrollbars=0,status=0');
        WindowPrt.document.write(printContent);
        WindowPrt.document.close();
        WindowPrt.focus();
        WindowPrt.print();
        // WindowPrt.close(); // lỗi tự đôngs
      });
    });
  }

  print() {

  }

  /**
   * Tra hang
   * @param invoice
   */
  returnInvoice(invoice) {
    this.orderService.getReturns(invoice.id).subscribe(resultReturn => {

      // return;
      const mItemInvoice = new ItemInvoice();
      mItemInvoice.invoice_id = invoice.id;
      mItemInvoice.active = true;
      mItemInvoice.is_return = true;
      mItemInvoice.invoice_name = 'Trả hàng ' + invoice.invoice_no;
      mItemInvoice.price_book_id = invoice.price_book_id;
      mItemInvoice.customer = invoice.customer;
      mItemInvoice.branch_id = invoice.branch_id;
      mItemInvoice.today = invoice.today;
      mItemInvoice.time = invoice.time;
      mItemInvoice.user = {
        id: invoice.user.id,
        email: invoice.user.email,
        username: invoice.user.username
      };
      // mItemInvoice.discountSiderBar = {
      //   number: invoice.discount,
      //   type: invoice.discount_type
      // };

      const aProductInfo: ProductInfo[] = [];
      const detail = invoice.detail || [];

      if (resultReturn !== undefined && resultReturn !== null) {
        detail.forEach(element => {

          const units = element?.product?.productUnits;
          const item = units.find(element => element.is_base == 1);
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
          const units = element?.product?.productUnits;
          const item = units.find(element => element.is_base == 1);
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

  checkPermissionDisable(permission) {
    const indexPermission = this.allPermission.indexOf(permission);
    if (indexPermission !== -1) {
      return false;
    }
    return true;
  }

}
