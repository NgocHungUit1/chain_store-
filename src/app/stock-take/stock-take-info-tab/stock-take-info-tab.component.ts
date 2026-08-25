import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { StockTake, StockTakeItem, StockTakeItemFilter } from '../stock-take.model';
import { WarehouseProduct, WarehouseProductFilter } from '../../warehouse/warehouse.model';
import { MatTableDataSource } from '@angular/material/table';
import { WarehouseService } from '../../warehouse/warehouse.service';
import { WarehouseProductService } from '../../warehouse/warehouse-product.service';
import { NotifierService } from 'angular-notifier';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { StockTakeService } from '../stock-take.service';
import { StockTakeItemService } from '../stock-take-item.service';
import { StockTakeBalanceDialogComponent } from '../stock-take-balance-dialog/stock-take-balance-dialog.component';
import { OptionStoreService } from '../../common/option-store.service';
import { NationalPharmacyV2ConnectDialogComponent } from '../../common/national-pharmacy-v2/national-pharmacy-v2-connect-dialog/national-pharmacy-v2-connect-dialog.component';
import { NationalPharmacyV2Service } from '../../common/national-pharmacy-v2/national-pharmacy-v2.service';

@Component({
  selector: 'app-stock-take-info-tab',
  templateUrl: './stock-take-info-tab.component.html',
  styleUrls: ['./stock-take-info-tab.component.css']
})
export class StockTakeInfoTabComponent implements OnChanges {

  @Input() stockTake: StockTake;
  @Input() expandedElement: boolean;
  @Output() reload: EventEmitter<any> = new EventEmitter();

  columnsHeader = {
    '#': '#',
    'product_no': 'Mã hàng',
    'product_name': 'Tên hàng',
    'quantity_of_stock': 'Tồn kho',
    'actual_number': 'Thực tế',
    'deviation_number': 'Số lệch',
    'deviation_price': 'Giá trị lệch',
  };
  displayedColumns = [
    '#',
    'product_no',
    'product_name',
    'quantity_of_stock',
    'actual_number',
    'deviation_number',
    'deviation_price',
    // 'actions'
  ];

  apiFilter: StockTakeItemFilter;
  isLoadingResults = false;
  data: StockTakeItem[] = [];
  productDataSource = new MatTableDataSource<StockTakeItem>([]);


  constructor(
    private stockTakeSer: StockTakeService,
    private stockTakeItemSer: StockTakeItemService,
    public notifySer: NotifierService,
    private route: ActivatedRoute,
    private router: Router,
    private dialog: MatDialog,
    private optionStoreService: OptionStoreService,
    public npV2Service: NationalPharmacyV2Service,
  ) {
  }

  /** Dialog liên thông đang mở — chặn mở thêm khi người dùng bấm nút nhiều lần */
  npV2DialogOpen = false;

