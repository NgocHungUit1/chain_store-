import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { StockTakeItem, StockTakeItemFilter } from '../../stock-take/stock-take.model';
import { NotifierService } from 'angular-notifier';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-invoice-tab-payment',
  templateUrl: './invoice-tab-payment.component.html',
  styleUrls: ['./invoice-tab-payment.component.css']
})
export class InvoiceTabPaymentComponent implements OnInit {

  @Input() payment: object[];
  @Input() invoice_id: number;
  @Input() expandedElement: boolean;

  displayedColumns: string[] = ['#', 'payment_no', 'total_price', 'payment_method', 'created_by', 'created_at'];

  columnsHeader = {
    '#': '#',
    'payment_no': 'Mã thanh toán',
    'payment_method': 'Phương thức',
    'total_price': 'Tiền thanh toán',
    'created_by': 'Người tạo',
    'created_at': 'Thời gian',
  };


  typeMethods = {
    'cash': 'Tiền mặt',
    'card': 'Thẻ',
    'transfer': 'Chuyển khoản',
  };

  constructor(
    public notifySer: NotifierService,
    private route: ActivatedRoute,
  ) {
  }

  apiFilter: StockTakeItemFilter;
  isLoadingResults = false;
  data: StockTakeItem[] = [];
  productDataSource = new MatTableDataSource<StockTakeItem>([]);

  // ngOnChanges(changes: SimpleChanges) {
  //   if (this.expandedElement) {
  //     this.apiFilter = this.buildFilterFromParams();
  //
  //     this.loadData();
  //     console.log(this.invoice_id);
  //   }
  // }

  // loadData(): void {
  //
  //   this.isLoadingResults = true;
  //   this.stockTakeItemSer.getList(this.apiFilter).subscribe(res => {
  //     this.data = res.body;
  //     this.productDataSource = new MatTableDataSource<StockTakeItem>(this.data);
  //     this.isLoadingResults = false;
  //   });
  // }
  //
  // buildFilterFromParams(): StockTakeItemFilter {
  //   function write<K extends keyof StockTakeItemFilter>(arg: StockTakeItemFilter, key: K, value: StockTakeItemFilter[K]): void {
  //     arg[key] = value;
  //   }
  //
  //   const filter = new StockTakeItemFilter();
  //   filter.page = this.route.snapshot.queryParams['page'];
  //   filter.pageSize = 50;//this.route.snapshot.queryParams['pageSize'];
  //   filter.sort = this.route.snapshot.queryParams['sort'];
  //   filter.stock_take_id = this.stockTake.id;
  //   filter.expand = 'product,productUnit,user';
  //   return filter;
  // }
  ngOnInit() {

  }

}
