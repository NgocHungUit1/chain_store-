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
import { forkJoin } from 'rxjs';

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
    const perPage = 50;

    // BE giới hạn per-page tối đa 50 -> lấy trang 1 rồi lặp lấy hết các trang còn lại,
    // gom toàn bộ hóa đơn trong kỳ (sổ phải hiển thị đủ, không chỉ trang đầu).
    this.customerTransactionService.getCustomerTransactions(this.apiFilter, 1, perPage).subscribe(
      response => {
        const pageCount = parseInt(response.headers.get('X-Pagination-Page-Count') || '1', 10) || 1;
        const allInvoices: any[] = (response && response.body) ? [...response.body] : [];

        if (pageCount <= 1) {
          this.buildDataSource(allInvoices);
          this.isLoadingResults = false;
          return;
        }

        const requests = [];
        for (let p = 2; p <= pageCount; p++) {
          requests.push(this.customerTransactionService.getCustomerTransactions(this.apiFilter, p, perPage));
        }
        forkJoin(requests).subscribe(
          (responses: any[]) => {
            responses.forEach(r => {
              if (r && r.body) {
                allInvoices.push(...r.body);
              }
            });
            this.buildDataSource(allInvoices);
            this.isLoadingResults = false;
          },
          error => {
            console.error('Error loading data (pages):', error);
            this.buildDataSource(allInvoices);
            this.isLoadingResults = false;
            this.notifyService.notify('error', 'Có lỗi xảy ra khi tải dữ liệu');
          }
        );
      },
      error => {
        console.error('Error loading data:', error);
        this.isLoadingResults = false;
        this.notifyService.notify('error', 'Có lỗi xảy ra khi tải dữ liệu');
      }
    );
  }

  // Dựng danh sách dòng chi tiết từ TẤT CẢ hóa đơn đã gom (mỗi invoiceDetail = 1 dòng)
  private buildDataSource(invoices: any[]): void {
    this.dataSource = [];
    let stt = 1;
    invoices.forEach((invoice: any) => {
      if (invoice.invoiceDetails && invoice.invoiceDetails.length > 0) {
        // Khách đã trả hàng thì trừ khỏi số bán (theo product_id). Trả hết -> ẩn dòng,
        // trả một phần -> giảm số. Gom tổng số đã trả của từng thuốc trên hóa đơn này.
        const returnedByProduct = this.buildReturnedMap(invoice);
        invoice.invoiceDetails.forEach((detail: any) => {
          const soldQty = Number(detail.amount) || 0;
          const productId = detail.product_id != null ? detail.product_id
            : (detail.product ? detail.product.id : null);
          const remainReturn = productId != null ? (returnedByProduct[productId] || 0) : 0;
          // Trừ phần đã trả; số còn lại thực khách giữ
          const reduce = Math.min(soldQty, remainReturn);
          const netQty = soldQty - reduce;
          if (productId != null) {
            returnedByProduct[productId] = remainReturn - reduce; // dùng dần cho các dòng cùng thuốc
          }
          if (netQty <= 0) {
            return; // trả hết -> không lên sổ
          }
          this.dataSource.push({
            stt: stt++,
            date: invoice.createdFormat,
            medicine_name: detail.product ? detail.product.product_name : 'N/A',
            ingredients: detail.product && detail.product.medicine ? detail.product.medicine.name : 'N/A',
            unit: detail.base_unit,
            quantity: netQty,
            customer_name: invoice.customer ? invoice.customer.name : 'Khách lẻ',
            // Ưu tiên địa chỉ khách hàng; nếu không có (vd khách lẻ) thì lấy địa chỉ trên đơn thuốc (KSĐB)
            address: (invoice.customer && invoice.customer.address)
              ? invoice.customer.address
              : (invoice.prescription ? (invoice.prescription.address || '') : '')
          });
        });
      }
    });
    this.totalItems = this.dataSource.length;
  }

  // Tổng số lượng đã trả theo từng product_id của 1 hóa đơn (gộp mọi phiếu trả).
  private buildReturnedMap(invoice: any): { [productId: number]: number } {
    const map: { [productId: number]: number } = {};
    const returns = invoice.returns || [];
    returns.forEach((ret: any) => {
      const details = ret.detail || ret.detailInfo || [];
      details.forEach((rd: any) => {
        const pid = rd.product_id != null ? rd.product_id : (rd.product ? rd.product.id : null);
        if (pid == null) { return; }
        map[pid] = (map[pid] || 0) + (Number(rd.amount) || 0);
      });
    });
    return map;
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
