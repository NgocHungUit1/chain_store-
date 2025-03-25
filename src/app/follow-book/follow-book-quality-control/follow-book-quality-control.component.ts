import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { ProductService } from '../services/product.service';
import { QualityControlCreateModalComponent } from './quality-control-create-modal/quality-control-create-modal.component';
import { QualityCheck, QualityCheckFilter } from '../models/quality-check.interface';
import { FormControl, FormGroup, FormBuilder } from '@angular/forms';
import { merge, of as observableOf } from 'rxjs';
import { catchError, map, startWith, switchMap } from 'rxjs/operators';
import { DatetimeDefaultFilterDialogComponent } from '../components/datetime-default-filter-dialog/datetime-default-filter-dialog.component';
import { DatetimeChooseFilterDialogComponent } from '../components/datetime-choose-filter-dialog/datetime-choose-filter-dialog.component';
import { QualityControlDetailModalComponent } from './quality-control-detail-modal/quality-control-detail-modal.component';
import { PopupConfirmDialogComponent } from '../../common/popup-confirm-dialog/popup-confirm-dialog.component';
import { NotifierService } from 'angular-notifier';
import { ListComponentBase } from '../../shared/base';
import { ActivatedRoute } from '@angular/router';
import { Quantity } from '../../product/product.model';

@Component({
  selector: 'app-follow-book-quality-control',
  templateUrl: './follow-book-quality-control.component.html',
  styleUrls: ['./follow-book-quality-control.component.scss']
})
export class FollowBookQualityControlComponent extends ListComponentBase implements OnInit {
  constructor(
    private dialog: MatDialog,
    private route: ActivatedRoute,
    private productService: ProductService,
    private fb: FormBuilder,
    private notifyService: NotifierService
  ) {
    super();
    this.initTimeFilter();
  }
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  isLoadingResults = true;
  dataSource: QualityCheck[] = [];
  totalItems = 0;

  displayedColumns = ['stt', 'no', 'date', 'reason', 'note', 'status', 'actions'];
  columnsToDisplay = ['stt', 'no', 'date', 'reason', 'note', 'status', 'actions'];
  columnsHeader = {
    'stt': 'STT',
    'no': 'Tên số',
    'date': 'Ngày thực hiện',
    'reason': 'Lý do',
    'note': 'Ghi chú',
    'status': 'Trạng thái',
    'actions': 'Hành động'
  };

  dateControl = new FormControl(new Date());
  timeFilter: FormGroup;
  titleTimeDefault = 'Tháng này';
  titleTimeChoose = '1/3/2025 - 20/3/2025';
  dateFrom: Date = new Date();
  dateTo: Date = new Date();
  apiFilter: QualityCheckFilter;

  private initTimeFilter() {
    this.timeFilter = this.fb.group({
      typeTime: ['default']
    });
  }

  radioTimeChange(event: any) {
    if (this.timeFilter.get('typeTime').value === 'choose') {
      const date_from = new Date(this.dateControl.value);
      const date_to = new Date();
      this.titleTimeChoose = this.formatDisplayDate(date_from) + ' - ' + this.formatDisplayDate(date_to);
    } else {
      this.titleTimeChoose = 'Lựa chọn khác';
    }
  }

