import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { of } from 'rxjs';
import { AccountingBookService } from '../services/accounting-book.service';
import { Product } from '../models/product.interface';
import { StockCard } from '../models/stock-card.interface';
import { NotifierService } from 'angular-notifier';
import { format } from 'date-fns';
import { DateFilter } from '../../invoice/invoice.model';
import { DatetimeDefaultFilterDialogComponent } from '../../follow-book/components/datetime-default-filter-dialog/datetime-default-filter-dialog.component';
import { DatetimeChooseFilterDialogComponent } from '../../follow-book/components/datetime-choose-filter-dialog/datetime-choose-filter-dialog.component';
import { ProductFilterDialogComponent } from '../components/product-filter-dialog/product-filter-dialog.component';
import { ParcelFilterDialogComponent, Parcel } from '../components/parcel-filter-dialog/parcel-filter-dialog.component';

interface StockCardDisplay extends StockCard {
  import_quantity?: number;
  import_price?: number;
  import_value?: number;
  export_quantity?: number;
  export_value?: number;
  balance_quantity?: number;
  balance_value?: number;
}

@Component({
  selector: 'app-stock-detail',
  templateUrl: './stock-detail.component.html',
  styleUrls: ['./stock-detail.component.scss']
})
export class StockDetailComponent implements OnInit {
  displayedColumns = [
    'doc_no',
    'change_date',
    'description',
    'unit',
    'import_price',
    'import_quantity',
    'import_value',
    'export_quantity',
    'export_value',
    'balance_quantity',
    'balance_value'
  ];

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  dataSource = new MatTableDataSource<StockCardDisplay>([]);
  isLoadingResults = false;

  selectedProduct: Product | null = null;
  selectedParcel: Parcel | null = null;
  parcelPriceMap: Map<string, number> = new Map();
  parcelList: Parcel[] = [];

  filterForm: FormGroup;
  titleProduct = 'Chọn sản phẩm';
  titleParcel = 'Chọn số lô';
  titleTimeDefault = 'Tháng này';
  titleTimeChoose = 'Lựa chọn khác';
  currentDateFilter: DateFilter;

