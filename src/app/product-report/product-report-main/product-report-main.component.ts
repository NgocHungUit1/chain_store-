import {Component, OnInit, ViewChild} from '@angular/core';
import {ListComponentBase} from '../../shared/base';
import {animate, state, style, transition, trigger} from '@angular/animations';
import {ProductService} from '../../product/product.service';
import {ActivatedRoute} from '@angular/router';
import {MatDialog} from '@angular/material/dialog';
import {NotifierService} from 'angular-notifier';
import {FormBuilder, FormControl, FormGroup} from '@angular/forms';
import {MatTable} from '@angular/material/table';
import {Product, ProductFilter, ProductReport} from '../../product/product.model';
import {MatPaginator} from '@angular/material/paginator';
import {MatSort} from '@angular/material/sort';
import {debounceTime} from 'rxjs/operators';
import {ProductMedicineDialogComponent} from '../../product/product-medicine-dialog/product-medicine-dialog.component';
// tslint:disable-next-line:max-line-length
import {ProductMerchandiseFormDialogComponent} from '../../product/product-merchandise-form-dialog/product-merchandise-form-dialog.component';
import {ProductUploadDialogComponent} from '../../product/product-upload-dialog/product-upload-dialog.component';
import {InvoiceService} from '../../invoice/invoice.service';
import {DateFilter} from '../../invoice/invoice.model';
// tslint:disable-next-line:max-line-length
import {DatetimeDefaultFilterDialogComponent} from '../../invoice/datetime-default-filter-dialog/datetime-default-filter-dialog.component';
import {DatetimeChooseFilterDialogComponent} from '../../invoice/datetime-choose-filter-dialog/datetime-choose-filter-dialog.component';
import {ProductReportService} from '../product-report.service';
import {WarehouseProductParcelService} from '../../warehouse-product-parcel/warehouse-product-parcel.service';
import {WarehouseProductParcelFilter} from '../../warehouse-product-parcel/warehouse-product-parcel.model';

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
    private parcelSer: WarehouseProductParcelService,
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
  parcelFilter: WarehouseProductParcelFilter;
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

  timeExpireFilter: FormGroup;

  columnsHeader = {
    '#': '#',
    'product_no': 'Mã hàng',
    'product_name': 'Tên hàng',
    'total_staff_invoice': 'SL nhân viên bán',
    'total_staff_return': 'SL nhân viên trả',
    'total_customer': 'SL Khách hàng',
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
    'stock_gia_tri_kho': 'Giá trị kho',
    'ton_dau_ky': 'Tổn đầu kỳ', //
    'gia_tri_dau_ky': 'Giá trị đầu kỳ',
    'sl_nhap': 'Số lượng nhập',
    'gia_tri_nhap': 'Giá trị nhập',
    'sl_xuat': 'Số lượng xuất',
    'gia_tri_xuat': 'Giá trị xuất',
    'ton_cuoi_ky': 'Tồn cuối kỳ',
    'gia_tri_cuoi_ky': 'Giá trị cuối kỳ',
    'nhap_ncc': 'N.NCC',
    'nhap_kiem': 'N.kiểm',
    'nhap_tra_hang': 'Trả hàng',
    'nhap_chuyen': 'N.chuyển',
    'xuat_ban': 'X.bán',
    'xuat_kiem': 'X.kiểm',
    'xuat_chuyen': 'X.chuyển',
    // 'quantity_of_stock': 'Tồn kho'
    'expiration_parcel_no': 'Lô',
    'expiration_date': 'Hạn sử dụng',
    'expiration_day_exits': 'Số ngày còn lại',
    'expiration_quantity': 'Số lượng',
    'supplier_total': 'SL NCC',
    'supplier_total_import': 'SL nhập',
    'supplier_total_value_import': 'Giá trị nhập',
    'supplier_total_return': 'SL Trả',
    'supplier_total_value_return': 'Giá trị trả',
    'supplier_value_pure': 'Giá trị thuần',
  };

  // for sale
  displayedColumns: string[] = ['#', 'product_no', 'product_name',
    'sl_ban', 'doanh_thu', 'sl_tra', 'gia_tri_tra', 'doanh_thu_thuan'];
  columnsToDisplay: string[] = ['#', 'product_no', 'product_name',
    'sl_ban', 'doanh_thu', 'sl_tra', 'gia_tri_tra', 'doanh_thu_thuan'];
  second_columnsToDisplay: string[] = ['second_#', 'second_product_no', 'second_product_name',
    'second_sl_ban', 'second_doanh_thu', 'second_sl_tra', 'second_gia_tri_tra', 'second_doanh_thu_thuan'];
  dataSource: ProductReport[] = [];
  groupData: any[] = [];

  sum_sl_ban: number;
  sum_doanh_thu: number;
  sum_sl_tra: number;
  sum_gia_tri_tra: number;
  sum_tong_gia_von: number;
  //
  sum_stock_so_luong: number;
  sum_stock_gia_tri_ban: number;
  sum_stock_gia_tri_kho: number;

  //
  sum_ton_dau_ky: number;
  sum_gia_tri_dau_ky: number;
  sum_sl_nhap: number;
  sum_gia_tri_nhap: number;
  sum_sl_xuat: number;
  sum_gia_tri_xuat: number;
  sum_ton_cuoi_ky: number;
  sum_gia_tri_cuoi_ky: number;

  //
  sum_sl_kiem_nhap: number;
  sum_sl_kiem_xuat: number;
  sum_sl_nhap_chuyen: number;
  sum_sl_xuat_chuyen: number;
  sum_sl_tra_hang: number;

  // supplier
  sum_supplier_total_import = 0;
  sum_supplier_total_value_import = 0;
  sum_supplier_total_return = 0;
  sum_supplier_total_value_return = 0;
  sum_supplier_value_pure = 0;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  isLoadingResults = true;
  isRateLimitReached = false;

  sum_expiration: number;

  searchProductForm = new FormControl();
  tab: string = '';

  public timeSelected = 'next_3_month';
  public timeSelects = [
    'today',
    'this_week',
    'this_month',
    'next_30_day',
    'next_2_month',
    'next_3_month',
    'next_6_month',
    'next_year',
    'expired',
  ];
  public timeLabels = {
    'today': 'Hôm nay',
    'this_week': 'Tuần này',
    'this_month': 'Tháng này',
    'next_30_day': '30 ngày tới',
    'next_2_month': 'Trong 2 tháng',
    'next_3_month': 'Trong 3 tháng',
    'next_6_month': 'Trong 6 tháng',
    'next_year': 'Trong 1 năm',
    'expired': 'Đã hết hạn',
  };

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
    filter.expand = 'sl_ban,doanh_thu,tong_gia_von,sl_tra,gia_tri_tra,base_revenue';

    if (typeReport === 'stock') {
      // filter.expand = 'quantity,stockCard';
    }

    if (typeReport === 'export-import') {
      // filter.expand = 'tonDauKy,tonCuoiKy,soLuongNhap,soLuongXuat';
    }

    if (typeReport === 'export-import-detail') {
      filter.expand = 'tonDauKy,tonCuoiKy,soLuongNhap,soLuongXuat,soLuongKiemNhap,soLuongKiemXuat,' +
        'soLuongNhapChuyen,soLuongXuatChuyen,soLuongTraHang';
    }

    if (typeReport === 'expiration-date') {
      filter.expand = 'productUnit,quantity';
    }

    if (typeReport === 'supplier') {
      filter.expand = 'totalSupplier,totalWarehouseImport,totalWarehouseReturn';
    }
    filter.keyword = this.searchProductForm.value;

    // filter.expand = 'returnsDetailsBranch';
    // filter.expand = 'medicine,productUnits,productPlacements,group,images,quantity';
    filter.date_from = objDateFilter.date_from;
    filter.date_to = objDateFilter.date_to;
    return filter;
  }

  buildFilterExpiration(): WarehouseProductParcelFilter {
    function write<K extends keyof WarehouseProductParcelFilter>(arg: WarehouseProductParcelFilter, key: K, value: WarehouseProductParcelFilter[K]): void {
      arg[key] = value;
    }

    const objDateFilter = this.serviceInvoice.getDateFilter();
    const filter = new WarehouseProductParcelFilter();
    const objectKeys = Object.keys(filter) as Array<keyof WarehouseProductParcelFilter>;

    for (const attr of objectKeys) {
      write(filter, attr, this.route.snapshot.queryParams['WarehouseProductParcelSearch[' + attr + ']']);
    }
    filter.page = this.route.snapshot.queryParams['page'];
    filter.pageSize = this.route.snapshot.queryParams['pageSize'];
    filter.sort = this.route.snapshot.queryParams['sort'];

    if (filter.timeSelect !== undefined && filter.timeSelect.length > 0) {
      this.timeExpireFilter.patchValue({'typeTime': filter.timeSelect});
    }

    // filter.expand = 'returnsDetailsBranch';
    // filter.expand = 'medicine,productUnits,productPlacements,group,images,quantity';
    filter.date_from = objDateFilter.date_from;
    filter.date_to = objDateFilter.date_to;
    return filter;
  }


  loadData(summary = true): void {
    const typeReport = this.reportType.controls['type'].value;
    if (typeReport === 'sale' || typeReport === 'profit' || typeReport === 'sale-staff' || typeReport === 'customer') {
      this.isLoadingResults = true;
      this.service.getListReportSale(this.apiFilter).subscribe(res => {
        this.dataSource = res.body;
        // this.groupData = res.body.groupData;
        // console.log(this.groupData);
        let stt = 0;
        this.dataSource.forEach(elementData => {
          stt++;
          elementData.stt = stt;
        });
        this.reloadFilter(res);
        // const url = this.service.getApiUrlReportSale(this.apiFilter);
        this.isLoadingResults = false;
      });

      if (summary) {
        this.service.getListReportSaleSummary(this.apiFilter).subscribe(res => {
          this.sum_sl_ban = res.body.sl_ban;
          this.sum_doanh_thu = res.body.doanh_thu;
          this.sum_sl_tra = res.body.sl_tra;
          this.sum_gia_tri_tra = res.body.gia_tri_tra;
          this.sum_tong_gia_von = res.body.base_revenue;
        });
      }
    }

    if (typeReport === 'stock') {
      this.isLoadingResults = true;
      this.service.getListReportStock(this.apiFilter).subscribe(res => {
        this.dataSource = res.body;
        let stt = 0;
        this.dataSource.forEach(elementData => {
          stt++;
          elementData.stt = stt;
        });
        this.reloadFilter(res);
        // const url = this.service.getApiUrlReportSale(this.apiFilter);
        this.isLoadingResults = false;
      });

      if (summary) {
        this.service.getListReportStockSummary(this.apiFilter).subscribe(res => {
          this.sum_stock_so_luong = res.body.quantity_of_stock;
          this.sum_stock_gia_tri_ban = res.body.sell_price;
          this.sum_stock_gia_tri_kho = res.body.original_price;
        });
      }
    }

    if (typeReport === 'export-import') {
      this.isLoadingResults = true;
      this.service.getListReportExportImport(this.apiFilter).subscribe(res => {
        this.dataSource = res.body;

        let stt = 0;
        this.dataSource.forEach(elementData => {
          stt++;
          elementData.stt = stt;
        });
        this.reloadFilter(res);
        // const url = this.service.getApiUrlReportSale(this.apiFilter);
        this.isLoadingResults = false;
      });

      if (summary) {
        this.service.getExportImportSummary(this.apiFilter).subscribe(res => {
          this.sum_ton_dau_ky = res.body.sum_ton_dau_ky;
          this.sum_gia_tri_dau_ky = res.body.sum_gia_tri_dau_ky;
          this.sum_sl_nhap = res.body.sum_sl_nhap;
          this.sum_gia_tri_nhap = res.body.sum_gia_tri_nhap;
          this.sum_sl_xuat = res.body.sum_sl_xuat;
          this.sum_gia_tri_xuat = res.body.sum_gia_tri_xuat;
          this.sum_ton_cuoi_ky = res.body.sum_ton_cuoi_ky;
          this.sum_gia_tri_cuoi_ky = res.body.sum_gia_tri_cuoi_ky;
        });
      }
    }

    if (typeReport === 'export-import-detail') {
      this.isLoadingResults = true;
      this.service.getListReportExportImportDetail(this.apiFilter).subscribe(res => {
        this.dataSource = res.body;

        let stt = 0;
        this.dataSource.forEach(elementData => {
          stt++;
          elementData.stt = stt;
        });
        this.reloadFilter(res);
        // const url = this.service.getApiUrlReportSale(this.apiFilter);
        this.isLoadingResults = false;
      });

      if (summary) {
        this.service.getExportImportDetailSummary(this.apiFilter).subscribe(res => {
          this.sum_ton_dau_ky = res.body.sum_ton_dau_ky;
          this.sum_gia_tri_dau_ky = res.body.sum_gia_tri_dau_ky;
          this.sum_sl_nhap = res.body.sum_sl_nhap;
          this.sum_gia_tri_nhap = res.body.sum_gia_tri_nhap;
          this.sum_sl_xuat = res.body.sum_sl_xuat;
          this.sum_gia_tri_xuat = res.body.sum_gia_tri_xuat;
          this.sum_ton_cuoi_ky = res.body.sum_ton_cuoi_ky;
          this.sum_gia_tri_cuoi_ky = res.body.sum_gia_tri_cuoi_ky;
          this.sum_sl_kiem_nhap = res.body.sum_sl_kiem_nhap;
          this.sum_sl_kiem_xuat = res.body.sum_sl_kiem_xuat;
          this.sum_sl_nhap_chuyen = res.body.sum_sl_nhap_chuyen;
          this.sum_sl_xuat_chuyen = res.body.sum_sl_xuat_chuyen;
          this.sum_sl_tra_hang = res.body.sum_sl_tra_hang;
        });
      }
    }

    if (typeReport === 'expiration-date') {
      this.isLoadingResults = true;
      this.parcelSer.getListExpiration(this.parcelFilter).subscribe(res => {
        this.dataSource = res.body;
        let stt = 0;
        this.dataSource.forEach(elementData => {
          stt++;
          elementData.stt = stt;
        });
        this.reloadFilter(res);
        // const url = this.service.getApiUrlReportSale(this.apiFilter);
        this.isLoadingResults = false;
      });

      if (summary) {
        this.parcelSer.getSummaryExpiration(this.parcelFilter).subscribe(res => {
          this.sum_expiration = res.body;
        });
      }

    }

    if (typeReport === 'supplier') {
      this.isLoadingResults = true;
      this.service.getListReportSupplier(this.apiFilter).subscribe(res => {
        this.dataSource = res.body.data;
        let stt = 0;
        this.dataSource.forEach(elementData => {
          stt++;
          elementData.stt = stt;
          this.sum_supplier_total_import = Number(res.body['sum_supplier_total_import']);
          this.sum_supplier_total_value_import = Number(res.body['sum_supplier_total_value_import']);
          this.sum_supplier_total_return = Number(res.body['sum_supplier_total_return']);
          this.sum_supplier_total_value_return = Number(res.body['sum_supplier_total_value_return']);
          this.sum_supplier_value_pure = Number(res.body['sum_supplier_value_pure']);
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
    const obj = {
      'typeReport': this.reportType.controls['type'].value
    };
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
      if (!date.date_from && !date.date_to) {
        this.titleTimeChoose = this.convertDate(new Date()) + ' - ' + this.convertDate(new Date());

      } else {
        this.titleTimeChoose = this.convertDate(date_from) + ' - ' + this.convertDate(date_to);
      }
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
    this.timeExpireFilter = this.fb.group({
      typeTime: [
        'next_3_month'
      ],
    });

    this.reportType = this.fb.group({
      type: [this.tab]
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
    this.tab = this.route.snapshot.paramMap.get('tab');
    if (this.tab === null) {
      this.tab = 'sale';
    }
    this.buildFromTimeFilter();
    this.statusProductFilter = this.fb.group({
      status: [
        [10, 9]
      ],
    });

    this.parcelFilter = this.buildFilterExpiration();
    this.loadColumns(this.tab);

    this.reportType.valueChanges.subscribe(res => {
      this.loadColumns(res.type);
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

  loadColumns(type) {
    if (type === 'sale') {
      this.displayedColumns = ['#', 'product_no', 'product_name',
        'sl_ban', 'doanh_thu', 'sl_tra', 'gia_tri_tra', 'doanh_thu_thuan'];
      this.columnsToDisplay = ['#', 'product_no', 'product_name',
        'sl_ban', 'doanh_thu', 'sl_tra', 'gia_tri_tra', 'doanh_thu_thuan'];
      this.second_columnsToDisplay = ['second_#', 'second_product_no', 'second_product_name',
        'second_sl_ban', 'second_doanh_thu', 'second_sl_tra', 'second_gia_tri_tra', 'second_doanh_thu_thuan'];
    }
    if (type === 'profit') {
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
    if (type === 'stock') {
      this.displayedColumns = ['#', 'product_no', 'product_name',
        'stock_so_luong', 'stock_gia_ban', 'stock_gia_tri_ban', 'stock_gia_von', 'stock_gia_tri_kho'];
      this.columnsToDisplay = ['#', 'product_no', 'product_name',
        'stock_so_luong', 'stock_gia_ban', 'stock_gia_tri_ban', 'stock_gia_von', 'stock_gia_tri_kho'];
      this.second_columnsToDisplay = ['second_#', 'second_product_no', 'second_product_name',
        'second_stock_so_luong', 'second_stock_gia_ban', 'second_stock_gia_tri_ban', 'second_stock_gia_von', 'second_stock_gia_tri_kho'];
    }

    if (type === 'export-import') {
      this.displayedColumns = ['#', 'product_no', 'product_name', 'ton_dau_ky',
        'gia_tri_dau_ky', 'sl_nhap', 'gia_tri_nhap', 'sl_xuat', 'gia_tri_xuat', 'ton_cuoi_ky', 'gia_tri_cuoi_ky'];
      this.columnsToDisplay = ['#', 'product_no', 'product_name', 'ton_dau_ky',
        'gia_tri_dau_ky', 'sl_nhap', 'gia_tri_nhap', 'sl_xuat', 'gia_tri_xuat', 'ton_cuoi_ky', 'gia_tri_cuoi_ky'];
      this.second_columnsToDisplay = ['second_#', 'second_product_no', 'second_product_name',
        'second_ton_dau_ky', 'second_gia_tri_dau_ky', 'second_sl_nhap', 'second_gia_tri_nhap', 'second_sl_xuat',
        'second_gia_tri_xuat', 'second_ton_cuoi_ky', 'second_gia_tri_cuoi_ky'];
    }

    if (type === 'export-import-detail') {
      this.displayedColumns = ['#', 'product_no', 'product_name', 'ton_dau_ky',
        'gia_tri_dau_ky', 'nhap_ncc', 'nhap_kiem', 'nhap_tra_hang', 'nhap_chuyen', '' +
        'xuat_ban', 'xuat_kiem', 'xuat_chuyen',
        'ton_cuoi_ky', 'gia_tri_cuoi_ky'];
      this.columnsToDisplay = ['#', 'product_no', 'product_name', 'ton_dau_ky',
        'gia_tri_dau_ky', 'nhap_ncc', 'nhap_kiem', 'nhap_tra_hang', 'nhap_chuyen',
        'xuat_ban', 'xuat_kiem', 'xuat_chuyen',
        'ton_cuoi_ky', 'gia_tri_cuoi_ky'];
      this.second_columnsToDisplay = ['second_#', 'second_product_no', 'second_product_name',
        'second_ton_dau_ky', 'second_gia_tri_dau_ky',
        'second_nhap_ncc', 'second_nhap_kiem', 'second_nhap_tra_hang', 'second_nhap_chuyen',
        'second_xuat_ban', 'second_xuat_kiem', 'second_xuat_chuyen',
        'second_ton_cuoi_ky', 'second_gia_tri_cuoi_ky'];
    }

    if (type === 'expiration-date') {
      this.displayedColumns = ['#', 'warehouse_product_no', 'warehouse_product_name', 'warehouse_product_parcel_no',
        'warehouse_product_parcel_expiration', 'expiration_day_exits', 'warehouse_product_parcel_quantity_of_stock'];
      this.columnsToDisplay = ['#', 'warehouse_product_no', 'warehouse_product_name', 'warehouse_product_parcel_no',
        'warehouse_product_parcel_expiration', 'warehouse_product_parcel_day_exits', 'warehouse_product_parcel_quantity_of_stock'];
      this.second_columnsToDisplay = ['second_warehouse_product_parcel_quantity_of_stock'];
    }

    if (type === 'sale-staff') {
      this.displayedColumns = ['#', 'product_no', 'product_name', 'total_staff_invoice', 'total_staff_return',
        'sl_ban', 'doanh_thu', 'sl_tra', 'gia_tri_tra', 'doanh_thu_thuan'];
      this.columnsToDisplay = ['#', 'product_no', 'product_name', 'total_staff_invoice', 'total_staff_return',
        'sl_ban', 'doanh_thu', 'sl_tra', 'gia_tri_tra', 'doanh_thu_thuan'];
      this.second_columnsToDisplay = ['second_#', 'second_product_no', 'second_product_name', 'second_total_staff_invoice', 'second_total_staff_return',
        'second_sl_ban', 'second_doanh_thu', 'second_sl_tra', 'second_gia_tri_tra', 'second_doanh_thu_thuan'];
    }

    if (type === 'supplier') {
      this.displayedColumns = ['#', 'product_no', 'product_name', 'supplier_total', 'supplier_total_import',
        'supplier_total_value_import', 'supplier_total_return', 'supplier_total_value_return', 'supplier_value_pure'];
      this.columnsToDisplay = ['#', 'product_no', 'product_name', 'supplier_total', 'supplier_total_import',
        'supplier_total_value_import', 'supplier_total_return', 'supplier_total_value_return', 'supplier_value_pure'];
      this.second_columnsToDisplay = ['second_#', 'second_product_no', 'second_product_name', 'second_supplier_total', 'second_supplier_total_import',
        'second_supplier_total_value_import', 'second_supplier_total_return', 'second_sum_supplier_total_value_return', 'second_supplier_value_pure'];
    }

    if (type === 'customer') {
      this.displayedColumns = ['#', 'product_no', 'product_name', 'total_customer',
        'sl_ban', 'doanh_thu', 'sl_tra', 'gia_tri_tra', 'doanh_thu_thuan'];
      this.columnsToDisplay = ['#', 'product_no', 'product_name', 'total_customer',
        'sl_ban', 'doanh_thu', 'sl_tra', 'gia_tri_tra', 'doanh_thu_thuan'];
      this.second_columnsToDisplay = ['second_#', 'second_product_no', 'second_product_name', 'second_total_customer',
        'second_sl_ban', 'second_doanh_thu', 'second_sl_tra', 'second_gia_tri_tra', 'second_doanh_thu_thuan'];
    }

    this.apiFilter = this.buildFilterFromParams();
    this.loadData();
  }

  reloadFilter(res) {
    this.pageTotalCount = Number(res.headers.get('X-Pagination-Total-Count'));
    this.pageSize = Number(res.headers.get('X-Pagination-Per-Page'));
    this.page = Number(res.headers.get('X-Pagination-Current-Page'));
    this.apiFilter.pageSize = this.pageSize;
    this.apiFilter.page = this.page;
    this.parcelFilter.pageSize = this.pageSize;
    this.parcelFilter.page = this.page;

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
    this.isLoadingResults = true;
    const typeReport = this.reportType.controls['type'].value;
    if (typeReport === 'sale' || typeReport === 'profit' || typeReport === 'sale-staff' || typeReport === 'customer') {
      const _apiFilter = this.apiFilter;
      _apiFilter.export = true;
      _apiFilter.type_report = typeReport;
      this.service.getListReportSale(_apiFilter).subscribe(res => {
        const url = this.service.downloadFileExcel(typeReport);
        window.location.href = url;
        this.isLoadingResults = false;
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
        this.isLoadingResults = false;
      });
    }

    if (typeReport === 'export-import') {
      const _apiFilter = this.apiFilter;
      _apiFilter.export = true;
      _apiFilter.type_report = typeReport;
      this.service.exportExcel(_apiFilter).subscribe(res => {
        const url = this.service.downloadFileExcel(typeReport);
        window.location.href = url;
        this.isLoadingResults = false;
      });
    }

    if (typeReport === 'export-import-detail') {
      const _apiFilter = this.apiFilter;
      _apiFilter.export = true;
      _apiFilter.type_report = typeReport;
      this.service.exportExcel(_apiFilter).subscribe(res => {
        const url = this.service.downloadFileExcel(typeReport);
        window.location.href = url;
        this.isLoadingResults = false;
      });
    }

    if (typeReport === 'expiration-date') {
      this.notifySer.notify('warning', 'Chưa hỗ trợ xuât file exel');
      return;
    }

    if (typeReport === 'supplier') {
      const _apiFilter = this.apiFilter;
      _apiFilter.export = true;
      _apiFilter.type_report = typeReport;
      this.service.exportExcel(_apiFilter).subscribe(res => {
        const url = this.service.downloadFileExcel(typeReport);
        window.location.href = url;
        this.isLoadingResults = false;
      });
    }

  }

  calculateDiff(dateSent) {
    const currentDate = new Date();
    dateSent = new Date(dateSent);
    const days = Math.floor((Date.UTC(dateSent.getFullYear(), dateSent.getMonth(), dateSent.getDate()) - Date.UTC(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate())) / (1000 * 60 * 60 * 24));
    if (days >= 0) {
      return days + 1;
    }

    return 'Hết hạn';
  }

  getSupplierTotalPure(totalImport, totalReturn) {
    if (totalImport && totalReturn) {
      return Number(totalImport) + Number(totalReturn);
    } else if (totalImport && !totalReturn) {
      return Number(totalImport);
    } else if (!totalImport && totalReturn) {
      return Number(totalReturn);
    } else {
      return 0;
    }
  }

  onTimeChange() {
    this.parcelFilter.timeSelect = this.timeExpireFilter.controls['typeTime'].value;
    this.loadData(true);
  }
}
