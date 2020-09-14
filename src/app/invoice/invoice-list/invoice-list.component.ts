import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { ListComponentBase } from '../../shared/base';
import { MatDialog } from '@angular/material/dialog';
import { NotifierService } from 'angular-notifier';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { ActivatedRoute } from '@angular/router';
import { MatTable } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { InvoiceFilter, Invoice, DateFilter } from '../invoice.model';
import { InvoiceService } from '../invoice.service';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { DatetimeDefaultFilterDialogComponent } from '../datetime-default-filter-dialog/datetime-default-filter-dialog.component';
import { DatetimeChooseFilterDialogComponent } from '../datetime-choose-filter-dialog/datetime-choose-filter-dialog.component';
import { debounceTime } from 'rxjs/operators';

@Component({
  selector: 'app-invoice-list',
  templateUrl: './invoice-list.component.html',
  styleUrls: ['./invoice-list.component.css'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({height: '0px', minHeight: '0'})),
      state('expanded', style({height: '*'})),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ]
})
export class InvoiceListComponent extends ListComponentBase implements OnInit {

  constructor(
    private service: InvoiceService,
    private route: ActivatedRoute,
    private dialog: MatDialog,
    private notifySer: NotifierService,
    private fb: FormBuilder,
    private router: Router
  ) {
    super();
  }

  @ViewChild(MatTable, {static: true}) table: MatTable<any>;
  @ViewChild('selectColumn') selectColumn;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  isLoadingResults = true;
  isRateLimitReached = false;

  apiFilter: InvoiceFilter;
  expandedElement: Invoice | null;
  timeFilter: FormGroup;
  currentDateFilter: DateFilter;

  searchInvoiceForm = new FormControl();


  // second column
  TongTienHang = 0;
  GiamGia = 0;
  KhachHangTra = 0;

  //
  titleTimeDefault = 'Tháng này';
  titleTimeChoose = 'Lựa chọn khác';

  columnsHeader = {
    '#': '#',
    'invoice_no': 'Mã đơn hàng',
    'created_at': 'Thời gian',
    'returns': 'Mã trả hàng',
    'customer': 'Khách hàng',
    'total_price': 'Tổng tiền hàng',
    'discount': 'Giảm giá',
    'payment': 'Khách đã trả',
  };

  displayedColumns: string[] = ['#', 'invoice_no', 'created_at', 'returns', 'customer', 'total_price', 'discount', 'payment'];
  columnsToDisplay: string[] = ['#', 'invoice_no', 'created_at', 'returns', 'customer', 'total_price', 'discount', 'payment'];
  dataSource: Invoice[] = [];


  statusItems: any[] = [
    {
      'id': 'default',
      'title': 'Mặc định'
    },
    {
      'id': 'choose',
      'title': 'Lựa chọn khác'
    }
  ];

  // for second column
  second_columnsToDisplay: string[] = ['second_#', 'second_invoice_no', 'second_created_at', 'second_returns', 'second_customer', 'second_total_price', 'second_discount', 'second_payment'];

  buildFilterFromParams(): InvoiceFilter {
    function write<K extends keyof InvoiceFilter>(arg: InvoiceFilter, key: K, value: InvoiceFilter[K]): void {
      arg[key] = value;
    }

    const objDateFilter = this.service.getDateFilter();
    const filter = new InvoiceFilter();

    const objectKeys = Object.keys(filter) as Array<keyof InvoiceFilter>;

    for (const attr of objectKeys) {
      write(filter, attr, this.route.snapshot.queryParams['InvoiceSearch[' + attr + ']']);
    }
    filter.page = this.route.snapshot.queryParams['page'];
    filter.pageSize = this.route.snapshot.queryParams['pageSize'];
    filter.sort = this.route.snapshot.queryParams['sort'];
    filter.expand = 'customer,payment,detail,priceBook,store,user,returns,paymentInfo';
    filter.date_from = objDateFilter.date_from;
    filter.date_to = objDateFilter.date_to;


    return filter;
  }

  buildFrom() {
    this.timeFilter = this.fb.group({
      typeTime: [
        'default'
      ],
    });
  }

