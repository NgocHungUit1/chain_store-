import { Component, OnInit, ViewChild } from '@angular/core';
import { ListComponentBase } from '../../shared/base';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { ProductService } from '../../product/product.service';
import { ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { NotifierService } from 'angular-notifier';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MatTable } from '@angular/material/table';
import { Product, ProductFilter, ProductReport } from '../../product/product.model';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { debounceTime } from 'rxjs/operators';
import { ProductMedicineDialogComponent } from '../../product/product-medicine-dialog/product-medicine-dialog.component';
// tslint:disable-next-line:max-line-length
import { ProductMerchandiseFormDialogComponent } from '../../product/product-merchandise-form-dialog/product-merchandise-form-dialog.component';
import { ProductUploadDialogComponent } from '../../product/product-upload-dialog/product-upload-dialog.component';
import { InvoiceService } from '../../invoice/invoice.service';
import { DateFilter } from '../../invoice/invoice.model';
// tslint:disable-next-line:max-line-length
import { DatetimeDefaultFilterDialogComponent } from '../../invoice/datetime-default-filter-dialog/datetime-default-filter-dialog.component';
import { DatetimeChooseFilterDialogComponent } from '../../invoice/datetime-choose-filter-dialog/datetime-choose-filter-dialog.component';
import { ProductReportService } from '../product-report.service';

@Component({
  selector: 'app-product-report-main',
  templateUrl: './product-report-main.component.html',
  styleUrls: ['./product-report-main.component.css'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({height: '0px', minHeight: '0'})),
      state('expanded', style({height: '*'})),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ]
})
export class ProductReportMainComponent extends ListComponentBase implements OnInit {

  constructor(
    private service: ProductReportService,
    private route: ActivatedRoute,
    private dialog: MatDialog,
    private notifySer: NotifierService,
    private serviceInvoice: InvoiceService,
    private fb: FormBuilder,
  ) {
    super();
  }

  @ViewChild(MatTable, {static: true}) table: MatTable<any>;
  @ViewChild('selectColumn') selectColumn;

  apiFilter: ProductFilter;
  expandedElement: ProductReport | null;

  statusProductFilter: FormGroup;

  statusProductFilterList = [
    {
      'value': 10,
      'name': 'Kinh doanh',
    },
    {
      'value': 9,
      'name': 'Ngừng kinh doanh',
    },
  ];


  timeFilter: FormGroup;
  currentDateFilter: DateFilter;

  titleTimeDefault = 'Tháng này';
  titleTimeChoose = 'Lựa chọn khác';

  reportType: FormGroup;

  columnsHeader = {
    '#': '#',
    'product_no': 'Mã hàng',
    'product_name': 'Tên hàng',
    'sl_ban': 'SL bán',
    'doanh_thu': 'Doanh thu',
    'sl_tra': 'SL trả',
    'gia_tri_tra': 'Giá trị trả',
    'doanh_thu_thuan': 'Doanh thu thuần',
    'tong_gia_von': 'Tổng giá vốn',
    'loi_nhuan': 'Lợi nhuận',
    'ty_suat': 'Tỷ suất',
    'status': 'Trạng thái',
    'stock_product_no': 'Mã hàng',
    'stock_product_name': 'Tên hàng',
    'stock_so_luong': 'Số lượng',
    'stock_gia_ban': 'Giá bán',
    'stock_gia_tri_ban': 'Giá trị bán',
    'stock_gia_von': 'Giá vốn',
    'stock_gia_tri_kho': 'Giá trị kho'
    // 'quantity_of_stock': 'Tồn kho'
  };

  // for sale
  displayedColumns: string[] = ['#', 'product_no', 'product_name',
    'sl_ban', 'doanh_thu', 'sl_tra', 'gia_tri_tra', 'doanh_thu_thuan'];
  columnsToDisplay: string[] = ['#', 'product_no', 'product_name',
    'sl_ban', 'doanh_thu', 'sl_tra', 'gia_tri_tra', 'doanh_thu_thuan'];
  second_columnsToDisplay: string[] = ['second_#', 'second_product_no', 'second_product_name',
    'second_sl_ban', 'second_doanh_thu', 'second_sl_tra', 'second_gia_tri_tra', 'second_doanh_thu_thuan'];
  dataSource: ProductReport[] = [];

  sum_sl_ban: number;
  sum_doanh_thu: number;
  sum_sl_tra: number;
  sum_gia_tri_tra: number;
  sum_tong_gia_von: number;
  //
  sum_stock_so_luong: number;
  sum_stock_gia_tri_ban: number;
  sum_stock_gia_tri_kho: number;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  isLoadingResults = true;
  isRateLimitReached = false;

  searchProductForm = new FormControl();

