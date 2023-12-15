import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { StockTakeItem, StockTakeItemFilter } from '../../stock-take/stock-take.model';
import { NotifierService } from 'angular-notifier';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import {PaymentFilter} from '../../payment/payment.model';
import {Invoice} from '../invoice.model';
import {PaymentService} from '../../payment/payment.service';

@Component({
  selector: 'app-invoice-tab-payment',
  templateUrl: './invoice-tab-payment.component.html',
  styleUrls: ['./invoice-tab-payment.component.css']
})
export class InvoiceTabPaymentComponent implements OnInit {
  @Input() invoice: Invoice;
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
    private paymentSer: PaymentService,
  ) {
  }

  dataSource = [];

  @Input() sub_page = false;
  @Input() page_size = 20;
  apiFilter: PaymentFilter = new PaymentFilter();

  loading = false;

  buildFilterFromParams(): PaymentFilter {
    function write<K extends keyof PaymentFilter>(arg: PaymentFilter, key: K, value: PaymentFilter[K]): void {
      arg[key] = value;
    }
    const filter = new PaymentFilter();
    const objectKeys = Object.keys(filter) as Array<keyof PaymentFilter>;

    for (const attr of objectKeys) {
      if (this.route.snapshot.queryParams['PaymentSearch[' + attr + ']'] !== undefined) {
        write(filter, attr, this.route.snapshot.queryParams['PaymentSearch[' + attr + ']']);
      }
    }
    if (this.route.snapshot.queryParams['pageSize'] !== undefined) {
      filter.pageSize = this.route.snapshot.queryParams['pageSize'];
    } else {
      filter.pageSize = this.page_size;
    }
    filter.page = this.route.snapshot.queryParams['page'];
    filter.sort = this.route.snapshot.queryParams['sort'];
    filter.expand = 'createdUser';
    filter.invoice_id = this.invoice.id;
    return filter;
  }

  loadData(): void {
    this.loading = true;
    this.paymentSer.getList(this.apiFilter).subscribe(res => {
      this.dataSource = res.body;
      this.loading = false;
    });
  }

  ngOnInit() {
    this.apiFilter = this.buildFilterFromParams();
    this.loadData();
  }


}
