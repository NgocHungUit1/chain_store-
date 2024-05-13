import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { Invoice, InvoiceFilter } from '../../invoice/invoice.model';
import { ActivatedRoute } from '@angular/router';
import { MatTable } from '@angular/material/table';
import { InvoiceService } from '../../invoice/invoice.service';
import { ListComponentBase } from '../../shared/base';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';

@Component({
  selector: 'app-customer-tab-invoice',
  templateUrl: './customer-tab-invoice.component.html',
  styleUrls: ['./customer-tab-invoice.component.css'],
})
export class CustomerTabInvoiceComponent extends ListComponentBase implements OnInit {

  constructor(
    private route: ActivatedRoute,
    private invoiceService: InvoiceService,
  ) {
    super();
  }

  @Input() customerId: string;
  @Output() reload: EventEmitter<any> = new EventEmitter();

  @ViewChild(MatTable, { static: true }) table: MatTable<any>;
  @ViewChild('selectColumn') selectColumn;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  displayedColumns: string[] = ['invoice_no', 'total_price', 'discount_price', 'total_payment', 'created_at'];
  columnsHeader = {
    'invoice_no': 'Mã hóa đơn',
    'total_price': 'Trị giá',
    'discount_price': 'Giảm giá',
    'total_payment': 'Đã thanh toán',
    'created_at': 'Thời gian',
  };

  apiFilter: InvoiceFilter;
  isLoadingResults = false;
  isRateLimitReached = false;

  data: Invoice[] = [];

  ngOnInit(): void {
    this.apiFilter = this.buildFilterFromParams();
    this.loadData();
  }

  buildFilterFromParams(): InvoiceFilter {
    function write<K extends keyof InvoiceFilter>(arg: InvoiceFilter, key: K, value: InvoiceFilter[K]): void {
      arg[key] = value;
    }

    const filter = new InvoiceFilter();
    const objectKeys = Object.keys(filter) as Array<keyof InvoiceFilter>;
    for (const attr of objectKeys) {
      write(filter, attr, this.route.snapshot.queryParams['InvoiceSearch[' + attr + ']']);
    }
    filter.expand = 'payment';
    filter.page = this.route.snapshot.queryParams['page'];
    filter.pageSize = this.route.snapshot.queryParams['pageSize'];
    filter.sort = this.route.snapshot.queryParams['sort'];
    filter.customer_id = this.customerId;
    return filter;
  }

  loadData() {
    this.isLoadingResults = true;
    this.invoiceService.getList(this.apiFilter).subscribe(res => {
      const data = res.body;
      data.forEach(invoice => {
        let total_payment = 0;
        let discount_price = 0;
        invoice.payment.forEach(payment => {
          total_payment = total_payment + payment.total_price;
        });
        invoice.total_payment = total_payment;

        if (invoice.discount_type === 'price') {
          discount_price = invoice.discount;
        } else {
          discount_price = invoice.total_price * invoice.discount / 100;
        }
        invoice.discount_price = discount_price;
      });
      this.data = data;
      this.reloadFilter(res);
      this.isLoadingResults = false;
    });
  }
}
