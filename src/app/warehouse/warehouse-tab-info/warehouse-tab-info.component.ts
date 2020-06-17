import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { NotifierService } from 'angular-notifier';
import {Warehouse, WarehouseProduct, WarehouseProductFilter} from '../warehouse.model';
import {WarehouseService} from '../warehouse.service';
import {MatTableDataSource} from '@angular/material/table';
import {WarehouseProductService} from '../warehouse-product.service';
import {ActivatedRoute, Router} from '@angular/router';

@Component({
  selector: 'app-warehouse-tab-info',
  templateUrl: './warehouse-tab-info.component.html',
  styleUrls: ['./warehouse-tab-info.component.css']
})
export class WarehouseTabInfoComponent implements OnChanges {

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
  ) { }

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
    if (this.model.status === 10) {
      this.modelSer.update(this.model.id, {status: 1}).subscribe(res => {
        this.model.status = res['status'];
        this.notifySer.notify('success', 'Hoàn thành đơn nhập hàng');
      });
    }
  }

  reopen() {
    if (this.model.status === 1) {
      this.modelSer.update(this.model.id, {status: 10}).subscribe(res => {
        this.notifySer.notify('success', 'Mở lại đơn nhập hàng');
        this.router.navigate(['/transaction/warehouse/update/' + this.model.id]);
      });
    }
  }

  delete() {
    // TODO: call confirm dialog
    this.modelSer.delete(this.model.id).subscribe(res => {
      this.notifySer.notify('warning', 'Đã xóa đơn nhập hàng');
      this.reload.emit(null);
    });
  }

}
