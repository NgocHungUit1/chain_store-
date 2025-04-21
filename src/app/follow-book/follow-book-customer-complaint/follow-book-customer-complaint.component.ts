import { Component, OnInit, ViewChild, Inject } from '@angular/core';
import { MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { FormControl, FormGroup, FormBuilder } from '@angular/forms';
import { NotifierService } from 'angular-notifier';
import { ListComponentBase } from '../../shared/base';
import { ActivatedRoute } from '@angular/router';
import { debounceTime } from 'rxjs/operators';
import { DatetimeDefaultFilterDialogComponent } from '../components/datetime-default-filter-dialog/datetime-default-filter-dialog.component';
import { DatetimeChooseFilterDialogComponent } from '../components/datetime-choose-filter-dialog/datetime-choose-filter-dialog.component';
import { CustomerComplaintService } from '../services/customer-complaint.service';
import { CustomerComplaintFormDialogComponent } from './customer-complaint-form-dialog/customer-complaint-form-dialog.component';

@Component({
  selector: 'app-follow-book-customer-complaint',
  templateUrl: './follow-book-customer-complaint.component.html',
  styleUrls: ['../shared/follow-book.component.scss', './follow-book-customer-complaint.component.scss']
})
export class FollowBookCustomerComplaintComponent extends ListComponentBase implements OnInit {
  displayedColumns = ['stt', 'complaint_date', 'customer_name', 'address', 'complaint_content', 'recipient', 'resolution', 'status', 'actions'];
  columnsToDisplay = ['stt', 'complaint_date', 'customer_name', 'address', 'complaint_content', 'recipient', 'resolution', 'status', 'actions'];
  columnsHeader = {
    'stt': 'STT',
    'complaint_date': 'Ngày khiếu nại',
    'customer_name': 'Khách hàng',
    'address': 'Địa chỉ',
    'complaint_content': 'Nội dung khiếu nại',
    'recipient': 'Người tiếp nhận',
    'resolution': 'Cách giải quyết',
    'status': 'Trạng thái',
    'actions': 'Thao tác'
  };

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  isLoadingResults = false;
  dataSource = [];
  apiFilter: any = {};

  searchForm = new FormControl();
  timeFilter: FormGroup;
  titleTimeDefault = 'Tháng này';
  titleTimeChoose = 'Lựa chọn khác';
  currentDateFilter: any = {
    date_from: '',
    date_to: ''
  };

  page = 1;
  totalItems = 0;
  pageSize = 10;

  constructor(
    private dialog: MatDialog,
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private notifyService: NotifierService,
    private customerComplaintService: CustomerComplaintService
  ) {
    super();
    this.pageSize = 10;
  }

  ngOnInit(): void {
    this.initDateFilter();
    this.buildFrom();
    this.apiFilter = this.buildFilterFromParams();
    this.loadData();

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
      typeTime: ['default']
    });
  }

  buildFilterFromParams(): any {
    const filter: any = {};
    filter.page = this.page || 1;
    filter.pageSize = this.pageSize || 10;
    filter.expand = 'customer,createdBy,statusName';

    if (this.currentDateFilter) {
      filter.date_from = this.currentDateFilter.date_from;
      filter.date_to = this.currentDateFilter.date_to;
    }

    return filter;
  }

  loadData(): void {
    this.isLoadingResults = true;

    this.customerComplaintService.getCustomerComplaintList(this.apiFilter).subscribe(
      response => {
        if (response && response.body) {
          this.dataSource = response.body.map((complaint: any, index: number) => {
            let customerName = '';
            let phoneNumber = '';
            let addressValue = '';

            if (complaint.customer) {
              customerName = complaint.customer.name || '';
              phoneNumber = complaint.customer.phone || '';
              addressValue = complaint.customer.address || '';
            } else {
              customerName = complaint.customer_name || '';
              phoneNumber = complaint.phone || '';
              addressValue = complaint.address || '';
            }

            return {
              id: complaint.id,
              stt: (this.page - 1) * this.pageSize + index + 1,
              complaint_date: complaint.complaint_date,
              customer_id: complaint.customer_id,
              customer_name: customerName,
              customer_phone: phoneNumber,
              address: addressValue,
              complaint_content: complaint.complaint_content,
              recipient: complaint.recipient,
              resolution: complaint.resolution || '',
              status: complaint.status,
              statusName: complaint.statusName || this.getStatusText(complaint.status),
              created_at: complaint.created_at,
              created_by: complaint.created_by,
              creator: complaint.createdBy ? complaint.createdBy.username : ''
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

  getStatusText(status: number): string {
    switch (status) {
      case 9:
        return 'Đang xử lý';
      case 10:
        return 'Đã giải quyết';
      default:
        return 'Không xác định';
    }
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

  openCreateModal(): void {
    const dialogRef = this.dialog.open(CustomerComplaintFormDialogComponent, {
      width: '800px',
      data: { isEdit: false }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadData();
      }
    });
  }

  openEditModal(complaint: any): void {
    const dialogRef = this.dialog.open(CustomerComplaintFormDialogComponent, {
      width: '800px',
      data: { isEdit: true, complaint: complaint }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadData();
      }
    });
  }

  deleteComplaint(complaint: any): void {
    const dialogRef = this.dialog.open(DeleteConfirmationDialog, {
      width: '400px',
      data: {
        title: 'Xác nhận xóa',
        message: `Bạn có chắc chắn muốn xóa khiếu nại của khách hàng "${complaint.customer_name}" không?`
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.isLoadingResults = true;
        this.customerComplaintService.deleteCustomerComplaint(complaint.id).subscribe(
          () => {
            this.notifyService.notify('success', 'Xóa khiếu nại thành công');
            this.loadData();
          },
          error => {
            console.error('Error deleting complaint:', error);
            this.isLoadingResults = false;
            this.notifyService.notify('error', 'Có lỗi xảy ra khi xóa khiếu nại');
          }
        );
      }
    });
  }

  exportExcel(): void {
    this.isLoadingResults = true;

    this.customerComplaintService.exportToExcel(this.currentDateFilter).subscribe(
      (response: any) => {
        const blob = new Blob([response], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;

        const dateStr = this.currentDateFilter.date_from ?
          `_${this.currentDateFilter.date_from}_${this.currentDateFilter.date_to}` :
          '';
        link.download = `khach-hang-khieu-nai${dateStr}.xlsx`;

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

@Component({
  selector: 'delete-confirmation-dialog',
  template: `
    <h2 mat-dialog-title>{{data.title}}</h2>
    <mat-dialog-content>{{data.message}}</mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button [mat-dialog-close]="false">Hủy</button>
      <button mat-raised-button color="warn" [mat-dialog-close]="true">Xóa</button>
    </mat-dialog-actions>
  `,
})
export class DeleteConfirmationDialog {
  constructor(@Inject(MAT_DIALOG_DATA) public data: any) {}
}