  /**
   * Liên thông phiếu kiểm kho lên CSDL Dược quốc gia v1.1
   * (POST /transactions/stock-taking, mục 5.4.7).
   * Backend chỉ nhận phiếu đã hoàn thành cân bằng kho.
   */
  connectV2(item: StockTake) {
    if (this.npV2DialogOpen) {
      return;
    }
    this.npV2DialogOpen = true;

    const dialogRef = this.dialog.open(NationalPharmacyV2ConnectDialogComponent, {
      width: '520px',
      data: {
        source: 'stock-take',
        id: item.id,
        referenceNumber: item.no,
        transaction: item.nationalPharmacyV2,
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      this.npV2DialogOpen = false;

      if (result && result.event === 'changed') {
        item.nationalPharmacyV2 = result.transaction;
      }
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (this.expandedElement) {
      this.apiFilter = this.buildFilterFromParams();

      this.loadData();
    }
  }

  loadData(): void {

    this.isLoadingResults = true;
    this.stockTakeItemSer.getList(this.apiFilter).subscribe(res => {
      this.data = res.body;
      this.productDataSource = new MatTableDataSource<StockTakeItem>(this.data);
      this.isLoadingResults = false;
    });
  }

  buildFilterFromParams(): StockTakeItemFilter {
    function write<K extends keyof StockTakeItemFilter>(arg: StockTakeItemFilter, key: K, value: StockTakeItemFilter[K]): void {
      arg[key] = value;
    }

    const filter = new StockTakeItemFilter();
    filter.page = this.route.snapshot.queryParams['page'];
    filter.pageSize = 50;//this.route.snapshot.queryParams['pageSize'];
    filter.sort = this.route.snapshot.queryParams['sort'];
    filter.stock_take_id = this.stockTake.id;
    filter.expand = 'product,productUnit,user';
    return filter;
  }

  reOpen() {
    if (this.stockTake.balance_status === 'draft') {
      this.router.navigate(['/store/stock-take/update/' + this.stockTake.id]);
    }
  }


  updateBalanceStatus(balance_status: string) {
    if (balance_status === 'draft') {
      this.stockTakeSer.updateBalanceStatus(this.stockTake.id, balance_status).subscribe(res => {
        this.notifySer.notify('success', 'Lưu thành công.');
      });
      this.stockTake.balance_status = balance_status;
      return;
    }

    if (balance_status === 'cancel') {
      this.stockTakeSer.updateBalanceStatus(this.stockTake.id, balance_status).subscribe(res => {
        this.notifySer.notify('success', 'Hủy bỏ thành công.');
      });
      this.stockTake.balance_status = balance_status;
      return;
    }

    const obj = {
      action: 'Delete',
      title: 'Cân bằng kho',
      content: 'Cân bằng kho sẽ thay đổi tồn kho hiện tại của hàng hóa trong phiếu kiểm kho.<br> Bạn có chắc chắn muốn Cân bằng kho?',
    };

    const dialogRef = this.dialog.open(StockTakeBalanceDialogComponent, {
      data: obj,
      width: '40%',
      minHeight: '80%',
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result.event === 'accept') {
        this.stockTakeSer.updateBalanceStatus(this.stockTake.id, balance_status).subscribe(res => {
          this.notifySer.notify('success', 'Lưu thành công.');
        });
        this.stockTake.balance_status = balance_status;
      }
    });
  }

  actionPrintStockTake(stockTake: StockTake) {
    // console.log(stockTake);
    this.printStockTake(stockTake.id);
    // this.notifySer.notify('info', 'Đang phát triển');
  }

  printStockTake(id: string) {

    let _font_size = '11px';
    let _padding = '3px;';
    this.optionStoreService.getValue('print_type').subscribe(res => {
      if (res.value === 'K58') {
        _font_size = '11px;';
        _padding = '3px;';
      } else { // A4
        _font_size = '13px;';
        _padding = '6px;';
      }
    });

    this.stockTakeSer.getDataStockTakeToPrint(id).subscribe(res => {
      // console.log(res);
      // const address = (res?.customer?.address !== null && res?.customer?.address !== undefined) ? res?.customer?.address : '';
      // const customer_name = (res?.customer?.name !== null && res?.customer?.name !== undefined) ? res?.customer?.name : 'Khách lẻ';
      // const customer_phone = (res?.customer?.phone !== null && res?.customer?.phone !== undefined) ? res?.customer?.phone : '';
      let printContent = '<title>' + res?.no + '</title>';
      let username = (res?.balance_by?.username) ? res?.balance_by?.username : '';
      printContent += '<style> ' +
        'p,table,div {' +
        'font-family: arial, sans-serif;' +
        'font-size: ' + _font_size +
        '}' +
        'table {' +
        // 'font-family: arial, sans-serif;' +
        'border-collapse: collapse;' +
        'width: 100%;' +
        '}' +
        'td, th {' +
        'border: 1px solid #dddddd;' +
        'text-align: left;' +
        'padding: ' + _padding +
        '}</style>' +
        '<section style="padding: 10px;">' +
        '<p style="text-align:center; font-weight:600;">PHIẾU KIỂM KHO</p>' +
        '<p style="text-align:center; font-weight:600;">Mã phiếu : ' + res?.no + '</p><br>' +

        '<table style="" >' +
        '<tr>' +
        '<td style="font-weight: 600;">Chi nhánh </td>' +
        '<td>' + res.branch + '</td>' +
        '<td style="font-weight: 600;">Trạng thái </td>' +
        '<td style="text-align:left;">' + res.balance_status + '</td>' +
        '</tr>' +
        '<tr>' +
        '<td style="font-weight: 600;">Người tạo </td>' +
        '<td>' + res?.created_by?.username + '</td>' +
        '<td style="font-weight: 600;">Ngày tạo </td>' +
        '<td style="text-align:right;">' + res.created_at + '</td>' +
        '</tr>' +
        '<tr>' +
        '<td style="font-weight: 600;" >Người cân bằng </td>' +
        '<td >' + username + '</td>' +
        '<td style="font-weight: 600;">Ngày cân bằng </td>' +
        '<td style="text-align:right;">' + res.balance_at + '</td>' +
        '</tr>' +
        '</table><br>';

      printContent += '<table>' +
        '<tr>' +
        '<th>STT</th>' +
        '<th>Mã hàng</th>' +
        '<th>Tên hàng</th>' +
        '<th style="text-align:center;">Tồn kho</th>' +
        '<th style="text-align:center;">Kiểm thực tế</th>' +
        '<th style="text-align:center;">SL lệch</th>' +
        '<th style="text-align:center;">Giá trị lệch</th>' +
        '</tr>';

      const detail = res.detail;

      /**
       * Chi tiet don hang
       */
      let stt = 0;
      detail.forEach(element => {
        stt++;
        printContent += '<tr>' +
          '<td style="text-align:center;">' + stt + '</td>' +
          '<td style="text-align:left;">' + element.product_no + '</td>' +
          '<td style="text-align:left;">' + element.product_name + '</td>' +
          '<td style="text-align:center;">' + element.quantity_of_stock + '</td>' +
          '<td style="text-align:center;">' + element.actual_number + '</td>' +
          '<td style="text-align:center;">' + element.deviation_number + '</td>' +
          '<td style="text-align:center;">' + element.deviation_price + '</td>';

        printContent += '</tr>';

      });
      printContent += '</table>';

      printContent += '<p style="text-align:left;font-style: italic;" >Ghi chú: ' + res.note + '</p>';

      /**
       * Tong tien hang
       */
      let colspan = 6;
      printContent += '<table>';

      printContent += '<tr>' +
        '<td style="text-align:right; font-weight:600;" colspan="' + colspan + '">Tổng thực tế :</td>' +
        '<td style="text-align:right; font-weight:600;">' + res.totalPrice + '</td>' +
        '</tr>';
      printContent += '<tr>' +
        '<td style="text-align:right; font-weight:600;" colspan="' + colspan + '">Tổng giá trị lệch :</td>' +
        '<td style="text-align:right; font-weight:600;">' + res.deviationPriceSum + '</td>' +
        '</tr>';
      // printContent += '<tr>' +
      //   '<td style="text-align:right; font-weight:600;" colspan="' + colspan + '">Tổng thanh toán :</td>' +
      //   '<td style="text-align:right; font-weight:600;">' + res.sum_payment + '</td>' +
      //   '</tr>';
      printContent += '</table>';
      printContent += '</section>';

      const WindowPrt = window.open('', '', 'left=0,top=0,width=900,height=900,toolbar=0,scrollbars=0,status=0');
      WindowPrt.document.write(printContent);
      WindowPrt.document.close();
      WindowPrt.focus();
      WindowPrt.print();
      // WindowPrt.close();
    });

  }

}
