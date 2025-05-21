import { Component, OnInit, ViewChild, Inject } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { InvalidPrescriptionService } from '../services/invalid-prescription.service';
import { ConfirmDialogComponent } from '../components/confirm-dialog/confirm-dialog.component';
import { DatetimeDefaultFilterDialogComponent } from '../components/datetime-default-filter-dialog/datetime-default-filter-dialog.component';
import { DatetimeChooseFilterDialogComponent } from '../components/datetime-choose-filter-dialog/datetime-choose-filter-dialog.component';
import { InvalidPrescriptionFormDialogComponent } from './invalid-prescription-form-dialog/invalid-prescription-form-dialog.component';
import { debounceTime } from 'rxjs/operators';
import { NotifierService } from 'angular-notifier';
import { ListComponentBase } from '../../shared/base';
import { ActivatedRoute } from '@angular/router';
import { MatSort } from '@angular/material/sort';
import { PopupConfirmDialogComponent } from '../../common/popup-confirm-dialog/popup-confirm-dialog.component';

@Component({
  selector: 'app-follow-book-invalid-prescription',
  templateUrl: './follow-book-invalid-prescription.component.html',
  styleUrls: ['../shared/follow-book.component.scss', './follow-book-invalid-prescription.component.scss']
})
export class FollowBookInvalidPrescriptionComponent extends ListComponentBase implements OnInit {
  displayedColumns = ['stt', 'date', 'patient_name', 'patient_address', 'doctor_name', 'doctor_info', 'diagnosis', 'prescription_issues', 'resolution_methods', 'notes', 'actions'];
  columnsToDisplay = ['stt', 'date', 'patient_name', 'patient_address', 'doctor_name', 'doctor_info', 'diagnosis', 'prescription_issues', 'resolution_methods', 'notes', 'actions'];
  columnsHeader = {
    'stt': 'STT',
    'date': 'Ngày',
    'patient_name': 'Họ tên Bệnh nhân',
    'patient_address': 'Địa chỉ bệnh nhân',
    'doctor_name': 'Họ tên BS kê đơn',
    'doctor_info': 'Thông tin bác sĩ',
    'diagnosis': 'Chẩn đoán',
    'prescription_issues': 'Mô tả đơn thuốc',
    'resolution_methods': 'Cách xử lý',
    'notes': 'Ghi chú',
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
    private invalidPrescriptionService: InvalidPrescriptionService
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

    this.invalidPrescriptionService.getInvalidPrescriptions(this.apiFilter).subscribe(
      response => {
        if (response && response.body) {
          this.dataSource = response.body.map((item: any, index: number) => {
            let prescriptionIssuesJson;
            let resolutionMethodsJson;

            try {
              // Xử lý trường hợp JSON không hợp lệ
              prescriptionIssuesJson = typeof item.prescription_issues === 'string' ?
                JSON.parse(item.prescription_issues || '{}') :
                item.prescription_issues || {};

              resolutionMethodsJson = typeof item.resolution_methods === 'string' ?
                JSON.parse(item.resolution_methods || '{}') :
                item.resolution_methods || {};
            } catch (e) {
              console.error('Error parsing JSON:', e);
              prescriptionIssuesJson = {};
              resolutionMethodsJson = {};
            }

            return {
              id: item.id,
              stt: (this.page - 1) * this.pageSize + index + 1,
              date: item.date,
              patient_name: item.patient_name || '',
              patient_address: item.patient_address || '',
              doctor_name: item.doctor_name || '',
              doctor_info: item.doctor_info || '',
              diagnosis: item.diagnosis || '',
              prescription_issues: item.prescription_issues,
              prescription_issues_json: prescriptionIssuesJson,
              resolution_methods: item.resolution_methods,
              resolution_methods_json: resolutionMethodsJson,
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

  parseJson(jsonString: string) {
    try {
      return JSON.parse(jsonString || '{}');
    } catch (e) {
      return {};
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
    const dialogRef = this.dialog.open(InvalidPrescriptionFormDialogComponent, {
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
    const dialogRef = this.dialog.open(InvalidPrescriptionFormDialogComponent, {
      width: '800px',
      data: { isEdit: true, ...item }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadData();
      }
    });
  }

  confirmDelete(invalidPrescription: any): void {
    const obj = {
      action: 'Delete',
      title: 'Xác nhận xóa đơn thuốc không hợp lệ đã chọn.',
      message: `Bạn có chắc chắn muốn xóa thông tin đơn thuốc không hợp lệ của bệnh nhân "${invalidPrescription.patient_name}" không?`
    };

    const dialogRef = this.dialog.open(PopupConfirmDialogComponent, {
      data: obj,
      width: '30%',
      minHeight: '60%'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result?.event === 'confirm') {
        this.deleteInvalidPrescription(invalidPrescription.id);
      }
    });
  }

  deleteInvalidPrescription(id: number): void {
    this.isLoadingResults = true;

    this.invalidPrescriptionService.deleteInvalidPrescription(id).subscribe({
      next: () => {
        this.notifyService.notify('success', 'Xóa đơn thuốc không hợp lệ thành công');
        this.loadData();
      },
      error: (error) => {
        console.error('Error deleting invalid prescription:', error);
        this.isLoadingResults = false;
        this.notifyService.notify('error', 'Có lỗi xảy ra khi xóa thông tin đơn thuốc không hợp lệ');
      }
    });
  }

  exportExcel(): void {
    this.isLoadingResults = true;

    this.invalidPrescriptionService.exportToExcel(this.currentDateFilter).subscribe(
      (response: any) => {
        const blob = new Blob([response], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;

        const dateStr = this.currentDateFilter.date_from ?
          `_${this.currentDateFilter.date_from}_${this.currentDateFilter.date_to}` :
          '';
        link.download = `so-theo-doi-don-thuoc-khong-hop-le${dateStr}.xlsx`;

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

  getPrescriptionIssuesSummary(item: any): string {
    if (!item.prescription_issues_json) {
      return 'Không có';
    }

    const issues = [];

    if (item.prescription_issues_json.not_follow_template) {
      issues.push('Không đúng theo mẫu quy định');
    }

    if (item.prescription_issues_json.expired) {
      issues.push('Quá thời hạn mua thuốc (≥ 05 ngày kể từ ngày kê đơn)');
    }

    if (item.prescription_issues_json.missing_drug_info) {
      issues.push('Không ghi rõ ràng và chính xác tên thuốc, nồng độ, hàm lượng, số lượng');
    }

    if (item.prescription_issues_json.unclear_dosage) {
      issues.push('Cách dùng, liều dùng, các phối hợp không rõ ràng');
    }

    if (item.prescription_issues_json.missing_doctor_info) {
      issues.push('Không có đủ tên, chữ ký, địa chỉ, đầu phòng khám, bệnh viện của Bác sĩ');
    }

    if (item.prescription_issues_json.other) {
      issues.push('Khác: ' + item.prescription_issues_json.other);
    }

    return issues.length > 0 ? issues.join(', ') : 'Không có';
  }

  getResolutionMethodsSummary(item: any): string {
    if (!item.resolution_methods_json) {
      return 'Không có';
    }

    const methods = [];

    if (item.resolution_methods_json.contact_doctor) {
      methods.push('Hỏi lại người kê đơn');
    }

    if (item.resolution_methods_json.notify_customer) {
      methods.push('Thông báo cho người mua');
    }

    if (item.resolution_methods_json.refuse_sale) {
      methods.push('Từ chối bán');
    }

    if (item.resolution_methods_json.other) {
      methods.push('Khác: ' + item.resolution_methods_json.other);
    }

    return methods.length > 0 ? methods.join(', ') : 'Không có';
  }

  getPatientInfo(item: any): string {
    let info = item.patient_name || '';
    if (item.patient_address) {
      info += info ? ', ' + item.patient_address : item.patient_address;
    }
    return info;
  }

  getDoctorInfo(item: any): string {
    let info = item.doctor_name || '';
    if (item.doctor_info) {
      info += info ? ', ' + item.doctor_info : item.doctor_info;
    }
    return info;
  }
}

export class DeleteConfirmationDialog {
  constructor(@Inject(MAT_DIALOG_DATA) public data: any) {}
}