  buildFilterFromParams(): ProductFilter {
    function write<K extends keyof ProductFilter>(arg: ProductFilter, key: K, value: ProductFilter[K]): void {
      arg[key] = value;
    }

    const typeReport = this.reportType.controls['type'].value;
    const objDateFilter = this.serviceInvoice.getDateFilter();
    const filter = new ProductFilter();
    const objectKeys = Object.keys(filter) as Array<keyof ProductFilter>;

    for (const attr of objectKeys) {
      write(filter, attr, this.route.snapshot.queryParams['ProductSearch[' + attr + ']']);
    }
    filter.page = this.route.snapshot.queryParams['page'];
    filter.pageSize = this.route.snapshot.queryParams['pageSize'];
    filter.sort = this.route.snapshot.queryParams['sort'];
    if (typeReport === 'stock') {
      filter.expand = 'quantity';
    }
    // filter.expand = 'returnsDetailsBranch';
    // filter.expand = 'medicine,productUnits,productPlacements,group,images,quantity';
    filter.date_from = objDateFilter.date_from;
    filter.date_to = objDateFilter.date_to;
    return filter;
  }


  loadData(): void {
    const typeReport = this.reportType.controls['type'].value;
    if (typeReport === 'sale' || typeReport === 'profit') {
      this.isLoadingResults = true;
      this.service.getListReportSale(this.apiFilter).subscribe(res => {
        this.dataSource = res.body.data;
        this.sum_sl_ban = res.body.sum_sl_ban;
        this.sum_doanh_thu = res.body.sum_doanh_thu;
        this.sum_sl_tra = res.body.sum_sl_tra;
        this.sum_gia_tri_tra = res.body.sum_gia_tri_tra;
        this.sum_tong_gia_von = res.body.sum_tong_gia_von;
        let stt = 0;
        this.dataSource.forEach(elementData => {
          stt++;
          elementData.stt = stt;
        });
        this.reloadFilter(res);
        // const url = this.service.getApiUrlReportSale(this.apiFilter);
        this.isLoadingResults = false;
      });
    }

    if (typeReport === 'stock') {
      this.isLoadingResults = true;
      this.service.getListReportStock(this.apiFilter).subscribe(res => {
        this.dataSource = res.body.data;
        this.sum_stock_so_luong = res.body.sum_stock_so_luong;
        this.sum_stock_gia_tri_ban = res.body.sum_stock_gia_tri_ban;
        this.sum_stock_gia_tri_kho = res.body.sum_stock_gia_tri_kho;
        let stt = 0;
        this.dataSource.forEach(elementData => {
          stt++;
          elementData.stt = stt;
        });
        this.reloadFilter(res);
        // const url = this.service.getApiUrlReportSale(this.apiFilter);
        this.isLoadingResults = false;
      });
    }

  }

