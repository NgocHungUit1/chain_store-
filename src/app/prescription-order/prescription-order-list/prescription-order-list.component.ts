import {Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {Subject} from 'rxjs';
import {debounceTime, distinctUntilChanged, takeUntil} from 'rxjs/operators';
import {NotifierService} from 'angular-notifier';
import {
  ORDER_STATUS_CLASS,
  PrescriptionOrderRow,
  PrescriptionOrderService,
  PrescriptionOrderSummary
} from '../prescription-order.service';
import {getAllPermissions} from '../../shared/permission-storage';

/** Thứ tự tab trạng thái; '' = tất cả */
const TAB_ORDER = ['new', 'confirmed', 'preparing', 'delivering', 'completed', 'returned', 'cancelled', ''];

@Component({
  selector: 'app-prescription-order-list',
  templateUrl: './prescription-order-list.component.html',
  styleUrls: ['../prescription-order.scss', './prescription-order-list.component.scss']
})
export class PrescriptionOrderListComponent implements OnInit, OnDestroy {
  tabs: { status: string, label: string, count: number }[] = [];
  status = 'new';
  keyword = '';
  dateFrom = '';
  dateTo = '';
  page = 1;
  perPage = 20;
  total = 0;
  rows: PrescriptionOrderRow[] = [];
  loading = false;
  statusClass = ORDER_STATUS_CLASS;
  canView = false;

  private keyword$ = new Subject<string>();
  private destroy$ = new Subject<void>();

  constructor(
    private orderSer: PrescriptionOrderService,
    private notify: NotifierService,
    private router: Router,
    private route: ActivatedRoute,
  ) {
  }

  ngOnInit(): void {
    this.canView = getAllPermissions().indexOf('Prescription-Order.View') >= 0;
    const qp = this.route.snapshot.queryParamMap;
    if (qp.has('status')) {
      this.status = qp.get('status');
    }
    this.keyword$.pipe(debounceTime(350), distinctUntilChanged(), takeUntil(this.destroy$)).subscribe(() => {
      this.page = 1;
      this.load();
    });
    this.loadSummary();
    this.load();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadSummary() {
    this.orderSer.summary().subscribe((res: PrescriptionOrderSummary[]) => {
      const byStatus = {};
      let total = 0;
      (res || []).forEach(s => {
        byStatus[s.status] = s;
        total += s.count;
      });
      this.tabs = TAB_ORDER.map(st => st === ''
        ? {status: '', label: 'Tất cả', count: total}
        : {status: st, label: byStatus[st] ? byStatus[st].label : st, count: byStatus[st] ? byStatus[st].count : 0});
    });
  }

  load() {
    this.loading = true;
    this.orderSer.list({
      status: this.status,
      keyword: this.keyword.trim(),
      date_from: this.dateFrom,
      date_to: this.dateTo,
      page: this.page,
      perPage: this.perPage,
    }).subscribe(res => {
      this.rows = res.body || [];
      this.total = +res.headers.get('X-Pagination-Total-Count') || this.rows.length;
      this.loading = false;
    }, err => {
      this.loading = false;
      this.notify.notify('error', (err && err.error && err.error.message) || 'Không tải được danh sách đơn đặt thuốc.');
    });
  }

  selectTab(status: string) {
    if (this.status === status) {
      return;
    }
    this.status = status;
    this.page = 1;
    // Giữ tab trên URL để quay lại từ màn chi tiết vẫn đúng tab
    this.router.navigate([], {relativeTo: this.route, queryParams: {status: status || null}, replaceUrl: true});
    this.load();
  }

  onKeyword(value: string) {
    this.keyword = value;
    this.keyword$.next(value);
  }

  applyDates() {
    this.page = 1;
    this.load();
  }

  clearFilters() {
    this.keyword = '';
    this.dateFrom = '';
    this.dateTo = '';
    this.page = 1;
    this.load();
  }

  refresh() {
    this.loadSummary();
    this.load();
  }

  onPage(e: { pageIndex: number, pageSize: number }) {
    this.page = e.pageIndex + 1;
    this.perPage = e.pageSize;
    this.load();
  }

  open(row: PrescriptionOrderRow) {
    if (this.canView) {
      this.router.navigate([row.id], {relativeTo: this.route});
    }
  }
}
