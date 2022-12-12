import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
import {Customer} from '../customer.model';
import {CustomerService} from '../customer.service';
import {MatDialog} from '@angular/material/dialog';
import {NotifierService} from 'angular-notifier';
import {InvoiceService} from '../../invoice/invoice.service';
import {Invoice, InvoiceFilter} from '../../invoice/invoice.model';
import {ActivatedRoute} from '@angular/router';

@Component({
  selector: 'app-history-invoice-tab',
  templateUrl: './history-invoice-tab.component.html',
  styleUrls: ['./history-invoice-tab.component.css']
})
export class HistoryInvoiceTabComponent implements OnChanges {

  @Input() customer: Customer;
  @Output() reload: EventEmitter<any> = new EventEmitter();
  @Input() expandedElement: boolean;

  constructor(
    private customerService: CustomerService,
    private dialog: MatDialog,
    private notifyService: NotifierService,
    private invoiceService: InvoiceService,
    private route: ActivatedRoute,
  ) { }

  apiFilter: InvoiceFilter;
  dataSource: Invoice[] = [];

  ngOnChanges(changes: SimpleChanges): void {
    // console.log(this.expandedElement);
    if (this.expandedElement) {
      console.log(this.customer.id);

      this.apiFilter = this.buildFilterFromParams();
      this.loadData();
    }
  }

  buildFilterFromParams(): InvoiceFilter {
    function write<K extends keyof InvoiceFilter>(arg: InvoiceFilter, key: K, value: InvoiceFilter[K]): void {
      arg[key] = value;
    }

    // const objDateFilter = this.service.getDateFilter();
    const filter = new InvoiceFilter();

    const objectKeys = Object.keys(filter) as Array<keyof InvoiceFilter>;

    for (const attr of objectKeys) {
      write(filter, attr, this.route.snapshot.queryParams['InvoiceSearch[' + attr + ']']);
    }
    filter.page = this.route.snapshot.queryParams['page'];
    filter.pageSize = this.route.snapshot.queryParams['pageSize'];
    filter.sort = this.route.snapshot.queryParams['sort'];
    // filter.expand = 'customer,payment,detail,priceBook,store,user,returns,paymentInfo,branch,expensesOrders,today,time,createdFormat';
    filter.expand = 'payment';
    // filter.date_from = objDateFilter.date_from;
    // filter.date_to = objDateFilter.date_to;
    // filter.order_status = this.orderStatusFilter.controls['status'].value;
    // filter.order_national = this.orderNationalFilter.controls['status'].value;

    // const product = this.productFilter.controls['product']?.value;
    // filter.product_id = this.product?.id;
    //
    // const customer = this.customerFilter.controls['customer']?.value;
    filter.customer_id = this.customer?.id;

    return filter;
  }

  loadData(): void {

    // this.isLoadingResults = true;
    this.invoiceService.getList(this.apiFilter).subscribe(res => {
      const data = res.body;
      let stt = 0;
      if (data.length === 1) {
        const arr = data;
        this.expandedElement = data[0];
      }

      data.forEach(elementData => {
        stt++;
        elementData.stt = stt; // tinh STT

        // tong tien khach hang da tra, tien giam gia
        let total_payment = 0;
        let discount_price = 0;
        elementData.payment.forEach(ele => {
          total_payment = total_payment + ele.total_price;

        });
        elementData.total_payment = total_payment;
        // End - tong tien khach hang da tra, tien giam gia

        if (elementData.discount_type === 'price') {
          discount_price = elementData.discount;
        } else {
          discount_price = elementData.total_price * elementData.discount / 100;
        }
        elementData.discount_price = discount_price;

      });
      this.dataSource = data;

      // console.log(this.dataSource);
      // this.reloadFilter(res);
      // // const url = this.service.getStateUrl(this.apiFilter);
      // this.isLoadingResults = false;
    });

    // second header

  }

}