  summaryData = {
    opening_balance_quantity: 0,
    opening_balance_value: 0,
    total_import_quantity: 0,
    total_import_value: 0,
    total_export_quantity: 0,
    total_export_value: 0,
    closing_balance_quantity: 0,
    closing_balance_value: 0
  };

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
  }

  buildForm() {
    this.filterForm = this.fb.group({
      productFilter: [''],
      parcelFilter: [''],
      typeTime: ['default'],
    });
  }

  initDateFilter() {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    const first = new Date(year, month, 1);

    this.currentDateFilter = {
      date_from: this.formatDate(first),
      date_to: this.formatDate(today),
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

  openProductDialog() {
    const dialogRef = this.dialog.open(ProductFilterDialogComponent, {
      width: '600px',
      position: { top: '100px' },
      data: { currentProduct: this.selectedProduct },
      panelClass: 'simple-dialog'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.selectedProduct = result;
        this.titleProduct = result.product_name;
        this.selectedParcel = null;
        this.titleParcel = 'Chọn số lô';
        this.parcelPriceMap.clear();
        this.parcelList = [];
        this.dataSource.data = []; // Clear table until parcel selected
        this.filterForm.patchValue({
          productFilter: 'selected',
          parcelFilter: ''
        });
        this.loadParcelPrices();
      }
    });
  }

  selectParcel(parcel: Parcel) {
    this.selectedParcel = parcel;
    this.titleParcel = parcel.parcel_no;

    this.filterForm.patchValue({
      parcelFilter: parcel.parcel_no,
    });

    this.loadStockCard();
  }

  loadParcelPrices(): void {
    if (!this.selectedProduct) {
      return;
    }

    this.accountingBookService.getParcelsByProduct(this.selectedProduct.id).subscribe({
      next: (response: any) => {
        const parcelData = Array.isArray(response) ? response : [response];

        // Build parcel list and price map
        this.parcelList = parcelData.map((item: any) => ({
          parcel_no: item.parcel_no,
          quantity: item.quantity_of_stock,
          exp_date: item.expiration_date,
          original_price: item.product?.original_price || 0
        }));

        // Build price map
        parcelData.forEach((item: any) => {
          const parcelNo = item.parcel_no;
          const price = item.product?.original_price || 0;
          this.parcelPriceMap.set(parcelNo, price);
        });

        // Don't auto-load stock card - wait for parcel selection
      },
      error: (error: any) => {
        console.error('Error loading parcel prices:', error);
      }
    });
  }

  openTimeDefault() {
    const dialogRef = this.dialog.open(DatetimeDefaultFilterDialogComponent, {
      width: '600px',
      position: { top: '100px' },
      panelClass: 'simple-dialog'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.currentDateFilter = result;
        this.titleTimeDefault = result.title;

        this.filterForm.patchValue({
          typeTime: 'default',
        });

        if (this.selectedProduct) {
          this.loadStockCard();
        }
      }
    });
  }

  openTimeChoose() {
    const dialogRef = this.dialog.open(DatetimeChooseFilterDialogComponent, {
      width: '350px',
      position: { top: '100px' },
      data: this.currentDateFilter,
      panelClass: 'simple-dialog'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.currentDateFilter = result;
        this.titleTimeChoose = result.title;

        this.filterForm.patchValue({
          typeTime: 'choose',
        });

        if (this.selectedProduct) {
          this.loadStockCard();
        }
      }
    });
  }

  radioTimeChange(event: Event) {
    if (this.filterForm.controls['typeTime'].value === 'choose') {
      const date_from = new Date(this.currentDateFilter.date_from);
      const date_to = new Date(this.currentDateFilter.date_to);
      this.titleTimeChoose = this.convertDate(date_from) + ' - ' + this.convertDate(date_to);
    } else {
      this.titleTimeChoose = 'Lựa chọn khác';
    }
  }

  loadStockCard(): void {
    if (!this.selectedProduct) {
      this.notifyService.notify('warning', 'Vui lòng chọn sản phẩm');
      return;
    }

    if (!this.selectedParcel) {
      this.notifyService.notify('warning', 'Vui lòng chọn số lô');
      return;
    }

    this.isLoadingResults = true;

    const filter: any = {
      product_id: this.selectedProduct.id,
      date_from: this.currentDateFilter.date_from,
      date_to: this.currentDateFilter.date_to,
      parcel_no: this.selectedParcel.parcel_no
    };

    this.accountingBookService.getStockCard(filter).subscribe({
      next: (stockCards) => {
        // Backend now filters properly, no need for frontend filter
        this.processStockCardData(stockCards);
        this.isLoadingResults = false;
      },
      error: (error) => {
        console.error('Error loading stock card:', error);
        this.notifyService.notify('error', 'Có lỗi xảy ra khi tải dữ liệu thẻ kho');
        this.isLoadingResults = false;
      }
    });
  }

  private processStockCardData(stockCards: StockCard[]): void {
    this.resetSummary();

    // Sort by date ascending (oldest first) to calculate balance correctly
    const sortedCards = [...stockCards].sort((a, b) => {
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    });

    const displayData: StockCardDisplay[] = sortedCards.map(card => {
      const displayCard: StockCardDisplay = { ...card };

      // Get price from parcel map, fallback to product price
      const price = this.parcelPriceMap.get(card.parcel_no) || this.selectedProduct?.original_price || 0;

      if (card.method === 'import') {
        displayCard.import_quantity = Math.abs(card.quantity);
        displayCard.import_price = price;
        displayCard.import_value = Math.abs(card.quantity) * price;
        this.summaryData.total_import_quantity += Math.abs(card.quantity);
        this.summaryData.total_import_value += displayCard.import_value;
      } else if (card.method === 'sale') {
        displayCard.export_quantity = Math.abs(card.quantity);
        displayCard.export_value = Math.abs(card.quantity) * price;
        this.summaryData.total_export_quantity += Math.abs(card.quantity);
        this.summaryData.total_export_value += displayCard.export_value;
      }

      displayCard.balance_quantity = card.quantity_of_stock;
      displayCard.balance_value = card.quantity_of_stock * price;

      displayCard.description = this.getMethodDescription(card.method);

      return displayCard;
    });

    if (displayData.length > 0) {
      const lastCard = displayData[displayData.length - 1];
      const firstCard = displayData[0];

      // Get price from parcel map
      const price = this.parcelPriceMap.get(this.selectedParcel.parcel_no) || this.selectedProduct?.original_price || 0;

      // Opening balance = first transaction's stock - its quantity change
      if (firstCard.method === 'import') {
        this.summaryData.opening_balance_quantity = firstCard.quantity_of_stock - firstCard.quantity;
      } else {
        this.summaryData.opening_balance_quantity = firstCard.quantity_of_stock + Math.abs(firstCard.quantity);
      }
      this.summaryData.opening_balance_value = this.summaryData.opening_balance_quantity * price;

      // Closing balance = last transaction's stock
      this.summaryData.closing_balance_quantity = lastCard.quantity_of_stock;
      this.summaryData.closing_balance_value = this.summaryData.closing_balance_quantity * price;
    }

    this.dataSource.data = displayData;
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  private getMethodDescription(method: string): string {
    const methodMap = {
      'import': 'Nhập hàng từ NCC',
      'sale': 'Xuất bán hàng',
      'return': 'Nhập hàng trả lại',
      'warehouse-return': 'Trả hàng cho NCC'
    };
    return methodMap[method] || 'Giao dịch khác';
  }

  private resetSummary(): void {
    this.summaryData = {
      opening_balance_quantity: 0,
      opening_balance_value: 0,
      total_import_quantity: 0,
      total_import_value: 0,
      total_export_quantity: 0,
      total_export_value: 0,
      closing_balance_quantity: 0,
      closing_balance_value: 0
    };
  }

  exportToExcel(): void {
    if (!this.selectedProduct) {
      this.notifyService.notify('warning', 'Vui lòng chọn sản phẩm trước khi xuất Excel');
      return;
    }

    if (!this.selectedParcel) {
      this.notifyService.notify('warning', 'Vui lòng chọn số lô trước khi xuất Excel');
      return;
    }

    const dateFrom = this.currentDateFilter.date_from;
    const dateTo = this.currentDateFilter.date_to;
    const parcelNo = this.selectedParcel.parcel_no;

    this.accountingBookService.exportToExcel(this.selectedProduct.id, dateFrom, dateTo, parcelNo)
      .subscribe({
        next: (blob) => {
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `So_chi_tiet_${this.selectedProduct.product_no}_${dateFrom}_${dateTo}.xlsx`;
          link.click();
          window.URL.revokeObjectURL(url);
          this.notifyService.notify('success', 'Xuất Excel thành công');
        },
        error: (error) => {
          console.error('Error exporting to Excel:', error);
          this.notifyService.notify('error', 'Có lỗi xảy ra khi xuất Excel');
        }
      });
  }
}
