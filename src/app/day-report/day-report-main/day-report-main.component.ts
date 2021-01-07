import { Component, OnInit, ViewChild } from '@angular/core';
import { InvoiceService } from '../../invoice/invoice.service';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { NotifierService } from 'angular-notifier';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { ListComponentBase } from '../../shared/base';
import { MatTable } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { DateFilter, Invoice, InvoiceFilter } from '../../invoice/invoice.model';
import { debounceTime } from 'rxjs/operators';
import { DatetimeDefaultFilterDialogComponent } from '../../invoice/datetime-default-filter-dialog/datetime-default-filter-dialog.component';
import { DatetimeChooseFilterDialogComponent } from '../../invoice/datetime-choose-filter-dialog/datetime-choose-filter-dialog.component';

@Component({
  selector: 'app-day-report-main',
  templateUrl: './day-report-main.component.html',
  styleUrls: ['./day-report-main.component.css']
})
export class DayReportMainComponent extends ListComponentBase implements OnInit {

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
  orderStatusFilter: FormGroup;
  orderNationalFilter: FormGroup;

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
    // 'returns': 'Mã trả hàng',
    'customer': 'Khách hàng',
    'total_price': 'Tổng tiền hàng',
    'discount': 'Giảm giá',
    'payment': 'Khách đã trả',
    // 'national_pharmacy_no': 'Mã phiếu dược quốc gia',
  };

  displayedColumns: string[] = [
    '#', 'invoice_no', 'created_at', 'customer', 'total_price',
    'discount', 'payment'
  ];
  columnsToDisplay: string[] = [
    '#', 'invoice_no', 'created_at', 'customer', 'total_price',
    'discount', 'payment'
  ];
  dataSource: Invoice[] = [];

  orderStatus = {
    'pending': 'Đang xử lý',
    'done': 'Hoàn thành'
  };

  orderStatusFilterList = [
    {
      'value': 'pending',
      'name': 'Đang xử lý',
    },
    {
      'value': 'done',
      'name': 'Hoàn thành',
    },
  ];


  orderNationalFilterList = [
    {
      'value': 'yes',
      'name': 'Đã liên thông',
    },
    {
      'value': 'no',
      'name': 'Chưa liên thông',
    },
  ];

  // label
  orderStatusLabel = {
    'pending': 'label label-warning',
    'done': 'label label-success'
  };

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
  second_columnsToDisplay: string[] = [
    'second_#', 'second_invoice_no', 'second_created_at', 'second_customer',
    'second_total_price', 'second_discount', 'second_payment'
  ];

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
    filter.expand = 'customer,payment,detail,priceBook,store,user';
    filter.date_from = objDateFilter.date_from;
    filter.date_to = objDateFilter.date_to;
    filter.order_status = this.orderStatusFilter.controls['status'].value;
    filter.order_national = this.orderNationalFilter.controls['status'].value;

    return filter;
  }

  buildFrom() {
    this.timeFilter = this.fb.group({
      typeTime: [
        'default'
      ],
    });

    this.orderStatusFilter = this.fb.group({
      status: [
        ['pending', 'done']
      ],
    });

    this.orderNationalFilter = this.fb.group({
      status: [
        ['yes', 'no']
      ],
    });
  }

  /**
   * Tim kiem theo trang thai don hang
   */
  orderStatusFilterChange() {
    this.apiFilter = this.buildFilterFromParams();
    this.loadData();
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

    this.service.subscribeLoadInvoice.subscribe(action => {
      if (action === true) {
        this.apiFilter = this.buildFilterFromParams();
        this.loadData();
        this.service.setLoadInvoice(false);
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

  /**
   * Download File Excel
   */
  exportExcel() {
    this.apiFilter = this.buildFilterFromParams();
    this.service.exportExcel(this.apiFilter).subscribe(res => {
      // console.log(res);
      const url = this.service.downloadFileExcel();
      window.location.href = url;
    });
  }

}
