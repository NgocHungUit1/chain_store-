import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { FormControl, FormGroup, FormBuilder } from '@angular/forms';
import { NotifierService } from 'angular-notifier';
import { ListComponentBase } from '../../shared/base';
import { MatDialog } from '@angular/material/dialog';
import { DatetimeDefaultFilterDialogComponent } from '../components/datetime-default-filter-dialog/datetime-default-filter-dialog.component';
import { DatetimeChooseFilterDialogComponent } from '../components/datetime-choose-filter-dialog/datetime-choose-filter-dialog.component';
import { HygieneLogbookService } from '../services/hygiene-logbook.service';
import { HygieneLogbookCreateModalComponent } from './hygiene-logbook-create-modal/hygiene-logbook-create-modal.component';
import { HygieneLogbookDetailModalComponent } from './hygiene-logbook-detail-modal/hygiene-logbook-detail-modal.component';
import { PopupConfirmDialogComponent } from '../../common/popup-confirm-dialog/popup-confirm-dialog.component';

@Component({
  selector: 'app-follow-book-hygiene',
  templateUrl: './follow-book-hygiene.component.html',
  styleUrls: ['../shared/follow-book.component.scss', './follow-book-hygiene.component.scss']
})
export class FollowBookHygieneComponent extends ListComponentBase implements OnInit {
  displayedColumns = ['stt', 'month', 'status', 'actions'];
  columnsToDisplay = ['stt', 'month', 'status', 'actions'];
  columnsHeader = {
    'stt': 'STT',
    'month': 'Tháng',
    'status': 'Trạng thái',
    'actions': 'Hành động'
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
    month: ''
  };

  constructor(
    private dialog: MatDialog,
    private fb: FormBuilder,
    private notifyService: NotifierService,
    private hygieneLogbookService: HygieneLogbookService
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

    if (this.currentDateFilter && this.currentDateFilter.month) {
      filter.month = this.currentDateFilter.month;
    }

    return filter;
  }

  loadData(): void {
    this.isLoadingResults = true;

    this.hygieneLogbookService.getHygieneLogbooks(this.apiFilter).subscribe(
      response => {
        if (response && response.body) {
          this.dataSource = response.body.map((item: any, index: number) => {
            return {
              id: item.id,
              stt: (this.page - 1) * this.pageSize + index + 1,
              month: item.month,
              status: item.status,
              statusName: this.getStatusText(item.status),
              details: item.details || []
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

        // Tạo dữ liệu mẫu khi API chưa sẵn sàng
        this.createDummyData();
      }
    );
  }

  getStatusText(status: number): string {
    switch (status) {
      case 1:
        return 'Hoàn thành';
      case 0:
        return 'Chưa hoàn thành';
      default:
        return 'Không xác định';
    }
  }

  createDummyData(): void {
    this.dataSource = [
      {
        id: 1,
        stt: 1,
        month: '04/2025',
        status: 1,
        statusName: 'Hoàn thành'
      }
    ];
    this.totalItems = 1;
  }

  initDateFilter() {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth() + 1;

    this.currentDateFilter = {
      month: `${year}-${month.toString().padStart(2, '0')}`
    };
  }

  formatMonthYear(month: string): string {
    if (!month) return '';

    const parts = month.split('-');
    if (parts.length !== 2) return month;

    return `${parts[1]}/${parts[0]}`;
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
        // Lấy tháng đầu tiên của khoảng thời gian
        const date = new Date(result.date_from);
        const year = date.getFullYear();
        const month = date.getMonth() + 1;

        this.currentDateFilter.month = `${year}-${month.toString().padStart(2, '0')}`;
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
      data: {
        date_from: this.currentDateFilter.month ? `${this.currentDateFilter.month}-01` : '',
        date_to: this.currentDateFilter.month ? `${this.currentDateFilter.month}-28` : ''
      },
      panelClass: 'date-filter-dialog'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // Lấy tháng từ date_from
        const date = new Date(result.date_from);
        const year = date.getFullYear();
        const month = date.getMonth() + 1;

        this.currentDateFilter.month = `${year}-${month.toString().padStart(2, '0')}`;
        this.titleTimeChoose = result.title || `Tháng ${month}/${year}`;
        this.timeFilter.patchValue({ typeTime: 'choose' });
        this.apiFilter = this.buildFilterFromParams();
        this.loadData();
      }
    });
  }

  radioTimeChange(event: any) {
    if (this.timeFilter.get('typeTime').value === 'choose') {
      if (this.currentDateFilter.month) {
        const parts = this.currentDateFilter.month.split('-');
        this.titleTimeChoose = `Tháng ${parts[1]}/${parts[0]}`;
      } else {
        this.titleTimeChoose = 'Lựa chọn khác';
      }
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

  openCreateModal(): void {
    // Lấy tháng hiện tại để truyền vào modal
    const currentMonth = this.currentDateFilter.month;

    const dialogRef = this.dialog.open(HygieneLogbookCreateModalComponent, {
      width: '1200px',
      disableClose: true,
      data: { month: currentMonth }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadData();
      }
    });
  }

  openDetailModal(row: any): void {
    this.hygieneLogbookService.getHygieneLogbookDetail(row.id).subscribe(
      response => {
        const dialogRef = this.dialog.open(HygieneLogbookDetailModalComponent, {
          width: '1200px',
          data: { logbook: response }
        });
      },
      error => {
        this.notifyService.notify('error', 'Có lỗi xảy ra khi tải chi tiết');
      }
    );
  }

  openEditDialog(logbook: any): void {
    // Đảm bảo có id
    if (!logbook || !logbook.id) {
      this.notifyService.notify('error', 'Không tìm thấy ID phiếu');
      return;
    }

    // Gọi API để lấy dữ liệu đầy đủ
    this.hygieneLogbookService.getHygieneLogbookDetail(logbook.id).subscribe(
      (fullData) => {
        // Mở dialog với dữ liệu đầy đủ
        const dialogRef = this.dialog.open(HygieneLogbookCreateModalComponent, {
          width: '90%',
          data: {
            ...fullData,
            isEdit: true
          }
        });

        dialogRef.afterClosed().subscribe(result => {
          if (result) {
            this.loadData();
          }
        });
      },
      (error) => {
        console.error('Error fetching detail data:', error);
        this.notifyService.notify('error', 'Không thể tải dữ liệu phiếu vệ sinh');
      }
    );
  }

  exportToExcel(row: any): void {
    this.isLoadingResults = true;

    const filter = {
      id: row.id
    };

    this.hygieneLogbookService.exportToExcel(filter).subscribe(
      (response: any) => {
        const blob = new Blob([response], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `so-theo-doi-ve-sinh-${row.month.replace('/', '-')}.xlsx`;
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

  deleteHygieneLogbook(row: any): void {
    const obj = {
      action: 'Delete',
      title: 'Xác nhận xóa phiếu theo dõi vệ sinh đã chọn.',
    };

    const dialogRef = this.dialog.open(PopupConfirmDialogComponent, {
      data: obj,
      width: '30%',
      minHeight: '60%'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result?.event === 'confirm') {
        this.hygieneLogbookService.deleteHygieneLogbook(row.id).subscribe({
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

  editItem(item: any): void {
    this.openEditDialog(item);
  }

  openEditModal(logbook: any): void {
    this.openEditDialog(logbook);
  }
}
