import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { ProductService } from '../services/product.service';
import { QualityControlCreateModalComponent } from './quality-control-create-modal/quality-control-create-modal.component';
import { QualityCheck, QualityCheckFilter } from '../models/quality-check.interface';
import { FormControl, FormGroup, FormBuilder } from '@angular/forms';
import { NotifierService } from 'angular-notifier';
import { ListComponentBase } from '../../shared/base';
import { ActivatedRoute } from '@angular/router';
import { QualityControlDetailModalComponent } from './quality-control-detail-modal/quality-control-detail-modal.component';
import { PopupConfirmDialogComponent } from '../../common/popup-confirm-dialog/popup-confirm-dialog.component';
import { debounceTime } from 'rxjs/operators';
import * as moment from 'moment';
import { DateFilter } from '../../invoice/invoice.model';
import { DatetimeDefaultFilterDialogComponent } from '../components/datetime-default-filter-dialog/datetime-default-filter-dialog.component';
import { DatetimeChooseFilterDialogComponent } from '../components/datetime-choose-filter-dialog/datetime-choose-filter-dialog.component';

@Component({
  selector: 'app-follow-book-quality-control',
  templateUrl: './follow-book-quality-control.component.html',
  styleUrls: ['../shared/follow-book.component.scss', './follow-book-quality-control.component.scss']
})
export class FollowBookQualityControlComponent extends ListComponentBase implements OnInit {

  displayedColumns = ['stt', 'no', 'date', 'reason', 'note', 'status', 'actions'];
  columnsToDisplay = ['stt', 'no', 'date', 'reason', 'note', 'status', 'actions'];
  columnsHeader = {
    'stt': 'STT',
    'no': 'Tên sổ',
    'date': 'Ngày thực hiện',
    'reason': 'Lý do',
    'note': 'Ghi chú',
    'status': 'Trạng thái',
    'actions': 'Hành động'
  };

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  isLoadingResults = false;
  dataSource = [];
  apiFilter: QualityCheckFilter;

  // Search functionality
  searchForm = new FormControl();

  // Filter date từ base
  timeFilter: FormGroup;
  titleTimeDefault = 'Tháng này';
  titleTimeChoose = 'Lựa chọn khác';
  currentDateFilter: DateFilter;

  constructor(
    private dialog: MatDialog,
    private route: ActivatedRoute,
    private productService: ProductService,
    private fb: FormBuilder,
    private notifyService: NotifierService
  ) {
    super();
  }

  ngOnInit(): void {
    this.initDateFilter();
    this.buildFrom();
    this.apiFilter = this.buildFilterFromParams();
    this.loadData();

    // Setup search functionality
    this.searchForm.valueChanges.pipe(debounceTime(300)).subscribe(value => {
      if (value !== '') {
        this.apiFilter = this.buildFilterFromParams();
        this.apiFilter.search_string = value;
        this.loadData();
      } else {
        this.apiFilter = this.buildFilterFromParams();
        this.loadData();
      }
    });
  }

  buildFrom() {
    this.timeFilter = this.fb.group({
      typeTime: [
        'default'
      ],
    });
  }

  buildFilterFromParams(): QualityCheckFilter {
    const filter = new QualityCheckFilter();
    filter.page = this.page || 1;
    filter.pageSize = this.pageSize || 10;
    filter.expand = 'total';
    filter.status = 10;

    // Thêm filter date - CHỈ khi không bỏ qua filter
      filter.date_from = this.currentDateFilter.date_from;
      filter.date_to = this.currentDateFilter.date_to;

    return filter;
  }

  loadData(summary = true): void {
    this.isLoadingResults = true;

    this.productService.getQualityChecks(this.apiFilter).subscribe(res => {
      if (res && res.body) {
        this.dataSource = res.body;
        let stt = 0;
        this.dataSource.forEach(item => {
          stt++;
          item.stt = this.pageSize * (this.page - 1) + stt;
        });

        this.reloadFilter(res);
      }
      this.isLoadingResults = false;
    }, error => {
      console.error('Error loading data:', error);
      this.isLoadingResults = false;
    });
  }

  getStatusText(status: number): string {
    return status === 10 ? 'Hoàn thành' : 'Chưa hoàn thành';
  }

  refreshData(): void {
    this.loadData();
  }

  // Date filter methods
  initDateFilter() {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    const first = new Date(year, month, 1);

    this.currentDateFilter = {
      date_from: this.formatDate(first),
      date_to: this.formatDate(today),
    };

    this.titleTimeDefault = 'Tháng này';
    this.titleTimeChoose = 'Lựa chọn khác';
  }

  formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  convertDate(date: Date) {
    const month = date.getMonth() + 1;
    return date.getDate() + '/' + month + '/' + date.getFullYear();
  }

  openTimeDefault() {
    const dialogRef = this.dialog.open(DatetimeDefaultFilterDialogComponent, {
      width: '600px',
      position: { top: '100px' },
      panelClass: 'simple-dialog'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.currentDateFilter = result;
        this.titleTimeDefault = result.title;

        this.timeFilter.patchValue({
          typeTime: 'default',
        });

        this.apiFilter = this.buildFilterFromParams();
        this.loadData();
      }
    });
  }

  openTimeChoose() {
    const dialogRef = this.dialog.open(DatetimeChooseFilterDialogComponent, {
      width: '350px',
      position: { top: '100px' },
      data: this.currentDateFilter,
      panelClass: 'simple-dialog'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.currentDateFilter = result;
        this.titleTimeChoose = result.title;

        this.timeFilter.patchValue({
          typeTime: 'choose',
        });

        this.apiFilter = this.buildFilterFromParams();
        this.loadData();
      }
    });
  }

  radioTimeChange(event: Event) {
    if (this.timeFilter.controls['typeTime'].value === 'choose') {
      const date_from = new Date(this.currentDateFilter.date_from);
      const date_to = new Date(this.currentDateFilter.date_to);
      this.titleTimeChoose = this.convertDate(date_from) + ' - ' + this.convertDate(date_to);
    } else {
      this.titleTimeChoose = 'Lựa chọn khác';
    }
  }

  openCreateModal(): void {
    const dialogRef = this.dialog.open(QualityControlCreateModalComponent, {
      width: '100vw',
      height: '100vh',
      maxWidth: '100vw',
      maxHeight: '100vh',
      panelClass: 'full-screen-modal'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.refreshData();
      }
    });
  }

  openDetailModal(row: any): void {
    this.dialog.open(QualityControlDetailModalComponent, {
      width: '100vw',
      height: '100vh',
      maxWidth: '100vw',
      maxHeight: '100vh',
      panelClass: 'full-screen-modal',
      data: { id: row.id }
    });
  }

  openEditModal(row: any): void {
    // Hiển thị loading
    this.isLoadingResults = true;

    // Gọi API để lấy chi tiết phiếu kiểm soát chất lượng
    this.productService.getQualityCheckDetail(row.id).subscribe({
      next: (response) => {
        // Mở modal với dữ liệu chi tiết
        const dialogRef = this.dialog.open(QualityControlCreateModalComponent, {
          width: '100vw',
          height: '100vh',
          maxWidth: '100vw',
          maxHeight: '100vh',
          panelClass: 'full-screen-modal',
          data: {
            isEdit: true,
            qualityCheck: row,
            qualityCheckDetail: response
          }
        });

        dialogRef.afterClosed().subscribe(result => {
          if (result) {
            this.refreshData();
          }
        });

        this.isLoadingResults = false;
      },
      error: (error) => {
        console.error('Error loading quality control details:', error);
        this.notifyService.notify('error', 'Không thể tải chi tiết phiếu kiểm soát chất lượng');
        this.isLoadingResults = false;
      }
    });
  }

  deleteQualityCheck(row: any): void {
    const obj = {
      action: 'Delete',
      title: 'Xác nhận xóa danh sách đã chọn.',
      content: 'Thông tin sản phẩm đã xác nhận hoàn thành trước đó sẽ được hệ thống tạo thẻ kho xóa đi!'
    };

    const dialogRef = this.dialog.open(PopupConfirmDialogComponent, {
      data: obj,
      width: '30%',
      minHeight: '60%'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result?.event === 'confirm') {
        this.productService.deleteQualityControl(row.id).subscribe({
          next: () => {
            this.notifyService.notify('success', 'Xóa thành công');
            this.refreshData();
          },
          error: () => {
            this.notifyService.notify('error', 'Có lỗi xảy ra khi xóa');
          }
        });
      }
    });
  }

  exportToExcel(row: any): void {
    this.isLoadingResults = true;
    this.productService.exportQualityControlToExcel(row.id).subscribe({
      next: (response) => {
        const blob = new Blob([response], { type: 'application/vnd.ms-excel' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `quality-control-${row.id}.xlsx`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        this.notifyService.notify('success', 'Xuất file thành công');
      },
      error: (error) => {
        console.error('Error exporting file:', error);
        this.notifyService.notify('error', 'Có lỗi xảy ra khi xuất file');
      },
      complete: () => {
        this.isLoadingResults = false;
      }
    });
  }
}




