import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { FormControl, FormGroup, FormBuilder } from '@angular/forms';
import { NotifierService } from 'angular-notifier';
import { ListComponentBase } from '../../shared/base';
import { ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { DatetimeDefaultFilterDialogComponent } from '../components/datetime-default-filter-dialog/datetime-default-filter-dialog.component';
import { DatetimeChooseFilterDialogComponent } from '../components/datetime-choose-filter-dialog/datetime-choose-filter-dialog.component';
import { CustomerTransactionService } from '../services/customer-transaction.service';

@Component({
  selector: 'app-follow-book-customer-transaction',
  templateUrl: './follow-book-customer-transaction.component.html',
  styleUrls: ['../shared/follow-book.component.scss', './follow-book-customer-transaction.component.scss']
})
export class FollowBookCustomerTransactionComponent extends ListComponentBase implements OnInit {
  displayedColumns = ['stt', 'date', 'medicine_name', 'ingredients', 'unit', 'quantity', 'customer_name', 'address'];
  columnsToDisplay = ['stt', 'date', 'medicine_name', 'ingredients', 'unit', 'quantity', 'customer_name', 'address'];
  columnsHeader = {
    'stt': 'TT',
    'date': 'Ngày tháng, năm',
    'medicine_name': 'Tên thuốc quy cách đóng gói',
    'ingredients': 'Hoạt chất nồng độ hàm lượng',
    'unit': 'Đơn vị tính',
    'quantity': 'Số lượng bán',
    'customer_name': 'Tên khách hàng',
    'address': 'Địa chỉ của khách hàng'
  };

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  isLoadingResults = false;
  dataSource = [];
  totalItems = 0;
  apiFilter: any = {};

  searchForm = new FormControl();
  timeFilter: FormGroup;
  titleTimeDefault = 'Tháng này';
  titleTimeChoose = 'Lựa chọn khác';
  currentDateFilter: any = {
    date_from: '',
    date_to: '',
    customer_id: null
  };

  constructor(
    private dialog: MatDialog,
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private notifyService: NotifierService,
    private customerTransactionService: CustomerTransactionService
  ) {
    super();
  }

  ngOnInit(): void {
    this.initDateFilter();
    this.buildFrom();
    this.apiFilter = this.buildFilterFromParams();
    this.loadData();
  }

  buildFrom() {
    this.timeFilter = this.fb.group({
      typeTime: ['default']
    });
  }

  buildFilterFromParams(): any {
    const filter: any = {};

    // Bỏ các tham số phân trang
    // Chỉ giữ lại filter theo customer_id và date
    const customerId = this.route.snapshot.queryParamMap.get('customer_id');
    if (customerId) {
      this.currentDateFilter.customer_id = customerId;
    }

    if (this.currentDateFilter) {
      filter.date_from = this.currentDateFilter.date_from;
      filter.date_to = this.currentDateFilter.date_to;
      filter.customer_id = this.currentDateFilter.customer_id;
    }

    return filter;
  }

  loadData(): void {
    this.isLoadingResults = true;

    this.customerTransactionService.getCustomerTransactions(this.apiFilter).subscribe(
      response => {
        if (response && response.body) {
          this.dataSource = [];
          let stt = 1;

          // Xử lý từng hóa đơn và hiển thị tất cả chi tiết
          response.body.forEach((invoice: any) => {
            if (invoice.invoiceDetails && invoice.invoiceDetails.length > 0) {
              invoice.invoiceDetails.forEach((detail: any) => {
                this.dataSource.push({
                  stt: stt++,
                  date: invoice.createdFormat,
                  medicine_name: detail.product ? detail.product.product_name : 'N/A',
                  ingredients: detail.product && detail.product.medicine ? detail.product.medicine.name : 'N/A',
                  unit: detail.base_unit,
                  quantity: detail.amount,
                  customer_name: invoice.customer ? invoice.customer.name : 'Khách lẻ',
                  address: invoice.customer ? invoice.customer.address : ''
                });
              });
            }
          });
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
      date_to: this.formatDate(today),
      customer_id: null
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
        this.currentDateFilter.date_from = result.date_from;
        this.currentDateFilter.date_to = result.date_to;
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
      data: {
        date_from: this.currentDateFilter.date_from,
        date_to: this.currentDateFilter.date_to
      },
      panelClass: 'date-filter-dialog'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.currentDateFilter.date_from = result.date_from;
        this.currentDateFilter.date_to = result.date_to;
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

    // Log thông tin xuất Excel
    console.log('Exporting data with filters:', this.currentDateFilter);

    this.customerTransactionService.exportToExcel(this.currentDateFilter).subscribe(
      (response: any) => {
        const blob = new Blob([response], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;

        // Đặt tên file với ngày tháng
        const dateStr = this.currentDateFilter.date_from ?
          `_${this.currentDateFilter.date_from}_${this.currentDateFilter.date_to}` :
          '';
        link.download = `so-theo-doi-khach-hang${dateStr}.xlsx`;

        // Tự động click để tải file
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
