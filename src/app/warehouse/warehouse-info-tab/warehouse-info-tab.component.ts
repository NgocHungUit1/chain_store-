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
    'actions'
  ];

  apiFilter: WarehouseProductFilter;
  isLoadingResults = false;
  data: WarehouseProduct[] = [];
  productDataSource = new MatTableDataSource<WarehouseProduct>([]);

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
    filter.pageSize = this.route.snapshot.queryParams['pageSize'];
    filter.sort = this.route.snapshot.queryParams['sort'];
    filter.warehouse_id = this.model.id;
    filter.expand = 'product';
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
   * In don nhap hang
   * @param model
   */
  buttonPrintWarehouse(model) {
    this.printWarehouse(model.id);
  }

  /**
   * Main handel print
   * @param id
   */
  printWarehouse(id: string) {
    this.modelSer.getDataWarehouseToPrint(id).subscribe(res => {
      let printContent = '<title>' + + '</title>';
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
        '<table>';

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

}
