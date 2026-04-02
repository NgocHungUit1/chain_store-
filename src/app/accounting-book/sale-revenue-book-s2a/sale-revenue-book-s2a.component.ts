import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { DateFilter } from '../../invoice/invoice.model';
import { AccountingBookService } from '../services/accounting-book.service';
import { NotifierService } from 'angular-notifier';
import { DatetimeDefaultFilterDialogComponent } from '../../follow-book/components/datetime-default-filter-dialog/datetime-default-filter-dialog.component';
import { DatetimeChooseFilterDialogComponent } from '../../follow-book/components/datetime-choose-filter-dialog/datetime-choose-filter-dialog.component';

interface S2aRow {
  invoice_no: string;
  invoice_date: string;
  description: string;
  line_total: number;
}

interface S2aGroup {
  name: string;
  rows: S2aRow[];
  total: number;
}

@Component({
  selector: 'app-sale-revenue-book-s2a',
  templateUrl: './sale-revenue-book-s2a.component.html',
  styleUrls: ['./sale-revenue-book-s2a.component.scss']
})
export class SaleRevenueBookS2aComponent implements OnInit {
  filterForm: FormGroup;
  orderStatusFilter: FormGroup;
  groups: S2aGroup[] = [];
  grandTotal = 0;

  isLoadingResults = false;
  isExporting = false;
  currentDateFilter: DateFilter;

  // Time filter
  titleTimeDefault = 'Tháng này';
  titleTimeChoose = 'Lựa chọn khác';

  constructor(
    private fb: FormBuilder,
    private accountingBookService: AccountingBookService,
    private notifyService: NotifierService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.initDateFilter();
    this.buildForm();
    this.loadData();
  }

  buildForm(): void {
    this.filterForm = this.fb.group({
      typeTime: ['default']
    });

    this.orderStatusFilter = this.fb.group({
      pending: [true],
      done: [true]
    });
  }

  initDateFilter(): void {
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

  convertDate(date: Date): string {
    const month = date.getMonth() + 1;
    return date.getDate() + '/' + month + '/' + date.getFullYear();
  }

  openTimeDefault(): void {
    const dialogRef = this.dialog.open(DatetimeDefaultFilterDialogComponent, {
      width: '600px',
      position: { top: '100px' },
      panelClass: 'simple-dialog'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.currentDateFilter = { date_from: result.date_from, date_to: result.date_to };
        this.titleTimeDefault = result.title;
        this.filterForm.patchValue({ typeTime: 'default' });
        this.loadData();
      }
    });
  }

  openTimeChoose(): void {
    const dialogRef = this.dialog.open(DatetimeChooseFilterDialogComponent, {
      width: '350px',
      position: { top: '100px' },
      data: this.currentDateFilter,
      panelClass: 'simple-dialog'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.currentDateFilter = { date_from: result.date_from, date_to: result.date_to };
        this.titleTimeChoose = result.title;
        this.filterForm.patchValue({ typeTime: 'choose' });
        this.loadData();
      }
    });
  }

  radioTimeChange(event: Event): void {
    if (this.filterForm.controls['typeTime'].value === 'choose') {
      const date_from = new Date(this.currentDateFilter.date_from);
      const date_to = new Date(this.currentDateFilter.date_to);
      this.titleTimeChoose = this.convertDate(date_from) + ' - ' + this.convertDate(date_to);
    } else {
      this.titleTimeChoose = 'Lựa chọn khác';
    }
  }

  onOrderStatusChange(): void {
    this.loadData();
  }

  loadData(): void {
    this.isLoadingResults = true;

    const dateFrom = this.currentDateFilter?.date_from || '';
    const dateTo = this.currentDateFilter?.date_to || '';
    const statuses = this.getOrderStatuses();

    this.accountingBookService.getRevenueByProductType(dateFrom, dateTo, statuses).subscribe({
      next: (res: any) => {
        const medicineData = res.medicine || [];
        const merchandiseData = res.merchandise || [];
        const summary = res.summary || {};

        this.groups = [
          this.buildGroup('1. Thuốc', 'Doanh thu bán lẻ thuốc', medicineData, summary.medicine_total || 0),
          this.buildGroup('2. Hàng hóa khác', 'Doanh thu bán lẻ hàng hóa khác', merchandiseData, summary.merchandise_total || 0)
        ];

        this.grandTotal = summary.grand_total || 0;
        this.isLoadingResults = false;
      },
      error: (error) => {
        console.error('Error loading data:', error);
        this.notifyService.notify('error', 'Có lỗi khi tải dữ liệu');
        this.isLoadingResults = false;
      }
    });
  }

  private buildGroup(name: string, description: string, data: any[], total: number): S2aGroup {
    const rows: S2aRow[] = data.map(item => ({
      invoice_no: item.invoice_no || '',
      invoice_date: item.invoice_date || '',
      description,
      line_total: parseFloat(item.line_total || 0)
    }));

    return { name, rows, total };
  }

  exportToExcel(): void {
    if (this.isExporting) { return; }

    const dateFrom = this.currentDateFilter?.date_from || '';
    const dateTo = this.currentDateFilter?.date_to || '';

    const parts = dateFrom.split('-');
    const today = new Date();
    const year = parts.length >= 1 && parts[0] ? parseInt(parts[0], 10) : today.getFullYear();
    const month = parts.length >= 2 && parts[1] ? parseInt(parts[1], 10) : (today.getMonth() + 1);
    const quarter = Math.ceil(month / 3);

    this.isExporting = true;
    this.accountingBookService.exportSaleRevenueS2a(
      dateFrom, dateTo, quarter, year, this.getOrderStatuses()
    ).subscribe({
      next: (blob: Blob) => {
        const fileName = `So-doanh-thu-S2a-HKD-Quy${quarter}-${year}.xlsx`;
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        link.click();
        window.URL.revokeObjectURL(url);
        this.notifyService.notify('success', 'Xuất Excel thành công');
        this.isExporting = false;
      },
      error: (error) => {
        console.error('Error exporting:', error);
        this.notifyService.notify('error', 'Có lỗi khi xuất Excel');
        this.isExporting = false;
      }
    });
  }

  private getOrderStatuses(): string {
    const statuses = [];
    if (this.orderStatusFilter.value.pending) { statuses.push('pending'); }
    if (this.orderStatusFilter.value.done) { statuses.push('done'); }
    return statuses.join(',');
  }
}
