import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { NotifierService } from 'angular-notifier';
import { EInvoiceService } from './e-invoice.service';
import { RegisterDialogComponent } from './register-dialog/register-dialog.component';
import { SyncDialogComponent } from './sync-dialog/sync-dialog.component';
import { LoadDialogComponent } from './load-dialog/load-dialog.component';
import { ListComponentBase } from '../../shared/base';
import { MatPaginator } from '@angular/material/paginator';
import { InvoiceDetailDialogComponent } from './invoice-detail-dialog.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-e-invoice',
  templateUrl: './e-invoice.component.html',
  styleUrls: ['./e-invoice.component.css']
})
export class EInvoiceComponent extends ListComponentBase implements OnInit {
  columnsHeader = {
    '#': '#',
    'InvoiceNo': 'Số hóa đơn',
    'InvoiceDate': 'Ngày lập',
    'SellerInfo': 'Thông tin người bán',
    'SumItemAmount': 'Tổng tiền chưa thuế',
    'SumTaxAmount': 'Tổng tiền thuế',
    'SumPaymentAmount': 'Tổng tiền thanh toán',
    'actions': 'Thao tác',
  };

  displayedColumns: string[] = [
    '#',
    'InvoiceNo',
    'InvoiceDate',
    'SellerInfo',
    'SumItemAmount',
    'SumTaxAmount',
    'SumPaymentAmount',
    'actions'
  ];
  columnsToDisplay: string[] = [
    '#',
    'InvoiceNo',
    'InvoiceDate',
    'SellerInfo',
    'SumItemAmount',
    'SumTaxAmount',
    'SumPaymentAmount',
    'actions'
  ];

  isLoadingResults = false;
  expandedElement: any | null = null;
  invoiceFilter = { MST: '', LastUpdate: '' };
  isLoggedIn = false;
  loading = false;

  @ViewChild(MatPaginator) paginator: MatPaginator;

  constructor(
    private dialog: MatDialog,
    private notifyService: NotifierService,
    private eInvoiceService: EInvoiceService,
    private snackBar: MatSnackBar,
    private fb: FormBuilder,
    private http: HttpClient
  ) {
    super();
  }

  ngOnInit(): void {}

  openRegisterDialog(): void {
    // Vừa mở modal VỪA gọi API login
    const dialogRef = this.dialog.open(RegisterDialogComponent, {
      width: '500px',
      disableClose: true
    });
    
    // Gọi API login song song với việc mở modal
    this.eInvoiceService.login().subscribe({
      next: (response) => {
        if (response && response.success && response.data && response.data.access_token) {
          localStorage.setItem('e-invoice-token', response.data.access_token);
          this.isLoggedIn = true;
        } else {
          this.notifyService.notify('error', 'Đăng nhập BKAV thất bại');
        }
      },
      error: (error) => {
        this.notifyService.notify('error', 'Đăng nhập BKAV thất bại');
        console.error('Login error:', error);
      }
    });
    
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.notifyService.notify('success', 'Đăng nhập cơ quan thuế thành công');
      }
    });
  }

  openSyncDialog(): void {
    const dialogRef = this.dialog.open(SyncDialogComponent, {
      width: '600px',
      disableClose: true
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.notifyService.notify('success', 'Đồng bộ hóa đơn thành công');
      }
    });
  }

  openLoadInvoiceDialog(): void {
    const dialogRef = this.dialog.open(LoadDialogComponent, {
      width: '400px',
      disableClose: true
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.invoiceFilter = result;
        this.loadData();
      }
    });
  }

  loadData(summary?: boolean): void {
    if (!this.invoiceFilter.MST || !this.invoiceFilter.LastUpdate) {
      this.dataSource = [];
      this.pageTotalCount = 0;
      return;
    }
    this.isLoadingResults = true;
    this.eInvoiceService.getInvoices(this.invoiceFilter.MST, this.invoiceFilter.LastUpdate).subscribe({
      next: (res: any) => {
        console.log('API response:', res);
        const arr = res?.data?.data;
        this.dataSource = Array.isArray(arr) ? arr : [];
        console.log('dataSource:', this.dataSource);
        this.pageTotalCount = this.dataSource.length;
        this.isLoadingResults = false;
        if (this.paginator) this.paginator.firstPage();
      },
      error: (err) => {
        this.notifyService.notify('error', 'Không thể tải hóa đơn!');
        this.isLoadingResults = false;
      }
    });
  }

  onMatPageChange(event: any) {
    this.page = event.pageIndex + 1;
    this.pageSize = event.pageSize;
  }

  openInvoiceDetailDialog(element: any) {
    this.dialog.open(InvoiceDetailDialogComponent, {
      width: '800px',
      data: element
    });
  }

  openHelpGuide(): void {
    window.open('https://rx20.vn/huong-dan-cai-dat-hoa-don-dien-tu/', '_blank');
  }

}