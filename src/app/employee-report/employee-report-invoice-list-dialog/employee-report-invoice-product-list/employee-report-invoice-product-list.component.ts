import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { NotifierService } from 'angular-notifier';
import { ActivatedRoute, Router } from '@angular/router';
import {InvoiceService} from '../../../invoice/invoice.service';

@Component({
  selector: 'app-employee-report-invoice-product-list',
  templateUrl: './employee-report-invoice-product-list.component.html',
  styleUrls: ['./employee-report-invoice-product-list.component.css']
})
export class EmployeeReportInvoiceProductListComponent implements OnChanges {
  @Input() invoice_id: string;
  @Input() isShowCommission: boolean;
  @Input() expandedElement: boolean;

  displayedColumns: string[] = ['product_no', 'product_name', 'amount', 'common_price', 'discount', 'price', 'total_price'];

  columnsHeader = {
    'product_no': 'Mã hàng',
    'product_name': 'Tên hàng',
    'amount': 'Số lượng',
    'common_price': 'Đơn giá',
    'discount': 'Giảm giá',
    'price': 'Giá bán',
    'comm_percent': '% HH',
    'comm_amount': 'HH',
    'total_price': 'Thành tiền'
  };


  constructor(
    public notifySer: NotifierService,
    private route: ActivatedRoute,
    private invoiceSer: InvoiceService,
  ) {
  }

  dataSource = [];

  loading = false;
  loadData() {
    this.loading = true;
    this.invoiceSer.getInfo(this.invoice_id,'detail').subscribe(res => {
      this.dataSource = res['detail'];

      this.loading = false;
    });

  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.expandedElement) {
      if (this.isShowCommission) {
        this.displayedColumns.push('comm_percent');
        this.displayedColumns.push('comm_amount');
      }
      this.loadData();
    }
  }


}
