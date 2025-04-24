import { Component, OnInit, ViewChild, Inject } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { debounceTime } from 'rxjs/operators';
import { NotifierService } from 'angular-notifier';
import { ListComponentBase } from '../../shared/base';
import { ActivatedRoute } from '@angular/router';
import { MatSort } from '@angular/material/sort';
import { DatetimeDefaultFilterDialogComponent } from '../components/datetime-default-filter-dialog/datetime-default-filter-dialog.component';
import { DatetimeChooseFilterDialogComponent } from '../components/datetime-choose-filter-dialog/datetime-choose-filter-dialog.component';
import { DrugReactionService } from  '../services/drug-reaction.service';
import { DrugReactionFormDialogComponent } from './drug-reaction-form-dialog/drug-reaction-form-dialog.component';
import { PopupConfirmDialogComponent } from '../../common/popup-confirm-dialog/popup-confirm-dialog.component';

@Component({
  selector: 'app-follow-book-drug-reaction',
  templateUrl: './follow-book-drug-reaction.component.html',
  styleUrls: ['../shared/follow-book.component.scss', './follow-book-drug-reaction.component.scss']
})
export class FollowBookDrugReactionComponent extends ListComponentBase implements OnInit {
  displayedColumns = ['stt', 'report_date', 'patient_name', 'patient_contact', 'drug_name', 'batch_number', 'expiry_date', 'reaction_description', 'recipient', 'resolution', 'actions'];
  columnsToDisplay = ['stt', 'report_date', 'patient_name', 'patient_contact', 'drug_name', 'batch_number', 'expiry_date', 'reaction_description', 'recipient', 'resolution', 'actions'];
  columnsHeader = {
    'stt': 'STT',
    'report_date': 'Ngày/tháng/năm ghi nhận phản ứng',
    'patient_name': 'Họ tên người bệnh, tuổi',
    'patient_contact': 'Địa chỉ, điện thoại',
    'drug_name': 'Tên thuốc, nồng độ/hàm lượng, nhà sản xuất',
    'batch_number': 'Số lô',
    'expiry_date': 'Hạn dùng',
    'reaction_description': 'Dấu hiệu phản ứng thông tin',
    'recipient': 'Người nhận',
    'resolution': 'Hướng xử trí',
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
    private drugReactionService: DrugReactionService
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

    if (this.currentDateFilter) {
      filter.date_from = this.currentDateFilter.date_from;
      filter.date_to = this.currentDateFilter.date_to;
    }

    return filter;
  }

  loadData(): void {
    this.isLoadingResults = true;

    this.drugReactionService.getDrugReactions(this.apiFilter).subscribe(
      response => {
        if (response && response.body) {
          this.dataSource = response.body.map((item: any, index: number) => {
            return {
              id: item.id,
              stt: (this.page - 1) * this.pageSize + index + 1,
              report_date: item.report_date,
              patient_name: item.patient_name,
              patient_contact: item.patient_contact,
              drug_name: item.drug_name,
              batch_number: item.batch_number,
              expiry_date: item.expiry_date,
              reaction_description: item.reaction_description,
              recipient: item.recipient,
              resolution: item.resolution || ''
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
    const dialogRef = this.dialog.open(DrugReactionFormDialogComponent, {
      width: '800px',
      data: { isEdit: false }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadData();
      }
    });
  }

  openEditModal(item: any): void {
    const dialogRef = this.dialog.open(DrugReactionFormDialogComponent, {
      width: '800px',
      data: { isEdit: true, ...item }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadData();
      }
    });
  }

  confirmDelete(drugReaction: any): void {
    const obj = {
      action: 'Delete',
      title: 'Xác nhận xóa tác dụng phụ thuốc đã chọn.',
      message: `Bạn có chắc chắn muốn xóa thông tin tác dụng phụ thuốc "${drugReaction.drug_name}" không?`
    };

    const dialogRef = this.dialog.open(PopupConfirmDialogComponent, {
      data: obj,
      width: '30%',
      minHeight: '60%'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result?.event === 'confirm') {
        this.deleteDrugReaction(drugReaction.id);
      }
    });
  }

  deleteDrugReaction(id: number): void {
    this.isLoadingResults = true;

    this.drugReactionService.deleteDrugReaction(id).subscribe({
      next: () => {
        this.notifyService.notify('success', 'Xóa thông tin tác dụng phụ thuốc thành công');
        this.loadData();
      },
      error: (error) => {
        console.error('Error deleting drug reaction:', error);
        this.isLoadingResults = false;
        this.notifyService.notify('error', 'Có lỗi xảy ra khi xóa thông tin tác dụng phụ thuốc');
      }
    });
  }

  exportExcel(): void {
    this.isLoadingResults = true;

    this.drugReactionService.exportToExcel(this.currentDateFilter).subscribe(
      (response: any) => {
        const blob = new Blob([response], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;

        const dateStr = this.currentDateFilter.date_from ?
          `_${this.currentDateFilter.date_from}_${this.currentDateFilter.date_to}` :
          '';
        link.download = `so-theo-doi-tac-dung-phu-thuoc${dateStr}.xlsx`;

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

export class DeleteConfirmationDialog {
  constructor(@Inject(MAT_DIALOG_DATA) public data: any) {}
}
