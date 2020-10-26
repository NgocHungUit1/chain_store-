import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { NotifierService } from 'angular-notifier';
import { Warehouse, WarehouseProduct, WarehouseProductFilter } from '../warehouse.model';
import { WarehouseService } from '../warehouse.service';
import { MatTableDataSource } from '@angular/material/table';
import { WarehouseProductService } from '../warehouse-product.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-warehouse-info-tab',
  templateUrl: './warehouse-info-tab.component.html',
  styleUrls: ['./warehouse-info-tab.component.css']
})
export class WarehouseInfoTabComponent implements OnChanges {

  @Input() model: Warehouse;
  @Input() expandedElement: boolean;
  @Output() reload: EventEmitter<any> = new EventEmitter();

  columnsHeader = {
    '#': '#',
    'product_no': 'Mã hàng',
    'product_name': 'Tên hàng',
    'quantity': 'Số lượng',
    'price': 'Đơn giá',
    'discount': 'Giảm giá',
    'amount': 'Thành tiền',
  };
  displayedColumns = [
    '#',
    'product_no',
    'product_name',
    'quantity',
    'price',
    'discount',
    'amount',
    // 'actions'
  ];

  apiFilter: WarehouseProductFilter;
  isLoadingResults = false;
  data: WarehouseProduct[] = [];
  productDataSource = new MatTableDataSource<WarehouseProduct>([]);

  allPermission: any;
  isAdminStore: boolean;

  constructor(
    private modelSer: WarehouseService,
    private warehouseProductService: WarehouseProductService,
    public notifySer: NotifierService,
    private route: ActivatedRoute,
    private router: Router,
    private dialog: MatDialog
  ) {
  }

  ngOnChanges(changes: SimpleChanges) {
    if (this.expandedElement) {
      this.apiFilter = this.buildFilterFromParams();

      this.loadData();
    }
    this.allPermission = sessionStorage.getItem('allPermission').split(',');
    this.isAdminStore = sessionStorage.getItem('isAdminStore') === 'true';
  }

  loadData(): void {
    this.isLoadingResults = true;
    this.warehouseProductService.getList(this.apiFilter).subscribe(res => {
      this.data = res.body;
      this.productDataSource = new MatTableDataSource<WarehouseProduct>(this.data);
      this.isLoadingResults = false;
    });
  }

  buildFilterFromParams(): WarehouseProductFilter {
    function write<K extends keyof WarehouseProductFilter>(arg: WarehouseProductFilter, key: K, value: WarehouseProductFilter[K]): void {
      arg[key] = value;
    }

    const filter = new WarehouseProductFilter();
    filter.page = this.route.snapshot.queryParams['page'];
    filter.pageSize = 50;//this.route.snapshot.queryParams['pageSize'];
    filter.sort = this.route.snapshot.queryParams['sort'];
    filter.warehouse_id = this.model.id;
    filter.expand = 'product,productUnit,productParcelsForView,discountText';
    return filter;
  }

  configProductPrice(item) {
    console.log(item);
  }

  finish() {
    if (this.model.status === 9) {
      this.modelSer.update(this.model.id, {status: 10}).subscribe(res => {
        const typeStr = res['type'] === 'import' ? 'nhập' : 'trả';
        this.model.status = res['status'];
        this.notifySer.notify('success', 'Hoàn thành đơn ' + typeStr + ' hàng');
      });
    }
  }

  reopen() {
    const routeStr = this.model.type === 'import' ? 'warehouse' : 'warehouse-return';
    this.router.navigate(['/transaction/' + routeStr + '/update/' + this.model.id]);
  }

  delete() {
    // TODO: call confirm dialog
    if (this.checkPermissionDisable('Warehouse.Delete')) {
      this.notifySer.notify('error', 'Bạn không có quyền thực hiện chức năng này.');
      return;
    }
    this.modelSer.delete(this.model.id).subscribe(res => {
      const typeStr = res['type'] === 'import' ? 'nhập' : 'trả';
      this.notifySer.notify('warning', 'Đã xóa đơn ' + typeStr + ' hàng');
      this.reload.emit(null);
    });
  }

  reconnect(item) {
    this.modelSer.reconnect(item.id).subscribe(res => {
      if (res['success']) {
        this.notifySer.notify('success', 'Cập nhật liên thông thành công.');
      } else if (res['message'] !== undefined) {
        this.notifySer.notify('error', res['message']);
      }
    });
  }

  connect(item) {
    this.modelSer.connect(item.id).subscribe(res => {
      if (res['success']) {
        item.national_pharmacy_no = res['national_pharmacy_no'];
        this.notifySer.notify('success', 'Liên thông thành công.');
      } else if (res['message'] !== undefined) {
        this.notifySer.notify('error', res['message']);
      }
    });
  }

