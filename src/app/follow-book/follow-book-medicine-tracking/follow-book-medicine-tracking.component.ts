import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { FormControl, FormGroup, FormBuilder } from '@angular/forms';
import { NotifierService } from 'angular-notifier';
import { ListComponentBase } from '../../shared/base';
import { ActivatedRoute } from '@angular/router';
import { debounceTime } from 'rxjs/operators';
import { DatetimeDefaultFilterDialogComponent } from '../components/datetime-default-filter-dialog/datetime-default-filter-dialog.component';
import { DatetimeChooseFilterDialogComponent } from '../components/datetime-choose-filter-dialog/datetime-choose-filter-dialog.component';
import { MedicineTrackingService } from '../services/medicine-tracking.service';

@Component({
  selector: 'app-follow-book-medicine-tracking',
  templateUrl: './follow-book-medicine-tracking.component.html',
  styleUrls: ['./follow-book-medicine-tracking.component.scss']
})
export class FollowBookMedicineTrackingComponent extends ListComponentBase implements OnInit {
  displayedColumns = ['stt', 'invoice_no', 'createdFormat', 'medicine_name', 'unit', 'quantity', 'bs_name', 'bn_name', 'address', 'age', 'diagnosis'];
  columnsToDisplay = ['stt', 'invoice_no', 'createdFormat', 'medicine_name', 'unit', 'quantity', 'bs_name', 'bn_name', 'address', 'age', 'diagnosis'];
  columnsHeader = {
    'stt': 'STT',
    'invoice_no': 'Mã hóa đơn',
    'createdFormat': 'Ngày giao dịch',
    'medicine_name': 'Tên thuốc, Nồng độ, Hàm lượng',
    'unit': 'Đơn vị tính',
    'quantity': 'Số lượng',
    'bs_name': 'Họ và tên BS',
    'bn_name': 'Họ và tên BN',
    'address': 'Địa chỉ',
    'age': 'Tuổi',
    'diagnosis': 'Chuẩn đoán'
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
    private medicineTrackingService: MedicineTrackingService
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
    filter.expand = 'invoiceDetails,customer,payment,store,user,returns,today,time,createdFormat';

    if (this.currentDateFilter) {
      filter.date_from = this.currentDateFilter.date_from;
      filter.date_to = this.currentDateFilter.date_to;
    }

    return filter;
  }

  calculateAge(dobYear: string | null): number {
    if (!dobYear) return 0;

    const currentYear = new Date().getFullYear();

    const birthYear = parseInt(dobYear.split('-')[0]);
    return currentYear - birthYear;
  }

  loadData(): void {
    this.isLoadingResults = true;

    this.medicineTrackingService.getMedicineTrackingList(this.apiFilter).subscribe(
      response => {
        if (response && response.body) {
          this.dataSource = response.body.map((invoice: any, index: number) => {
            const details = invoice.invoiceDetails.map((detail: any) => ({
              medicine_name: detail.product.product_name,
              unit: detail.base_unit,
              quantity: detail.amount
            }));

            return {
              stt: (this.page - 1) * this.pageSize + index + 1,
              invoice_no: invoice.invoice_no,
              createdFormat: invoice.createdFormat,
              details: details,
              bs_name: invoice.doctor_name || '',
              bn_name: invoice.customer?.name || '',
              address: invoice.customer?.address || '',
              age: this.calculateAge(invoice.customer?.dob) || '',
              diagnosis: invoice.diagnosis || ''
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

  exportExcel(): void {
    this.isLoadingResults = true;

    this.medicineTrackingService.exportToExcel(this.currentDateFilter).subscribe(
      (response: any) => {
        const blob = new Blob([response], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;

        const dateStr = this.currentDateFilter.date_from ?
          `_${this.currentDateFilter.date_from}_${this.currentDateFilter.date_to}` :
          '';
        link.download = `so-theo-doi-ban-thuoc${dateStr}.xlsx`;

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
