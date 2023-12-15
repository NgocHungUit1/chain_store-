import { Component, OnInit, Input } from '@angular/core';
import {Invoice} from '../invoice.model';
import {MatDialog} from '@angular/material/dialog';
import {NotifierService} from 'angular-notifier';
import {ReturnsService} from '../../returns/returns.service';
import {ReturnsFilter} from '../../returns/returns.model';
import {ActivatedRoute} from '@angular/router';

@Component({
  selector: 'app-invoice-tab-returns',
  templateUrl: './invoice-tab-returns.component.html',
  styleUrls: ['./invoice-tab-returns.component.css']
})
export class InvoiceTabReturnsComponent implements OnInit {

  @Input() invoice: Invoice;

  displayedColumns: string[] = ['#', 'return_no', 'total_price', 'created_at', 'created_by'];

  dataSource = [];

  columnsHeader = {
    '#': '#',
    'return_no': 'Mã trả hàng',
    'created_at': 'Thời gian',
    'created_by': 'Người tạo',
    'total_price': 'Tổng cộng',
  };

  constructor(
    private dialog: MatDialog,
    public notifySer: NotifierService,
    public returnSer: ReturnsService,
    private route: ActivatedRoute,
  ) {
  }

  @Input() sub_page = false;
  @Input() page_size = 20;
  apiFilter: ReturnsFilter = new ReturnsFilter();

  loading = false;

  buildFilterFromParams(): ReturnsFilter {
    function write<K extends keyof ReturnsFilter>(arg: ReturnsFilter, key: K, value: ReturnsFilter[K]): void {
      arg[key] = value;
    }
    const filter = new ReturnsFilter();
    const objectKeys = Object.keys(filter) as Array<keyof ReturnsFilter>;

    for (const attr of objectKeys) {
      if (this.route.snapshot.queryParams['ReturnsSearch[' + attr + ']'] !== undefined) {
        write(filter, attr, this.route.snapshot.queryParams['ReturnsSearch[' + attr + ']']);
      }
    }
    if (this.route.snapshot.queryParams['pageSize'] !== undefined) {
      filter.pageSize = this.route.snapshot.queryParams['pageSize'];
    } else {
      filter.pageSize = this.page_size;
    }
    filter.page = this.route.snapshot.queryParams['page'];
    filter.sort = this.route.snapshot.queryParams['sort'];
    filter.invoice_id = this.invoice.id;
    filter.expand = 'createdUser';
    return filter;
  }

  loadData(): void {
    this.loading = true;
    this.returnSer.getList(this.apiFilter).subscribe(res => {
      this.dataSource = res.body;
      this.loading = false;
    });
  }

  ngOnInit() {
    this.apiFilter = this.buildFilterFromParams();
    this.loadData();
  }

}
