import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
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
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { DatetimeDefaultFilterDialogComponent } from '../datetime-default-filter-dialog/datetime-default-filter-dialog.component';
import { DatetimeChooseFilterDialogComponent } from '../datetime-choose-filter-dialog/datetime-choose-filter-dialog.component';

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
    private notifySer: NotifierService,
    private fb: FormBuilder
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
  timeFilter: FormGroup;

  // second column 
  TongTienHang: number = 0;
  GiamGia: number = 0;
  KhachHangTra: number = 0;

  columnsHeader = {
    '#': '#',
    'invoice_no': 'Mã đơn hàng',
    'created_at': 'Thời gian',
    'customer': 'Khách hàng',
    'total_price': 'Tổng tiền hàng',
    'discount': 'Giảm giá',
    'payment': 'Khách đã trả',
  };

  displayedColumns: string[] = ['#', 'invoice_no', 'created_at', 'customer', 'total_price', 'discount', 'payment'];
  columnsToDisplay: string[] = ['#', 'invoice_no', 'created_at', 'customer', 'total_price', 'discount', 'payment'];
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
  second_columnsToDisplay: string[] = ['second_#', 'second_invoice_no', 'second_created_at', 'second_customer', 'second_total_price', 'second_discount', 'second_payment'];

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
    filter.expand = 'customer,payment,detail,priceBook,store,user';
    return filter;
  }

  buildFrom() {
    this.timeFilter = this.fb.group({
      typeTime: [
        'default'
      ],
    });
  }

  loadData(): void {
    this.isLoadingResults = true;
    this.buildFrom();
    this.service.getList(this.apiFilter).subscribe(res => {
      let data = res.body;
      let stt = 0;
      data.forEach(elementData => {
        stt++; elementData.stt = stt; // tinh STT

        const date = new Date(1000 * elementData.created_at).toJSON().slice(0, 16);
        elementData.created_at = date.slice(8, 10) + '/'
          + date.slice(5, 7) + '/'
          + date.slice(0, 4) + ' '
          + date.slice(11, 16);

        // cap nhat chi tiet san pham , bang gia chung
        this.service.getDetail(elementData.id, elementData.price_book_id).subscribe(respon => {
          elementData.detail = respon;
        });
        // tong tien khach hang da tra, tien giam gia
        let total_payment = 0;
        let discount_price = 0;
        elementData.payment.forEach(ele => {
          total_payment = total_payment + ele.total_price;


        });
        elementData.total_payment = total_payment;
        // End - tong tien khach hang da tra, tien giam gia

        if (elementData.discount_type === 'vnd') {
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
    this.apiFilter = this.buildFilterFromParams();
    this.loadData();
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    // console.log(filterValue);
    this.apiFilter.invoice_no = filterValue;
    this.loadData();
  }

  openTimeDefault() {
    // console.log(this.timeFilter.controls['typeTime'].value);
    const obj = {
      // title: 'Sửa bảng giá',
      // action: 'update',
    };
    const dialogRef = this.dialog.open(DatetimeDefaultFilterDialogComponent, {
      data: obj,
      width: '40%',
      minHeight: '80%',
    });

    dialogRef.afterClosed().subscribe(result => {
      // if (result !== false && result !== undefined) {
      //   this.apiFilter = this.buildFilterFromParams();
      //   this.loadData();
      // }
    });
  }

  openTimeChoose() {
    const obj = {
      // title: 'Sửa bảng giá',
      // action: 'update',
    };
    const dialogRef = this.dialog.open(DatetimeChooseFilterDialogComponent, {
      data: obj,
      width: '40%',
      minHeight: '80%',
    });

    dialogRef.afterClosed().subscribe(result => {
      // if (result !== false && result !== undefined) {
      //   this.apiFilter = this.buildFilterFromParams();
      //   this.loadData();
      // }
    });
  }

  radioTimeChange(event: Event) {
    // console.log(this.timeFilter.controls['typeTime'].value);
    if (this.timeFilter.controls['typeTime'].value === 'choose') {
      console.log("choose");
      //@NGHIA
    }
  }

}
