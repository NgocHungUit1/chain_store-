import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { FormControl, FormGroup, FormBuilder } from '@angular/forms';
import { NotifierService } from 'angular-notifier';
import { ListComponentBase } from '../../shared/base';
import { ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { DatetimeDefaultFilterDialogComponent } from '../components/datetime-default-filter-dialog/datetime-default-filter-dialog.component';
import { DatetimeChooseFilterDialogComponent } from '../components/datetime-choose-filter-dialog/datetime-choose-filter-dialog.component';
import { InventoryTrackingService } from '../services/inventory-tracking.service';
import * as XLSX from 'xlsx';
import { InventoryDetailModalComponent } from '../components/inventory-detail-modal/inventory-detail-modal.component';

@Component({
  selector: 'app-follow-book-inventory-tracking',
  templateUrl: './follow-book-inventory-tracking.component.html',
  styleUrls: ['../shared/follow-book.component.scss', './follow-book-inventory-tracking.component.scss']
})
export class FollowBookInventoryTrackingComponent extends ListComponentBase implements OnInit {
  // Danh sách gộp theo MÃ (1 dòng/sản phẩm) -> bỏ cột HSD ở ngoài (1 mã nhiều lô nhiều hạn);
  // hạn dùng theo từng lô xem ở modal chi tiết.
  displayedColumns = ['stt', 'product_info', 'unit', 'final_stock', 'actions'];
  columnsToDisplay = ['stt', 'product_info', 'unit', 'final_stock', 'actions'];
  columnsHeader = {
    'stt': 'STT',
    'product_info': 'Mã/Tên sản phẩm',
    'unit': 'Đơn vị',
    'final_stock': 'Tồn cuối',
    'actions': 'Thao tác'
  };

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  isLoadingResults = false;
  dataSource = [];
  totalItems = 0;
  apiFilter: any = {};

  searchForm = new FormControl();
  timeFilter: FormGroup;
  titleTimeDefault = 'Tháng này';
  titleTimeChoose = 'Lựa chọn khác';
  currentDateFilter: any = {
    date_from: '',
    date_to: ''
  };

  constructor(
    private dialog: MatDialog,
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private notifyService: NotifierService,
    private inventoryService: InventoryTrackingService
  ) {
    super();
  }

  ngOnInit(): void {
    this.initDateFilter();
    this.buildFrom();
    this.apiFilter = this.buildFilterFromParams();
    this.loadData();
  }

  buildFrom() {
    this.timeFilter = this.fb.group({
      typeTime: ['default']
    });
  }

  buildFilterFromParams(): any {
    const filter: any = {};
    filter.page = this.page || 1;
    filter.pageSize = this.pageSize || 10;

    if (this.currentDateFilter) {
      filter.date_from = this.currentDateFilter.date_from;
      filter.date_to = this.currentDateFilter.date_to;
    }

    return filter;
  }

  loadData(): void {
    this.isLoadingResults = true;

    this.inventoryService.getInventoryTrackingList(this.apiFilter).subscribe(
      response => {
        if (response && response.body) {
          this.dataSource = response.body.map((item: any, index: number) => {
            return {
              stt: (this.page - 1) * this.pageSize + index + 1,
              id: item.id,
              date: item.warehouse?.date ? new Date(item.warehouse.date) : null,
              document_no: item.warehouse?.no || '',
              supplier: item.warehouse?.supplier?.name || '',
              product: item.product,
              parcel_no: item.parcel_no,
              expiration_date: item.expiration_date,
              imports: item.quantity_of_stock,
              exports: item.exports || 0,
              final_stock: item.quantity_of_stock - (item.exports || 0)
            };
          });

          if (response.headers.get('X-Pagination-Total-Count')) {
            this.totalItems = parseInt(response.headers.get('X-Pagination-Total-Count'));
          }
        }
        this.isLoadingResults = false;
      },
      error => {
        console.error('Error loading data:', error);
        this.isLoadingResults = false;
        this.notifyService.notify('error', 'Có lỗi xảy ra khi tải dữ liệu');
      }
    );
  }

  initDateFilter() {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    const first = new Date(year, month, 1);

    this.currentDateFilter = {
      date_from: this.formatDate(first),
      date_to: this.formatDate(today)
    };
  }

  formatDate(date: Date | string): string {
    if (!date) return '';

    const dateObj = typeof date === 'string' ? new Date(date) : date;

    if (typeof dateObj.getMonth !== 'function') {
      return '';
    }

    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');

    // Nếu cần sử dụng cho xuất dữ liệu, trả về định dạng tiếng Việt
    if (arguments[1] === 'vi-format') {
      return dateObj.toLocaleDateString('vi-VN');
    }

    // Mặc định trả về định dạng yyyy-mm-dd cho API
    return `${year}-${month}-${day}`;
  }

  openTimeDefault() {
    const dialogRef = this.dialog.open(DatetimeDefaultFilterDialogComponent, {
      width: '550px',
      position: { top: '100px' },
      maxHeight: '80vh',
      panelClass: 'date-filter-dialog'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.currentDateFilter = result;
        this.titleTimeDefault = result.title || 'Tháng này';
        this.timeFilter.patchValue({ typeTime: 'default' });
        this.apiFilter = this.buildFilterFromParams();
        this.loadData();
      }
    });
  }

  openTimeChoose() {
    const dialogRef = this.dialog.open(DatetimeChooseFilterDialogComponent, {
      width: '400px',
      position: { top: '100px' },
      data: this.currentDateFilter,
      panelClass: 'date-filter-dialog'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.currentDateFilter = result;
        this.titleTimeChoose = result.title || (this.convertDate(new Date(result.date_from)) + ' - ' + this.convertDate(new Date(result.date_to)));
        this.timeFilter.patchValue({ typeTime: 'choose' });
        this.apiFilter = this.buildFilterFromParams();
        this.loadData();
      }
    });
  }

  convertDate(date: Date) {
    const month = date.getMonth() + 1;
    return date.getDate() + '/' + month + '/' + date.getFullYear();
  }

  radioTimeChange(event: any) {
    if (this.timeFilter.get('typeTime').value === 'choose') {
      const date_from = new Date(this.currentDateFilter.date_from);
      const date_to = new Date(this.currentDateFilter.date_to);
      this.titleTimeChoose = this.convertDate(date_from) + ' - ' + this.convertDate(date_to);
    } else {
      this.titleTimeChoose = 'Lựa chọn khác';
    }
  }

  refreshData(): void {
    this.loadData();
  }

  onChangePage(event: any): void {
    this.page = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    this.apiFilter = this.buildFilterFromParams();
    this.loadData();
  }

  exportExcel(): void {
    this.isLoadingResults = true;

    this.inventoryService.exportToExcel(this.currentDateFilter).subscribe(
      (response: any) => {
        const blob = new Blob([response], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;

        const dateStr = this.currentDateFilter.date_from ?
          `_${this.currentDateFilter.date_from}_${this.currentDateFilter.date_to}` :
          '';
        link.download = `xuat-nhap-ton-ksdb${dateStr}.xlsx`;

        link.click();
        window.URL.revokeObjectURL(url);
        this.isLoadingResults = false;
        this.notifyService.notify('success', 'Xuất file Excel thành công');
      },
      error => {
        console.error('Error exporting Excel:', error);
        this.isLoadingResults = false;
        this.notifyService.notify('error', 'Có lỗi xảy ra khi xuất file Excel');
      }
    );
  }

  openDetailModal(productId: number): void {
    // Không cần gọi API ở đây nữa, để component modal tự xử lý
    const modalData = {
      productInfo: this.dataSource.find(item => item.product.id === productId)
    };

    // Mở modal với dữ liệu
    const dialogRef = this.dialog.open(InventoryDetailModalComponent, {
      width: '90%',
      maxWidth: '1200px',
      data: modalData,
      panelClass: 'inventory-detail-modal'
    });
  }
}
