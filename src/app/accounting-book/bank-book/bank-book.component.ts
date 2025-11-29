import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatDialog } from '@angular/material/dialog';
import { AccountingBookService } from '../services/accounting-book.service';
import { NotifierService } from 'angular-notifier';
import { DateFilter } from '../../invoice/invoice.model';
import { DatetimeDefaultFilterDialogComponent } from '../../follow-book/components/datetime-default-filter-dialog/datetime-default-filter-dialog.component';
import { DatetimeChooseFilterDialogComponent } from '../../follow-book/components/datetime-choose-filter-dialog/datetime-choose-filter-dialog.component';

interface CashFlow {
  id: number;
  no: string;
  type: string; // 'payment' or 'receipt'
  value: number;
  ten_nguoi_nop: string;
  code: string;
  createdFormat: string;
  note: string;
  created_at?: number;
}

interface CashFlowDisplay extends CashFlow {
  receipt_no?: string;
  payment_no?: string;
  receipt_amount?: number;
  payment_amount?: number;
  balance?: number;
}

interface SummaryData {
  payment_amount: number;
  receipt_amount: number;
  start_amount: number;
  end_amount: number;
}

@Component({
  selector: 'app-bank-book',
  templateUrl: './bank-book.component.html',
  styleUrls: ['./bank-book.component.scss']
})
export class BankBookComponent implements OnInit {
  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort: MatSort;

  filterForm: FormGroup;
  dataSource = new MatTableDataSource<CashFlowDisplay>([]);
  displayedColumns: string[] = [
    'entry_date',
    'voucher_date',
    'receipt_no',
    'payment_no',
    'description',
    'receipt_amount',
    'payment_amount',
    'balance',
    'note'
  ];

  summaryData: SummaryData = {
    payment_amount: 0,
    receipt_amount: 0,
    start_amount: 0,
    end_amount: 0
  };

  isLoadingResults = false;
  isExporting = false;
  currentDateFilter: DateFilter;

  // Pagination
  page = 1;
  pageSize = 20; // Default 20 like cash-flow-list
  pageTotalCount = 0;
  pageSizeOptions = [10, 20, 25, 50, 100];

  // Time filter
  titleTimeDefault = 'Tháng này';
  titleTimeChoose = 'Lựa chọn khác';

  DATE_FORMAT = 'yyyy-MM-dd';

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

  convertDate(date: Date) {
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

        this.filterForm.patchValue({
          typeTime: 'default'
        });

        // Reset pagination when filter changes
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

        this.filterForm.patchValue({
          typeTime: 'choose'
        });

        // Reset pagination when filter changes
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

  loadData(): void {
    this.isLoadingResults = true;

    const apiFilter = this.buildApiFilter();

    // Load summary first to get start_amount
    this.accountingBookService.getBankFlowSummary(apiFilter).subscribe({
      next: (summary: any) => {
        // Handle both direct object and object with data/body property
        const summaryData = summary.data || summary.body || summary;
        this.summaryData = {
          payment_amount: parseFloat(summaryData.payment_amount || 0),
          receipt_amount: parseFloat(summaryData.receipt_amount || 0),
          start_amount: parseFloat(summaryData.start_amount || 0),
          end_amount: parseFloat(summaryData.end_amount || 0)
        };

        // Then load cash flow data with pagination - use current page and pageSize
        this.accountingBookService.getBankFlow(apiFilter, this.page, this.pageSize).subscribe({
          next: (response: any) => {
            // Handle both array and object with data property
            const data = Array.isArray(response.body) ? response.body :
                        (response.body?.data || response.data || response.body || []);
            this.processData(data);

            // Update pagination info from headers - but DON'T override page if we just changed it
            if (response.headers) {
              const totalCount = Number(response.headers.get('X-Pagination-Total-Count')) || 0;
              const perPage = Number(response.headers.get('X-Pagination-Per-Page')) || this.pageSize;
              const currentPage = Number(response.headers.get('X-Pagination-Current-Page')) || this.page;

              this.pageTotalCount = totalCount;
              // Only update pageSize if it's different to avoid unnecessary changes
              if (perPage !== this.pageSize) {
                this.pageSize = perPage;
              }
              // Only update page from headers if it's reasonable (not resetting to 1 unexpectedly)
              if (currentPage === this.page) {
                this.page = currentPage;
              }
            }

            this.isLoadingResults = false;
          },
          error: (error) => {
            console.error('Error loading bank flow:', error);
            this.notifyService.notify('error', 'Có lỗi khi tải dữ liệu');
            this.isLoadingResults = false;
          }
        });
      },
      error: (error) => {
        console.error('Error loading summary:', error);
        this.isLoadingResults = false;
      }
    });
  }

  onMatPageChange(event: any): void {
    this.page = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    this.loadData();
  }

  processData(data: CashFlow[]): void {
    // Sort by date ascending
    const sortedData = [...data].sort((a, b) => {
      const dateA = a.created_at ? a.created_at : new Date(a.createdFormat).getTime();
      const dateB = b.created_at ? b.created_at : new Date(b.createdFormat).getTime();
      return dateA - dateB;
    });

    // Calculate starting balance for current page
    // For page 1: start with start_amount
    // For other pages: we need to calculate from start_amount + all previous transactions
    let runningBalance = this.summaryData.start_amount;

    const displayData: CashFlowDisplay[] = sortedData.map(item => {
      const displayItem: CashFlowDisplay = { ...item };

      if (item.type === 'receipt') {
        displayItem.receipt_no = item.code || item.no;
        displayItem.payment_no = '';
        displayItem.receipt_amount = item.value;
        displayItem.payment_amount = 0;
        runningBalance += item.value;
      } else if (item.type === 'payment') {
        displayItem.receipt_no = '';
        displayItem.payment_no = item.code || item.no;
        displayItem.receipt_amount = 0;
        displayItem.payment_amount = item.value;
        runningBalance -= item.value;
      }

      displayItem.balance = runningBalance;

      return displayItem;
    });

    this.dataSource.data = displayData;
    // DON'T set paginator and sort on dataSource - we're using server-side pagination
    // this.dataSource.paginator = this.paginator;
    // this.dataSource.sort = this.sort;
  }

  private buildApiFilter(): { date_from?: string; date_to?: string } {
    return {
      date_from: this.normalizeDateValue(this.currentDateFilter?.date_from),
      date_to: this.normalizeDateValue(this.currentDateFilter?.date_to)
    };
  }

  private normalizeDateValue(value: string | null | undefined): string | undefined {
    if (!value || value === 'null') {
      return undefined;
    }
    return value;
  }

  exportToExcel(): void {
    if (this.isExporting) {
      return;
    }

    const apiFilter = this.buildApiFilter();
    const dateFrom = apiFilter.date_from || 'all';
    const dateTo = apiFilter.date_to || 'all';

    this.isExporting = true;
    this.accountingBookService.exportBankFlow(apiFilter).subscribe({
      next: (blob: Blob) => {
        const fileName = `S7-HKD-So-tien-gui-ngan-hang-${dateFrom}-${dateTo}.xlsx`;
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
        console.error('Error exporting bank flow:', error);
        this.notifyService.notify('error', 'Có lỗi khi xuất Excel');
        this.isExporting = false;
      }
    });
  }
}
