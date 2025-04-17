import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { FormControl, FormGroup, FormBuilder } from '@angular/forms';
import { NotifierService } from 'angular-notifier';
import { ListComponentBase } from '../../shared/base';
import { MatDialog } from '@angular/material/dialog';
import { DatetimeDefaultFilterDialogComponent } from '../components/datetime-default-filter-dialog/datetime-default-filter-dialog.component';
import { DatetimeChooseFilterDialogComponent } from '../components/datetime-choose-filter-dialog/datetime-choose-filter-dialog.component';
import { TraineeService } from '../services/trainee.service';
import { TraineeFormDialogComponent } from './trainee-form-dialog/trainee-form-dialog.component';
import { PopupConfirmDialogComponent } from '../../common/popup-confirm-dialog/popup-confirm-dialog.component';

@Component({
  selector: 'app-follow-book-trainee',
  templateUrl: './follow-book-trainee.component.html',
  styleUrls: ['../shared/follow-book.component.scss', './follow-book-trainee.component.scss']
})
export class FollowBookTraineeComponent extends ListComponentBase implements OnInit {
  displayedColumns = ['stt', 'name', 'gender', 'birth_date', 'education_level', 'join_date', 'phone', 'address', 'status', 'actions'];
  columnsToDisplay = ['stt', 'name', 'gender', 'birth_date', 'education_level', 'join_date', 'phone', 'address', 'status', 'actions'];
  columnsHeader = {
    'stt': 'STT',
    'name': 'Họ và tên',
    'gender': 'Giới tính',
    'birth_date': 'Ngày sinh',
    'education_level': 'Trình độ',
    'join_date': 'Ngày vào nhà thuốc',
    'phone': 'Số điện thoại',
    'address': 'Địa chỉ',
    'status': 'Trạng thái',
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
    private fb: FormBuilder,
    private notifyService: NotifierService,
    private traineeService: TraineeService
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

    this.traineeService.getTraineeList(this.apiFilter).subscribe(
      response => {
        if (response && response.body) {
          this.dataSource = response.body.map((trainee: any, index: number) => {
            return {
              id: trainee.id,
              stt: (this.page - 1) * this.pageSize + index + 1,
              name: trainee.name,
              gender: trainee.gender === 0 ? 'Nam' : 'Nữ',
              birth_date: trainee.birth_date,
              education_level: trainee.education_level,
              join_date: trainee.join_date,
              phone: trainee.phone,
              email: trainee.email,
              address: trainee.address,
              status: trainee.status,
              statusName: trainee.status === 1 ? 'Đang làm việc' : 'Đã nghỉ việc',
              details: trainee.details || []
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

  formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
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
        this.currentDateFilter.date_from = result.date_from;
        this.currentDateFilter.date_to = result.date_to;
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
        date_from: this.currentDateFilter.date_from,
        date_to: this.currentDateFilter.date_to
      },
      panelClass: 'date-filter-dialog'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.currentDateFilter.date_from = result.date_from;
        this.currentDateFilter.date_to = result.date_to;
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

    this.traineeService.exportToExcel(this.currentDateFilter).subscribe(
      (response: any) => {
        const blob = new Blob([response], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;

        // Đặt tên file với ngày tháng
        const dateStr = this.currentDateFilter.date_from ?
          `_${this.currentDateFilter.date_from}_${this.currentDateFilter.date_to}` :
          '';
        link.download = `so-theo-doi-dao-tao${dateStr}.xlsx`;

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

  openAddDialog(): void {
    const dialogRef = this.dialog.open(TraineeFormDialogComponent, {
      width: '1200px',
      disableClose: true,
      data: { isEdit: false }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadData();
      }
    });
  }

  openEditDialog(trainee: any): void {
    this.isLoadingResults = true;

    // Gọi API để lấy chi tiết học viên bao gồm các thông tin đào tạo
    this.traineeService.getTraineeDetail(trainee.id).subscribe(
      (response) => {
        this.isLoadingResults = false;

        // Mở dialog form với dữ liệu chi tiết đã lấy được
        const dialogRef = this.dialog.open(TraineeFormDialogComponent, {
          width: '1200px',
          disableClose: true,
          data: { isEdit: true, trainee: response }
        });

        dialogRef.afterClosed().subscribe(result => {
          if (result) {
            this.loadData();
          }
        });
      },
      (error) => {
        this.isLoadingResults = false;
        console.error('Error loading trainee details:', error);
        this.notifyService.notify('error', 'Có lỗi xảy ra khi tải thông tin học viên');
      }
    );
  }

  confirmDelete(trainee: any): void {
    const obj = {
      action: 'Delete',
      title: 'Xác nhận xóa học viên đã chọn.',
    };

    const dialogRef = this.dialog.open(PopupConfirmDialogComponent, {
      data: obj,
      width: '30%',
      minHeight: '60%'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result?.event === 'confirm') {
        this.deleteTrainee(trainee.id);
      }
    });
  }

  deleteTrainee(id: number): void {
    this.isLoadingResults = true;

    this.traineeService.deleteTrainee(id).subscribe({
      next: () => {
        this.notifyService.notify('success', 'Xóa học viên thành công');
        this.loadData();
      },
      error: (error) => {
        console.error('Error deleting trainee:', error);
        this.isLoadingResults = false;
        this.notifyService.notify('error', 'Có lỗi xảy ra khi xóa học viên');
      }
    });
  }

  openDetailDialog(trainee: any): void {
    this.isLoadingResults = true;

    // Gọi API để lấy chi tiết học viên
    this.traineeService.getTraineeDetail(trainee.id).subscribe(
      (response) => {
        this.isLoadingResults = false;

        // Mở dialog form ở chế độ readonly/detail
        const dialogRef = this.dialog.open(TraineeFormDialogComponent, {
          width: '1200px',
          data: { isEdit: false, isDetail: true, trainee: response }
        });
      },
      (error) => {
        this.isLoadingResults = false;
        console.error('Error loading trainee details:', error);
        this.notifyService.notify('error', 'Có lỗi xảy ra khi tải thông tin học viên');
      }
    );
  }

  exportExcelForTrainee(trainee: any): void {
    this.isLoadingResults = true;

    // Thêm ID của học viên vào filter
    const filter = {
      trainee_id: trainee.id
    };

    this.traineeService.exportToExcel(filter).subscribe(
      (response: any) => {
        const blob = new Blob([response], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `dao-tao-hoc-vien-${trainee.name}.xlsx`;
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
}