  initDateFilter() {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    const first = new Date(year, month, 1);
    const obj = new DateFilter();
    // tháng này

    obj.date_from = this.service.convertDateYYYYMMDD(first);
    obj.date_to = this.service.convertDateYYYYMMDD(today);

    const date_from = new Date(obj.date_from);
    const date_to = new Date(obj.date_to);
    this.titleTimeChoose = this.convertDate(date_from) + ' - ' + this.convertDate(date_to);

    this.currentDateFilter = obj;
    this.service.setDateFilter(obj);
  }

  loadData(): void {
    this.isLoadingResults = true;
    this.service.getList(this.apiFilter).subscribe(res => {
      let data = res.body;
      let stt = 0;
      data.forEach(elementData => {
        stt++;
        elementData.stt = stt; // tinh STT

        const date = new Date(1000 * elementData.created_at).toJSON().slice(0, 16);
        elementData.created_at = date.slice(8, 10) + '/'
          + date.slice(5, 7) + '/'
          + date.slice(0, 4) + ' '
          + date.slice(11, 16);

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

      this.reloadFilter(res);
      // const url = this.service.getStateUrl(this.apiFilter);
      this.isLoadingResults = false;
    });

    // second header
    this.service.getSumaryInvoice(this.apiFilter).subscribe(res => {
      this.TongTienHang = res.body['TongTienHang'];
      this.GiamGia = res.body['GiamGia'];
      this.KhachHangTra = res.body['KhachHangTra'];
    });
  }

  ngOnInit(): void {
    this.initDateFilter();
    this.buildFrom();
    this.apiFilter = this.buildFilterFromParams();
    this.loadData();

    this.service.subscribeDateFilter.subscribe(obj => {
      if (JSON.stringify(this.currentDateFilter) !== JSON.stringify(obj)) {
        this.currentDateFilter = obj;
        this.apiFilter = this.buildFilterFromParams();
        this.loadData();
      }
    });

    this.searchInvoiceForm.valueChanges.pipe(debounceTime(800)).subscribe(res => {
      if (res !== '') {
        this.apiFilter = this.buildFilterFromParams();
        this.apiFilter.invoice_no = res;
        this.loadData();
      }
    });

  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.apiFilter = this.buildFilterFromParams();
    this.apiFilter.invoice_no = filterValue;
    this.loadData();
  }

  openTimeDefault() {
    const obj = {};
    const dialogRef = this.dialog.open(DatetimeDefaultFilterDialogComponent, {
      data: obj,
      width: '40%',
      minHeight: '80%',
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result?.title !== undefined) {
        this.titleTimeDefault = result?.title;
      }
      const date = this.service.getDateFilter();
      const date_from = new Date(date.date_from);
      const date_to = new Date(date.date_to);
      this.titleTimeChoose = this.convertDate(date_from) + ' - ' + this.convertDate(date_to);
      this.timeFilter.patchValue({
        typeTime: 'default',
      });
    });
  }

  openTimeChoose() {
    const obj = {};
    const dialogRef = this.dialog.open(DatetimeChooseFilterDialogComponent, {
      data: obj,
      width: '40%',
      minHeight: '80%',
    });

    dialogRef.afterClosed().subscribe(result => {

      this.timeFilter.patchValue({
        typeTime: 'choose',
      });
      const date = this.service.getDateFilter();
      const date_from = new Date(date.date_from);
      const date_to = new Date(date.date_to);
      this.titleTimeChoose = this.convertDate(date_from) + ' - ' + this.convertDate(date_to);
    });
  }

  radioTimeChange(event: Event) {
    if (this.timeFilter.controls['typeTime'].value === 'choose') {
      const date = this.service.getDateFilter();
      const date_from = new Date(date.date_from);
      const date_to = new Date(date.date_to);
      this.titleTimeChoose = this.convertDate(date_from) + ' - ' + this.convertDate(date_to);
    } else {
      this.titleTimeChoose = 'Lựa chọn khác';
    }
  }

  convertDate(date: Date) {
    const month = date.getMonth() + 1;
    return date.getDate() + '/' + month + '/' + date.getFullYear();
  }

  goToCartPage() {
    this.router.navigate(['/sale']);
  }

}
