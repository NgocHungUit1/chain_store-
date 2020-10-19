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

}