  openTimeDefault() {
    const dialogRef = this.dialog.open(DatetimeDefaultFilterDialogComponent, {
      width: '40%',
      minHeight: '80%'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result?.title) {
        this.titleTimeDefault = result.title;
        const today = new Date();
        switch(result.value) {
          case 'thisMonth':
            this.dateFrom = new Date(today.getFullYear(), today.getMonth(), 1);
            this.dateTo = today;
            break;
          case 'lastMonth':
            this.dateFrom = new Date(today.getFullYear(), today.getMonth() - 1, 1);
            this.dateTo = new Date(today.getFullYear(), today.getMonth(), 0);
            break;
          case 'thisYear':
            this.dateFrom = new Date(today.getFullYear(), 0, 1);
            this.dateTo = today;
            break;
        }
        this.loadData();
      }
    });
  }

  openTimeChoose() {
    const dialogRef = this.dialog.open(DatetimeChooseFilterDialogComponent, {
      width: '40%',
      minHeight: '80%',
      data: {
        fromDate: this.dateFrom,
        toDate: this.dateTo
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.dateFrom = new Date(result.fromDate);
        this.dateTo = new Date(result.toDate);
        this.titleTimeChoose = this.formatDisplayDate(this.dateFrom) + ' - ' + this.formatDisplayDate(this.dateTo);
        this.loadData();
      }
    });
  }

  private formatDisplayDate(date: Date): string {
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }

  ngOnInit(): void {
    this.apiFilter = this.buildFilterFromParams();
    this.loadData();
  }

  /**
   * Tạo lại bộ filter
   * @returns
   */
  buildFilterFromParams():QualityCheckFilter{
    function write<K extends keyof QualityCheckFilter>(arg: QualityCheckFilter, key: K, value: QualityCheckFilter[K]): void {
      arg[key] = value;
    }
    const filter = new QualityCheckFilter();
    const objectKeys = Object.keys(filter) as Array<keyof QualityCheckFilter>;
    for (const attr of objectKeys) {
      write(filter, attr, this.route.snapshot.queryParams['QualityFilterCheckSearch[' + attr + ']']);
    }
    filter.page = this.route.snapshot.queryParams['page'];
    filter.pageSize = this.route.snapshot.queryParams['pageSize'];
    filter.sort = this.route.snapshot.queryParams['sort'];
    filter.date_from = this.route.snapshot.queryParams['QualityCheckSearch[date_from]'];
    filter.date_to = this.route.snapshot.queryParams['QualityCheckSearch[date_to]'];
    filter.status = 10; // sao lại để 10 không thấy đổi
    return filter;
  }

  private handleDataResponse(response: any) {
    this.isLoadingResults = false;
    if (response && Array.isArray(response)) {
      this.dataSource = response.map((item, index) => ({
        ...item,
        stt: index + 1
      }));
      this.totalItems = response.length;
    } else {
      this.dataSource = [];
      this.totalItems = 0;
    }
  }

  /**
   * Ghi đè lại lớp BaseModel để gọi lại data
   */
  loadData():void {
    this.apiFilter.date_from = this.formatDate(this.dateFrom);
    this.apiFilter.date_to = this.formatDate(this.dateTo);
    this.productService.getQualityChecks(this.apiFilter).subscribe(res => {
      this.isLoadingResults = false;
      let data = res.body;
      if (data && Array.isArray(data)) {
        this.dataSource = data.map((item, index) => ({
          ...item,
          stt: index + 1
        }));
      } else {
        this.dataSource = [];
      }
      this.reloadFilter(res);
    });
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

  refreshData(): void {
    this.isLoadingResults = true;
    this.apiFilter = this.buildFilterFromParams();
    this.productService.getQualityChecks(this.apiFilter).subscribe({
      next: (response) => {
        this.handleDataResponse(response);
        this.notifyService.notify('success', 'Làm mới dữ liệu thành công');
      },
      error: (error) => {
        console.error('Error refreshing data:', error);
        this.notifyService.notify('error', 'Có lỗi khi làm mới dữ liệu');
      },
      complete: () => {
        this.isLoadingResults = false;
      }
    });
  }

  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  getStatusText(status: number): string {
    return status === 10 ? 'Hoàn thành' : 'Chưa hoàn thành';
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
    const dialogRef = this.dialog.open(QualityControlCreateModalComponent, {
      width: '100vw',
      height: '100vh',
      maxWidth: '100vw',
      maxHeight: '100vh',
      panelClass: 'full-screen-modal',
      data: { isEdit: true, qualityCheck: row }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.refreshData();
      }
    });
  }

  deleteQualityCheck(row: any): void {
    const obj = {
      action: 'Delete',
      title: 'Xác nhận xóa danh sách đã chọn .',
      content: 'Thông tin sản phẩm đã xác nhận hoàn thành trước đó sẽ được hệ thống tạo thẻ kho xóa đi !'
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
        // Tạo blob từ response
        const blob = new Blob([response], { type: 'application/vnd.ms-excel' });

        // Tạo URL cho blob
        const url = window.URL.createObjectURL(blob);

        // Tạo element a để download
        const a = document.createElement('a');
        a.href = url;
        a.download = `quality-control-${row.id}.xlsx`;
        document.body.appendChild(a);
        a.click();

        // Cleanup
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




