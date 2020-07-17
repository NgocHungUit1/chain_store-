import { Component, OnInit, ViewChild } from '@angular/core';
import { ListComponentBase } from '../../shared/base';
import { MatDialog } from "@angular/material/dialog";
import { NotifierService } from "angular-notifier";
import { animate, state, style, transition, trigger } from "@angular/animations";
import { ActivatedRoute } from '@angular/router';
import { MatTable } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { InvoiceFilter, Invoice } from '../invoice.model';
import { InvoiceService } from '../invoice.service';

@Component({
  selector: 'app-invoice-list',
  templateUrl: './invoice-list.component.html',
  styleUrls: ['./invoice-list.component.css'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ]
})
export class InvoiceListComponent extends ListComponentBase implements OnInit {

  constructor(
    private service: InvoiceService,
    private route: ActivatedRoute,
    private dialog: MatDialog,
    private notifySer: NotifierService
  ) {
    super();
  }

  @ViewChild(MatTable, { static: true }) table: MatTable<any>;
  @ViewChild('selectColumn') selectColumn;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  isLoadingResults = true;
  isRateLimitReached = false;

  apiFilter: InvoiceFilter;
  expandedElement: Invoice | null;

  columnsHeader = {
    '#': '#',
    'order_no': 'Mã đơn hàng',
    'created_at': 'Thời gian',
    'customer': 'Khách hàng',
    'sum_price_product': 'Tổng tiền hàng',
    'discount': 'Giảm giá',
    'customer_pay': 'Khách đã trả',
  };

  displayedColumns: string[] = ['#', 'order_no', 'created_at', 'customer', 'sum_price_product', 'discount', 'customer_pay'];
  columnsToDisplay: string[] = ['#', 'order_no', 'created_at', 'customer', 'sum_price_product', 'discount', 'customer_pay'];
  dataSource: Invoice[] = [];

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
    filter.expand = '';
    return filter;
  }

  loadData(): void {
    this.isLoadingResults = true;
    this.service.getList(this.apiFilter).subscribe(res => {
      this.dataSource = res.body;
      this.reloadFilter(res);
      const url = this.service.getStateUrl(this.apiFilter);
      this.isLoadingResults = false;
    });
  }

  ngOnInit(): void {
    this.apiFilter = this.buildFilterFromParams();
    this.loadData();
  }

}
