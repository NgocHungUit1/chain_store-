import {Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {MatDialog} from '@angular/material/dialog';
import {Subject} from 'rxjs';
import {debounceTime, distinctUntilChanged, takeUntil} from 'rxjs/operators';
import {ClinicPartnerRow, ClinicPartnerService, PARTNER_STATUS_CLASS} from './clinic-partner.service';
import {ClinicPartnerFormDialogComponent} from './clinic-partner-form-dialog.component';
import {getAllPermissions} from '../shared/permission-storage';

/** Tab theo việc cần làm; một tab có thể gom nhiều trạng thái. '' = tất cả */
const TABS = [
  {key: 'pending', label: 'Chờ duyệt', statuses: ['pending']},
  {key: 'active', label: 'Đang hoạt động', statuses: ['active', 'activating']},
  {key: 'suspended', label: 'Tạm ngưng', statuses: ['suspended']},
  {key: 'draft', label: 'Nháp / bị từ chối', statuses: ['draft', 'rejected']},
  {key: 'terminated', label: 'Ngừng hợp tác', statuses: ['terminated']},
  {key: '', label: 'Tất cả', statuses: []},
];

@Component({
  selector: 'app-clinic-partner-list',
  templateUrl: './clinic-partner-list.component.html',
  styleUrls: ['../prescription-order/prescription-order.scss', '../prescription-order/prescription-order-list/prescription-order-list.component.scss',
    './clinic-partner.scss', './clinic-partner-list.component.scss']
})
export class ClinicPartnerListComponent implements OnInit, OnDestroy {
  tabs = TABS;
  tab = 'pending';
  keyword = '';
  rows: ClinicPartnerRow[] = [];
  counts: { [status: string]: number } = {};
  loading = false;
  canCreate = false;
  statusClass = PARTNER_STATUS_CLASS;

  private keyword$ = new Subject<string>();
  private destroy$ = new Subject<void>();

  constructor(
    private partnerSer: ClinicPartnerService,
    private dialog: MatDialog,
    private router: Router,
    private route: ActivatedRoute,
  ) {
  }

  ngOnInit(): void {
    this.canCreate = getAllPermissions().indexOf('Clinic-Partner.Create') >= 0;
    const qp = this.route.snapshot.queryParamMap;
    if (qp.has('tab')) {
      this.tab = qp.get('tab');
    }
    this.keyword$.pipe(debounceTime(350), distinctUntilChanged(), takeUntil(this.destroy$)).subscribe(() => this.load());
    this.load(true);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /** Lần đầu: không có hồ sơ chờ duyệt thì mở tab Đang hoạt động cho đỡ trống */
  load(first = false) {
    this.loading = true;
    const tab = TABS.find(t => t.key === this.tab) || TABS[0];
    this.partnerSer.list(tab.statuses.join(','), this.keyword.trim()).subscribe(res => {
      this.counts = res.counts || {};
      this.loading = false;
      if (first && this.tab === 'pending' && !this.counts['pending'] && !this.route.snapshot.queryParamMap.has('tab')
        && Object.keys(this.counts).length) {
        this.selectTab('active');
        return;
      }
      this.rows = res.items || [];
    }, () => this.loading = false);
  }

  countOf(t: { statuses: string[] }): number {
    const statuses = t.statuses.length ? t.statuses : Object.keys(this.counts);
    return statuses.reduce((sum, s) => sum + (this.counts[s] || 0), 0);
  }

  selectTab(key: string) {
    this.tab = key;
    this.router.navigate([], {relativeTo: this.route, queryParams: {tab: key || null}, replaceUrl: true});
    this.load();
  }

  onKeyword(value: string) {
    this.keyword = value;
    this.keyword$.next(value);
  }

  open(row: ClinicPartnerRow) {
    this.router.navigate([row.id], {relativeTo: this.route});
  }

  openCreate() {
    this.dialog.open(ClinicPartnerFormDialogComponent, {width: '760px', maxWidth: '96vw', data: {partner: null}, autoFocus: false})
      .afterClosed().subscribe(saved => {
        if (saved) {
          this.router.navigate([saved.id], {relativeTo: this.route});
        }
      });
  }
}