  radioTimeChange(event: Event) {
    if (this.timeFilter.controls['typeTime'].value === 'choose') {
      const date = this.serviceInvoice.getDateFilter();
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
      const date = this.serviceInvoice.getDateFilter();
      const date_from = new Date(date.date_from);
      const date_to = new Date(date.date_to);
      this.titleTimeChoose = this.convertDate(date_from) + ' - ' + this.convertDate(date_to);
      this.timeFilter.patchValue({
        typeTime: 'default',
      });

      this.apiFilter = this.buildFilterFromParams();
      this.loadData();
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
      const date = this.serviceInvoice.getDateFilter();
      const date_from = new Date(date.date_from);
      const date_to = new Date(date.date_to);
      this.titleTimeChoose = this.convertDate(date_from) + ' - ' + this.convertDate(date_to);

      this.apiFilter = this.buildFilterFromParams();
      this.loadData();
    });
  }

  initDateFilter() {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    const first = new Date(year, month, 1);
    const obj = new DateFilter();
    // tháng này

    obj.date_from = this.serviceInvoice.convertDateYYYYMMDD(first);
    obj.date_to = this.serviceInvoice.convertDateYYYYMMDD(today);

    const date_from = new Date(obj.date_from);
    const date_to = new Date(obj.date_to);
    this.titleTimeChoose = this.convertDate(date_from) + ' - ' + this.convertDate(date_to);

    this.currentDateFilter = obj;
    this.serviceInvoice.setDateFilter(obj);
  }

  buildFromTimeFilter() {
    this.timeFilter = this.fb.group({
      typeTime: [
        'default'
      ],
    });
    this.reportType = this.fb.group({
      type: ['sale']
    });
  }


  /**
   * Tim kiem theo trang thai sản phẩm
   */
  statusProductFilterChange() {
    this.apiFilter = this.buildFilterFromParams();
    this.loadData();
  }

  ngOnInit() {
    this.initDateFilter();
    this.buildFromTimeFilter();
    this.statusProductFilter = this.fb.group({
      status: [
        [10, 9]
      ],
    });

    this.apiFilter = this.buildFilterFromParams();
    this.loadData();


    this.reportType.valueChanges.subscribe(res => {
      if (res.type === 'sale') {
        this.displayedColumns = ['#', 'product_no', 'product_name',
          'sl_ban', 'doanh_thu', 'sl_tra', 'gia_tri_tra', 'doanh_thu_thuan'];
        this.columnsToDisplay = ['#', 'product_no', 'product_name',
          'sl_ban', 'doanh_thu', 'sl_tra', 'gia_tri_tra', 'doanh_thu_thuan'];
        this.second_columnsToDisplay = ['second_#', 'second_product_no', 'second_product_name',
          'second_sl_ban', 'second_doanh_thu', 'second_sl_tra', 'second_gia_tri_tra', 'second_doanh_thu_thuan'];
      }
      if (res.type === 'profit') {
        this.displayedColumns = ['#', 'product_no', 'product_name',
          'sl_ban', 'doanh_thu', 'sl_tra', 'gia_tri_tra', 'doanh_thu_thuan',
          'tong_gia_von', 'loi_nhuan', 'ty_suat'];
        this.columnsToDisplay = ['#', 'product_no', 'product_name',
          'sl_ban', 'doanh_thu', 'sl_tra', 'gia_tri_tra', 'doanh_thu_thuan',
          'tong_gia_von', 'loi_nhuan', 'ty_suat'];
        this.second_columnsToDisplay = ['second_#', 'second_product_no', 'second_product_name',
          'second_sl_ban', 'second_doanh_thu', 'second_sl_tra', 'second_gia_tri_tra', 'second_doanh_thu_thuan',
          'second_tong_gia_von', 'second_loi_nhuan', 'second_ty_suat'
        ];
      }
      if (res.type === 'stock') {
        this.displayedColumns = ['#', 'product_no', 'product_name',
          'stock_so_luong', 'stock_gia_ban', 'stock_gia_tri_ban', 'stock_gia_von', 'stock_gia_tri_kho'];
        this.columnsToDisplay = ['#', 'product_no', 'product_name',
          'stock_so_luong', 'stock_gia_ban', 'stock_gia_tri_ban', 'stock_gia_von', 'stock_gia_tri_kho'];
        this.second_columnsToDisplay = ['second_#', 'second_product_no', 'second_product_name',
          'second_stock_so_luong', 'second_stock_gia_ban', 'second_stock_gia_tri_ban', 'second_stock_gia_von', 'second_stock_gia_tri_kho'];
      }

      this.apiFilter = this.buildFilterFromParams();
      this.loadData();

    });

    this.searchProductForm.valueChanges.pipe(debounceTime(800)).subscribe(res => {
      if (res !== '') {
        this.apiFilter = this.buildFilterFromParams();
        this.apiFilter.keyword = res;
        this.loadData();
      } else {
        this.apiFilter = this.buildFilterFromParams();
        this.loadData();
      }
    });
  }

  openProductMedicineDialog(action, obj) {
    obj.action = action;
    obj.title = 'Thêm thuốc';
    obj.product_id = null;
    obj.copy_product_id = null;
    const dialogRef = this.dialog.open(ProductMedicineDialogComponent, {
      data: obj,
      width: '60%',
      minHeight: '80%',
    });

    dialogRef.afterClosed().subscribe(result => {
      this.loadData();
    });
  }

  openProductMerchandiseFormDialog(action, obj) {
    obj.action = action;
    obj.title = 'Thêm hàng hóa';
    obj.product_id = null;
    obj.copy_product_id = null;
    const dialogRef = this.dialog.open(ProductMerchandiseFormDialogComponent, {
      data: obj,
      width: '60%',
      minHeight: '80%',
    });

    dialogRef.afterClosed().subscribe(result => {
      this.loadData();
    });
  }

  openUploadDialog() {
    const dialogRef = this.dialog.open(ProductUploadDialogComponent, {
      width: '30%',
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadData();
      }
    });
  }

  /**
   * Download File Excel
   */
  exportExcel() {
    const typeReport = this.reportType.controls['type'].value;
    if (typeReport === 'sale' || typeReport === 'profit') {
      const _apiFilter = this.apiFilter;
      _apiFilter.export = true;
      _apiFilter.type_report = typeReport;
      this.service.getListReportSale(_apiFilter).subscribe(res => {
        const url = this.service.downloadFileExcel(typeReport);
        window.location.href = url;
      });
    }
    // this.apiFilter = this.buildFilterFromParams();
    if (typeReport === 'stock') {
      const _apiFilter = this.apiFilter;
      _apiFilter.export = true;
      _apiFilter.type_report = typeReport;
      this.service.exportExcel(_apiFilter).subscribe(res => {
        const url = this.service.downloadFileExcel(typeReport);
        window.location.href = url;
      });
    }

  }

}
