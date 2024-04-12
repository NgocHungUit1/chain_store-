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

  displayedColumns: string[] = ['invoice_no', 'total_price', 'created_at'];
  columnsHeader = {
    'invoice_no': 'Mã hóa đơn',
    'total_price': 'Trị giá',
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

    filter.page = this.route.snapshot.queryParams['page'];
    filter.pageSize = this.route.snapshot.queryParams['pageSize'];
    filter.sort = this.route.snapshot.queryParams['sort'];
    filter.customer_id = this.customerId;
    return filter;
  }

  loadData() {
    this.isLoadingResults = true;
    this.invoiceService.getList(this.apiFilter).subscribe(res => {
      this.data = res.body;
      this.isLoadingResults = false;
      this.reloadFilter(res);
    });
  }
}
