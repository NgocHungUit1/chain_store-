import { Component, OnInit, ViewChild } from '@angular/core';
import { Location } from '@angular/common';
import { ListComponentBase } from '../../shared/base';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { NotifierService } from 'angular-notifier';
import { animate, state, style, transition, trigger } from "@angular/animations";
import { FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { MatTable } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { Customer } from '../../customer/customer.model';
import { Returns, ReturnsFilter, ReturnedItemStatistics } from '../returns.model';
import { ReturnsService } from '../returns.service';
import { catchError, debounceTime, map, startWith, switchMap } from 'rxjs/operators';
import { DatetimeDefaultFilterDialogComponent } from '../../invoice/datetime-default-filter-dialog/datetime-default-filter-dialog.component';
import { DatetimeChooseFilterDialogComponent } from '../../invoice/datetime-choose-filter-dialog/datetime-choose-filter-dialog.component';
import { DateFilter } from '../../invoice/invoice.model';
import { InvoiceService } from '../../invoice/invoice.service';
import { Observable, of } from 'rxjs';
import { CustomerService } from '../../customer/customer.service';
import { Product } from '../../product/product.model';
import { ProductService } from '../../product/product.service';
import {ReturnReason, ReturnReasonService} from '../return-reason.service';

@Component({
  selector: 'app-returns-list',
  templateUrl: './returns-list.component.html',
  styleUrls: ['./returns-list.component.css'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ]
})
export class ReturnsListComponent extends ListComponentBase implements OnInit {

  constructor(
    private service: ReturnsService,
    private route: ActivatedRoute,
    private dialog: MatDialog,
    private notifySer: NotifierService,
    private fb: FormBuilder,
    private location: Location,
    private router: Router,
    private dateFilterService: InvoiceService,
    private customerSer: CustomerService,
    private productSer: ProductService,
    private returnReasonService: ReturnReasonService,
  ) {
    super();
   }

   @ViewChild(MatTable, { static: true }) table: MatTable<any>;
  @ViewChild('selectColumn') selectColumn;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  isLoadingResults = true;
  isRateLimitReached = false;

  apiFilter: ReturnsFilter;
  expandedElement: Returns | null;
  // productFilter: FormGroup;
  timeFilter: FormGroup;
  filterError = '';
  emptyDetailMessage = '';
  // filteredProducts: Observable<Product[]>;
  currentDateFilter: DateFilter;
  titleTimeDefault = '3 tháng trước';
  titleTimeChoose = 'Lựa chọn khác';
  // Thống kê thuốc trả trong kỳ. Server gộp sẵn nên đây chỉ việc hiển thị.
  thongKeThuoc: ReturnedItemStatistics[] = [];
  hienThongKe = false;
  dangTaiThongKe = false;

  searchForm = new FormControl();

  returnReasons: ReturnReason[] = [];

  onReasonFilterChange(reasonId) {
    this.apiFilter.return_reason_id = reasonId || '';
    this.apiFilter.page = 1;
    this.loadData();
  }

  columnsHeader = {
    '#': '#',
    'return_no': 'Mã trả hàng',
    'created_at': 'Thời gian',
    'customer': 'Khách hàng',
    'total_price': 'Tổng tiền hàng',
    'return_reason': 'Lý do trả',
    // 'discount': 'Giảm giá',
  };

  displayedColumns: string[] = ['#', 'return_no', 'created_at', 'customer', 'total_price', 'return_reason'];
  columnsToDisplay: string[] = ['#', 'return_no', 'created_at', 'customer', 'total_price', 'return_reason'];
  dataSource: Returns[] = [];

  buildFilterFromParams(): ReturnsFilter {
    function write<K extends keyof ReturnsFilter>(arg: ReturnsFilter, key: K, value: ReturnsFilter[K]): void {
      arg[key] = value;
    }
    const filter = new ReturnsFilter();
    const objDateFilter = this.dateFilterService.getDateFilter();

    const objectKeys = Object.keys(filter) as Array<keyof ReturnsFilter>;

    for (const attr of objectKeys) {
      write(filter, attr, this.route.snapshot.queryParams['ReturnsSearch[' + attr + ']']);
    }
    filter.page = this.route.snapshot.queryParams['page'];
    filter.pageSize = this.route.snapshot.queryParams['pageSize'];
    filter.sort = this.route.snapshot.queryParams['sort'];
    filter.expand = 'customer,priceBook,store,user,detailInfo,nationalPharmacyV2,returnReason';
    if (objDateFilter) {
      filter.date_from = objDateFilter.date_from;
      filter.date_to = objDateFilter.date_to;
    }
    // Không còn ô lọc khách hàng riêng: tên và SĐT khách đã nằm trong ô tìm kiếm
    // đa năng (ReturnsSearch[keyword]) để dược sĩ chỉ phải gõ một chỗ.
    // const product = this.productFilter && this.productFilter.controls['product'] ? this.productFilter.controls['product'].value : null;
    // filter.medicine_code = product && product.product_no ? product.product_no : '';

    return filter;
  }

  /** Mở/đóng bảng thống kê. Mở tới đâu tải tới đó, khỏi gọi API thừa. */
  toggleThongKe(): void {
    this.hienThongKe = !this.hienThongKe;
    if (this.hienThongKe) {
      this.taiThongKe();
    }
  }

  taiThongKe(): void {
    this.dangTaiThongKe = true;
    this.service.getThongKeThuoc(this.apiFilter).subscribe(res => {
      this.thongKeThuoc = res || [];
      this.dangTaiThongKe = false;
    }, () => {
      this.thongKeThuoc = [];
      this.dangTaiThongKe = false;
    });
  }

  /** Tổng số lượng trả của cả kỳ, để hiện ở dòng tổng. */
  get tongSoLuongTra(): number {
    return this.thongKeThuoc.reduce((t, d) => t + Number(d.so_luong_tra || 0), 0);
  }

  get tongThanhTien(): number {
    return this.thongKeThuoc.reduce((t, d) => t + Number(d.thanh_tien || 0), 0);
  }

  loadData(): void {
    this.isLoadingResults = true;
    // this.clearStatistics();
    if (this.hienThongKe) {
      this.taiThongKe();
    }
    this.service.getList(this.apiFilter).subscribe(res => {
      let data = res.body;
      let stt = 0;
      data.forEach(elementData => {
        stt++; elementData.stt = stt; // tinh STT

        // const date = new Date(1000 * elementData.created_at).toJSON().slice(0, 16);
        // elementData.created_at = date.slice(8, 10) + '/'
        //   + date.slice(5, 7) + '/'
        //   + date.slice(0, 4) + ' '
        //   + date.slice(11, 16);

        // // tong tien khach hang da tra, tien giam gia
        // let total_payment = 0;
        // let discount_price = 0;
        // elementData.payment.forEach(ele => {
        //   total_payment = total_payment + ele.total_price;

        // });
        // elementData.total_payment = total_payment;
        // // End - tong tien khach hang da tra, tien giam gia

        // if (elementData.discount_type === 'price') {
        //   discount_price = elementData.discount;
        // } else {
        //   discount_price = elementData.total_price * elementData.discount / 100;
        // }
        // elementData.discount_price = discount_price;

      });
      this.dataSource = data;

      if (this.dataSource.length === 1) {
        const arr = this.dataSource;
        this.expandedElement = arr[0];
      }

      this.reloadFilter(res);

      let url = '/transaction/returns';
      url += '?' + this.apiFilter.toFilterString();
      this.location.go(url);

      this.isLoadingResults = false;
      // this.refreshStatistics();
    }, () => {
      this.isLoadingResults = false;
      this.isRateLimitReached = true;
      // this.clearStatistics();
    });

  }

  ngOnInit(): void {
    this.initDateFilter();
    this.apiFilter = this.buildFilterFromParams();
    this.returnReasonService.getList().subscribe(res => this.returnReasons = res || []);
    this.timeFilter = this.fb.group({
      typeTime: ['default']
    });
    // this.productFilter = this.fb.group({
    //   product: [null]
    // });

    this.loadData();

    this.searchForm.valueChanges.pipe(debounceTime(800)).subscribe(res => {
      if (res !== '') {
        this.apiFilter = this.buildFilterFromParams();
        this.apiFilter.keyword = res;
        // Đang ở trang 3 mà tìm từ mới thì kết quả mới thường không có tới trang 3,
        // không đưa về trang 1 là người dùng thấy bảng trống tưởng không tìm ra.
        this.apiFilter.page = 1;
        this.loadData();
        // this.service.setLoadProduct(false);
      } else {
        this.apiFilter = this.buildFilterFromParams();
        this.loadData();
        // this.service.setLoadProduct(false);
      }
    });

    // this.filteredProducts = this.productFilter.controls['product'].valueChanges.pipe(
    //   startWith(''),
    //   debounceTime(300),
    //   switchMap(value => {
    //     if (value !== '') {
    //       return this.lookupProduct(value);
    //     }
    //     return of(null);
    //   })
    // );
    //
    // this.productFilter.controls['product'].valueChanges.pipe(debounceTime(300)).subscribe(value => {
    //   if (value === null || value === '') {
    //     this.filterChange();
    //   }
    // });

    this.dateFilterService.subscribeDateFilter.subscribe(obj => {
      if (JSON.stringify(this.currentDateFilter) !== JSON.stringify(obj)) {
        this.currentDateFilter = obj;
        this.filterChange();
      }
    });
  }

  syncDisplayedColumns(): void {
    this.displayedColumns = (this.displayedColumns || []).filter(column => this.columnsToDisplay.indexOf(column) !== -1);
  }

  getExpandedDetail(element: any) {
    const model = this.getExpandedModel(element);
    return model ? model.detailInfo : [];
  }

  getExpandedModel(element: any): Returns {
    return element && element.return ? element.return : element;
  }


  // private refreshStatistics(): void {
  //   this.service.getStatisticsSource(this.apiFilter).subscribe(returns => {
  //     const selectedCode = this.apiFilter.medicine_code || '';
  //     this.statistics = this.calculateStatistics(returns || [], selectedCode);
  //   }, () => this.clearStatistics());
  // }



  displayCustomer(customer?: Customer): string | undefined {
    return (customer === undefined || customer === null) ? undefined : customer.name;
  }

  lookupCustomer(value: string | Customer): Observable<Customer[]> {
    const keyword = typeof value === 'string' ? value : (value && value.name ? value.name : '');
    return this.customerSer.autocomplete(keyword, null).pipe(
      map(results => results),
      catchError(_ => of(null))
    );
  }

  // displayProduct(product?: Product): string | undefined {
  //   return (product === undefined || product === null) ? undefined : product.product_no + ' - ' + product.product_name;
  // }
  //
  // lookupProduct(value: string | Product): Observable<Product[]> {
  //   const keyword = typeof value === 'string' ? value : (value && value.product_no ? value.product_no : '');
  //   return this.productSer.autocomplete(keyword).pipe(
  //     map(results => results),
  //     catchError(_ => of(null))
  //   );
  // }

  filterChange(): void {
    this.apiFilter = this.buildFilterFromParams();
    this.apiFilter.page = 1;
    this.loadData();
  }

  initDateFilter(): void {
    const obj = new DateFilter();
    obj.date_to = this.formatDate(new Date());
    const from = new Date();
    from.setMonth(from.getMonth() - 3);
    obj.date_from = this.formatDate(from);

    this.currentDateFilter = obj;
    this.dateFilterService.setDateFilter(obj);
    this.titleTimeDefault = '3 tháng trước';
    this.titleTimeChoose = this.convertDate(new Date(obj.date_from)) + ' - ' + this.convertDate(new Date(obj.date_to));
  }

  openTimeDefault(): void {
    const obj = { currentTitle: this.titleTimeDefault };
    const dialogRef = this.dialog.open(DatetimeDefaultFilterDialogComponent, {
      data: obj,
      width: '40%',
      minHeight: '80%',
      autoFocus: false,
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && result.title !== undefined) {
        this.titleTimeDefault = result.title;
      }
      const date = this.dateFilterService.getDateFilter();
      const date_from = new Date(date.date_from);
      const date_to = new Date(date.date_to);
      this.titleTimeChoose = this.convertDate(date_from) + ' - ' + this.convertDate(date_to);
      this.timeFilter.patchValue({
        typeTime: 'default',
      });
    });
  }

  openTimeChoose(): void {
    const dialogRef = this.dialog.open(DatetimeChooseFilterDialogComponent, {
      data: {},
      width: '40%',
      minHeight: '80%',
    });

    dialogRef.afterClosed().subscribe(() => {
      this.timeFilter.patchValue({
        typeTime: 'choose',
      });
      const date = this.dateFilterService.getDateFilter();
      const date_from = new Date(date.date_from);
      const date_to = new Date(date.date_to);
      this.titleTimeChoose = this.convertDate(date_from) + ' - ' + this.convertDate(date_to);
    });
  }

  radioTimeChange(event: Event): void {
    if (this.timeFilter.controls['typeTime'].value === 'choose') {
      const date = this.dateFilterService.getDateFilter();
      const date_from = new Date(date.date_from);
      const date_to = new Date(date.date_to);
      this.titleTimeChoose = this.convertDate(date_from) + ' - ' + this.convertDate(date_to);
    } else {
      this.titleTimeChoose = 'Lựa chọn khác';
    }
  }

  convertDate(date: Date): string {
    const month = date.getMonth() + 1;
    return date.getDate() + '/' + month + '/' + date.getFullYear();
  }

  private formatDate(date: Date): string {
    const month = date.getMonth() + 1;
    return date.getFullYear() + '-' + month + '-' + date.getDate();
  }

}