  disconnect(item) {
    this.modelSer.disconnect(item.id).subscribe(res => {
      if (res['success']) {
        item.national_pharmacy_no = null;
        this.notifySer.notify('success', 'Gỡ liên thông thành công.');
      } else if (res['message'] !== undefined) {
        this.notifySer.notify('error', res['message']);
      }
    });
  }

  /**
   * In don nhap hang/ tra hang
   * @param model
   */
  buttonPrintWarehouse(model) {
    if (this.model.type === 'import') {
      this.printWarehouse(model.id);
    } else {
      this.notifySer.notify('info', 'Đang phát triển');
    }
  }

  /**
   * Main handel print
   * @param id
   */
  printWarehouse(id: string) {
    this.modelSer.getDataWarehouseToPrint(id).subscribe(res => {
      let printContent = '<title>' + res.no + '</title>';
      printContent += '<style>table {' +
        'border-collapse: collapse;' +
        'width: 100%;' +
        '}' +
        'td, th {' +
        'border: 1px solid #dddddd;' +
        'text-align: left;' +
        'padding: 8px;' +
        '}</style>' +
        '<section style="padding: -5px;">' +
        '<p style="text-align:center;">Địa chỉ : ' + res?.store?.name + '</p>' +
        '<p style="text-align:center; font-weight:600;">HÓA ĐƠN NHẬP HÀNG</p>' +
        '<p style="text-align:center; font-weight:600;">Mã phiếu nhập: ' + res?.no + '</p> ' +
        '<p style="text-align:left;">Ngày nhập: ' + res?.date + ' </p>' +
        '<p style="text-align:left;">Người nhập: ' + res?.created_by + ' </p>' +
        '<table>' +
        '<tr>' +
        '<td style="font-weight: 600;"> Nhà cung cấp </td>' +
        '<td>' + res?.supplier?.name + '</td>' +
        '<td style="font-weight: 600;"> Tổng tiền hàng </td>' +
        '<td style="text-align:right;">' + res?.total_price + '</td>' +
        '</tr>' +
        '<tr>' +
        '<td style="font-weight: 600;">Trạng thái </td>' +
        '<td>' + res?.status + '</td>' +
        '<td style="font-weight: 600;">Giảm giá </td>' +
        '<td style="text-align:right;">' + res?.discount_amount + '</td>' +
        '</tr>' +
        '<tr>' +
        '<td style="font-weight: 600;" >Tính vào công nợ </td>' +
        '<td style="text-align:right;">' + res?.remain_amount + '</td>' +
        '<td style="font-weight: 600;">Tiền trả nhà cung cấp </td>' +
        '<td style="text-align:right;">' + res?.paid_amount + '</td>' +
        '</tr>' +
        '<tr>' +
        '<td style="font-weight: 600;" >Ghi chú</td>' +
        '<td colspan="3">' + res?.note + '</td>' +
        '</tr>' +
        '</table>';

      printContent += '<p style="text-align:left;">Chi tiết nhập hàng :</p>';

      const detail = res.warehoureItems;
      printContent += '<table>';
      printContent += '<tr style="text-align:center; font-size: 13px">';
      printContent += '<th>' + 'Mã hàng' + '</th>';
      printContent += '<th>' + 'Tên hàng' + '</th>';
      printContent += '<th>' + 'Đơn gía' + '</th>';
      printContent += '<th>' + 'Giảm giá' + '</th>';
      printContent += '<th>' + 'Thành tiền' + '</th>';
      printContent += '</tr>';

      detail.forEach(element => {
        printContent += '<tr>';
        printContent += '<td style="text-align:left;">' + element?.product?.product_no + '</td>';
        printContent += '<td style="text-align:left;">' + element?.product?.product_name + '<br>' +
          'Đơn vị : ' + element?.product_unit?.name + '<br>' +
          'Số lượng : ' + element.quantity + '<br>';
        const parcels = element.parcels;
        if (parcels[0] !== undefined) {
          printContent += 'Lô: ' + parcels[0]['parcel_no'] + '-';
          printContent += parcels[0]['expiration_date'] + '-SL:';
          printContent += parcels[0]['quantity'];
        }
        printContent += '</td>';
        printContent += '<td style="text-align:right;">' + element.price + '</td>';
        printContent += '<td style="text-align:right;">' + element.discount + '</td>';
        printContent += '<td style="text-align:right;">' + element.amount + '</td>';
        printContent += '</tr>';
      });
      printContent += '</table>';

      printContent += '<p style="text-align:center;font-style: italic;" >---</p>';
      printContent += '</section>';

      const WindowPrt = window.open('', '', 'left=0,top=0,width=900,height=900,toolbar=0,scrollbars=0,status=0');
      WindowPrt.document.write(printContent);
      WindowPrt.document.close();
      WindowPrt.focus();
      WindowPrt.print();
      WindowPrt.close();
    });
  }

  checkPermissionDisable(permission) {
    const indexPermission = this.allPermission.indexOf(permission);
    if (indexPermission !== -1) {
      return false;
    }
    return  true;
  }

}
