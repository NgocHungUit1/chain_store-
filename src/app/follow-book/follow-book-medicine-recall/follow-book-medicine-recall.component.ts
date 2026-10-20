import { Component, OnInit, ViewChild, Inject } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { MedicineRecallService } from '../services/medicine-recall.service';
import { ConfirmDialogComponent } from '../components/confirm-dialog/confirm-dialog.component';
import { DatetimeDefaultFilterDialogComponent } from '../components/datetime-default-filter-dialog/datetime-default-filter-dialog.component';
import { DatetimeChooseFilterDialogComponent } from '../components/datetime-choose-filter-dialog/datetime-choose-filter-dialog.component';
import { MedicineRecallFormDialogComponent } from './medicine-recall-form-dialog/medicine-recall-form-dialog.component';
import { LotTraceDialogComponent } from './lot-trace-dialog/lot-trace-dialog.component';
import { debounceTime } from 'rxjs/operators';
import { NotifierService } from 'angular-notifier';
import { ListComponentBase } from '../../shared/base';
import { ActivatedRoute } from '@angular/router';
import { MatSort } from '@angular/material/sort';
import { PopupConfirmDialogComponent } from '../../common/popup-confirm-dialog/popup-confirm-dialog.component';

@Component({
  selector: 'app-follow-book-medicine-recall',
  templateUrl: './follow-book-medicine-recall.component.html',
  styleUrls: ['../shared/follow-book.component.scss', './follow-book-medicine-recall.component.scss']
})
export class FollowBookMedicineRecallComponent extends ListComponentBase implements OnInit {
  displayedColumns = ['stt', 'document_number', 'date', 'medicine_name', 'batch_number', 'manufacturer', 'quantity', 'units_sold', 'returned_amount', 'customer_info', 'receiver', 'notes', 'actions'];
  columnsToDisplay = ['stt', 'document_number', 'date', 'medicine_name', 'batch_number', 'manufacturer', 'quantity', 'units_sold', 'returned_amount', 'customer_info', 'receiver', 'notes', 'actions'];
  columnsHeader = {
    'stt': 'STT',
    'document_number': 'Số, ngày tháng của công văn',
    'date': 'Ngày',
    'medicine_name': 'Thuốc bị thu hồi',
    'batch_number': 'Số lô, HSD',
    'manufacturer': 'Công ty SX/NK',
    'quantity': 'SL thuốc đã mua',
    'units_sold': 'SL thuốc đã bán',
    'returned_amount': 'SL thu hồi từ khách',
    'customer_info': 'Khách hàng trả thuốc',
    'receiver': 'Người nhận',
    'notes': 'Xử lý của cơ sở',
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
    private medicineRecallService: MedicineRecallService
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

    this.medicineRecallService.getMedicineRecalls(this.apiFilter).subscribe(
      response => {
        if (response && response.body) {
          this.dataSource = response.body.map((item: any, index: number) => {
            return {
              id: item.id,
              stt: (this.page - 1) * this.pageSize + index + 1,
              document_number: item.document_number,
              date: item.date,
              medicine_name: item.medicine_name,
              batch_number: item.batch_number,
              manufacturer: item.manufacturer,
              quantity: item.quantity,
              units_sold: item.units_sold,
              returned_amount: item.returned_amount,
              customer_info: item.customer_info || '',
              receiver: item.receiver,
              notes: item.notes || ''
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

  openLotTrace(): void {
    const dialogRef = this.dialog.open(LotTraceDialogComponent, {
      width: '1000px',
      maxHeight: '90vh',
    });
    dialogRef.afterClosed().subscribe(saved => {
      if (saved) {
        this.loadData();
      }
    });
  }

  openCreateModal(): void {
    const dialogRef = this.dialog.open(MedicineRecallFormDialogComponent, {
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
    const dialogRef = this.dialog.open(MedicineRecallFormDialogComponent, {
      width: '800px',
      data: { isEdit: true, ...item }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadData();
      }
    });
  }

  confirmDelete(medicineRecall: any): void {
    const obj = {
      action: 'Delete',
      title: 'Xác nhận xóa thuốc bị thu hồi đã chọn.',
      message: `Bạn có chắc chắn muốn xóa thông tin thuốc thu hồi "${medicineRecall.medicine_name}" không?`
    };

    const dialogRef = this.dialog.open(PopupConfirmDialogComponent, {
      data: obj,
      width: '30%',
      minHeight: '60%'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result?.event === 'confirm') {
        this.deleteMedicineRecall(medicineRecall.id);
      }
    });
  }

  deleteMedicineRecall(id: number): void {
    this.isLoadingResults = true;

    this.medicineRecallService.deleteMedicineRecall(id).subscribe({
      next: () => {
        this.notifyService.notify('success', 'Xóa thuốc bị thu hồi thành công');
        this.loadData();
      },
      error: (error) => {
        console.error('Error deleting medicine recall:', error);
        this.isLoadingResults = false;
        this.notifyService.notify('error', 'Có lỗi xảy ra khi xóa thông tin thuốc bị thu hồi');
      }
    });
  }

  exportExcel(): void {
    this.isLoadingResults = true;

    this.medicineRecallService.exportToExcel(this.currentDateFilter).subscribe(
      (response: any) => {
        const blob = new Blob([response], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;

        const dateStr = this.currentDateFilter.date_from ?
          `_${this.currentDateFilter.date_from}_${this.currentDateFilter.date_to}` :
          '';
        link.download = `so-theo-doi-thuoc-thu-hoi${dateStr}.xlsx`;

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

  deleteItem(item: any): void {
    const dialogRef = this.dialog.open(DeleteConfirmationDialog, {
      width: '400px',
      data: {
        title: 'Xác nhận xóa',
        message: `Bạn có chắc chắn muốn xóa thông tin thuốc thu hồi "${item.medicine_name}" không?`
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.isLoadingResults = true;
        this.medicineRecallService.deleteMedicineRecall(item.id).subscribe({
          next: () => {
            this.notifyService.notify('success', 'Xóa thông tin thuốc thu hồi thành công');
            this.loadData();
          },
          error: (error) => {
            console.error('Error deleting medicine recall:', error);
            this.isLoadingResults = false;
            this.notifyService.notify('error', 'Có lỗi xảy ra khi xóa thông tin thuốc thu hồi');
          }
        });
      }
    });
  }
}


export class DeleteConfirmationDialog {
  constructor(@Inject(MAT_DIALOG_DATA) public data: any) {}
}
