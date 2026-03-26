import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatDialog } from '@angular/material/dialog';
import { InvoiceService } from '../../invoice/invoice.service';
import { InvoiceFilter, DateFilter } from '../../invoice/invoice.model';
import { AccountingBookService } from '../services/accounting-book.service';
import { NotifierService } from 'angular-notifier';
import { DatetimeDefaultFilterDialogComponent } from '../../follow-book/components/datetime-default-filter-dialog/datetime-default-filter-dialog.component';
import { DatetimeChooseFilterDialogComponent } from '../../follow-book/components/datetime-choose-filter-dialog/datetime-choose-filter-dialog.component';

interface SaleRevenueRow {
  createdFormat: string;
  description: string;
  total_price: number;
}

@Component({
  selector: 'app-sale-revenue-book',
  templateUrl: './sale-revenue-book.component.html',
  styleUrls: ['./sale-revenue-book.component.scss']
})
export class SaleRevenueBookComponent implements OnInit {
  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort: MatSort;

  filterForm: FormGroup;
  dataSource = new MatTableDataSource<SaleRevenueRow>([]);
  displayedColumns: string[] = ['entry_date', 'description', 'amount'];

  summaryTotal = 0;
  isLoadingResults = false;
  isExporting = false;
  currentDateFilter: DateFilter;

  // Pagination
  page = 1;
  pageSize = 20;
  pageTotalCount = 0;
  pageSizeOptions = [10, 20, 25, 50, 100];

  // Time filter
  titleTimeDefault = 'Tháng này';
  titleTimeChoose = 'Lựa chọn khác';

  // Order status filter
  orderStatusFilter: FormGroup;

  constructor(
    private fb: FormBuilder,
    private invoiceService: InvoiceService,
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

    this.titleTimeDefault = 'Tháng này';
    this.titleTimeChoose = 'Lựa chọn khác';
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
        this.currentDateFilter = {
          date_from: result.date_from,
          date_to: result.date_to
        };
        this.titleTimeDefault = result.title;
        this.filterForm.patchValue({ typeTime: 'default' });
        this.page = 1;
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
        this.currentDateFilter = {
          date_from: result.date_from,
          date_to: result.date_to
        };
        this.titleTimeChoose = result.title;
        this.filterForm.patchValue({ typeTime: 'choose' });
        this.page = 1;
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
    this.page = 1;
    this.loadData();
  }

  loadData(): void {
    this.isLoadingResults = true;

    const filter = this.buildInvoiceFilter();

    // Load summary
    this.invoiceService.getSumaryInvoice(filter).subscribe({
      next: (res: any) => {
        const summary = res.body || res;
        this.summaryTotal = parseFloat(summary.TongTienHang || 0);
      },
      error: () => {}
    });

    // Load list
    this.invoiceService.getList(filter).subscribe({
      next: (res: any) => {
        const data = res.body || [];
        this.processData(data);
        this.isLoadingResults = false;
      },
      error: (error) => {
        console.error('Error loading invoices:', error);
        this.notifyService.notify('error', 'Có lỗi khi tải dữ liệu');
        this.isLoadingResults = false;
      }
    });
  }

  processData(data: any[]): void {
    // Group by date (extract date part from createdFormat "dd/MM/yyyy HH:mm")
    const grouped: { [date: string]: number } = {};

    data.forEach(item => {
      const dateStr = (item.createdFormat || '').split(' ')[0]; // "01/12/2025"
      if (!dateStr) { return; }
      const amount = parseFloat(item.total_price || 0) + parseFloat(item.total_vat || 0);
      grouped[dateStr] = (grouped[dateStr] || 0) + amount;
    });

    // Sort by date ascending
    const displayData: SaleRevenueRow[] = Object.keys(grouped)
      .sort((a, b) => {
        // Parse "dd/MM/yyyy" to compare
        const [dA, mA, yA] = a.split('/').map(Number);
        const [dB, mB, yB] = b.split('/').map(Number);
        return new Date(yA, mA - 1, dA).getTime() - new Date(yB, mB - 1, dB).getTime();
      })
      .map(date => ({
        createdFormat: date,
        description: 'Doanh thu bán lẻ thuốc, hàng hóa khác',
        total_price: grouped[date]
      }));

    this.dataSource.data = displayData;
  }

  onMatPageChange(event: any): void {
    this.page = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    this.loadData();
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

    const statuses = [];
    if (this.orderStatusFilter.value.pending) { statuses.push('pending'); }
    if (this.orderStatusFilter.value.done) { statuses.push('done'); }

    this.isExporting = true;
    this.accountingBookService.exportSaleRevenue(
      dateFrom, dateTo, quarter, year, statuses.join(',')
    ).subscribe({
      next: (blob: Blob) => {
        const fileName = `So-doanh-thu-S1a-HKD-Quy${quarter}-${year}.xlsx`;
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

  private buildInvoiceFilter(): InvoiceFilter {
    const filter = new InvoiceFilter();
    filter.page = 1;
    filter.pageSize = 9999; // Lấy hết để group theo ngày ở frontend
    filter.expand = 'createdFormat';

    if (this.currentDateFilter) {
      filter.date_from = this.currentDateFilter.date_from || '';
      filter.date_to = this.currentDateFilter.date_to || '';
    }

    // Build order_status from checkboxes
    const statuses = [];
    if (this.orderStatusFilter.value.pending) { statuses.push('pending'); }
    if (this.orderStatusFilter.value.done) { statuses.push('done'); }
    filter.order_status = statuses.join(',');

    filter.order_national = 'yes,no';
    filter.einvoice = 'yes,no';
    filter.expenses = 'yes,no';

    return filter;
  }
}
