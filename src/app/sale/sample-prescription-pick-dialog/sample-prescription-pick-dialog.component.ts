import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { NotifierService } from 'angular-notifier';
import { SamplePrescriptionService } from '../../sample-prescription/sample-prescription.service';
import { SamplePrescriptionFilter } from '../../sample-prescription/sample-prescription.model';

/**
 * Chọn đơn thuốc mẫu ở màn bán hàng (thay cho việc đổi chế độ ô tìm kiếm).
 * Có nút đồng bộ bộ đơn mẫu của cửa hàng chuẩn về cửa hàng đang dùng.
 * Đóng với {id, name} của đơn được chọn; màn bán hàng tự hỏi số liều và đổ thuốc vào hoá đơn.
 */
@Component({
  selector: 'app-sample-prescription-pick-dialog',
  templateUrl: './sample-prescription-pick-dialog.component.html',
})
export class SamplePrescriptionPickDialogComponent implements OnInit, OnDestroy {

  displayedColumns = ['no', 'name', 'total_amount'];
  rows: any[] = [];
  keyword = '';
  loading = false;
  syncing = false;

  private keyword$ = new Subject<string>();
  private sub: Subscription;

  constructor(
    public dialogRef: MatDialogRef<SamplePrescriptionPickDialogComponent>,
    private samplePrescriptionService: SamplePrescriptionService,
    private notifySer: NotifierService,
  ) { }

  ngOnInit() {
    this.sub = this.keyword$.pipe(debounceTime(300), distinctUntilChanged())
      .subscribe(() => this.load());
    this.load();
  }

  ngOnDestroy() {
    if (this.sub) {
      this.sub.unsubscribe();
    }
  }

  onKeywordChange(value: string) {
    this.keyword = value;
    this.keyword$.next(value);
  }

  load() {
    const filter = new SamplePrescriptionFilter();
    filter.status = '10';
    filter.keyword = encodeURIComponent((this.keyword || '').trim());
    filter.pageSize = 200;
    this.loading = true;
    this.samplePrescriptionService.getList(filter).subscribe(res => {
      this.rows = res.body || [];
      this.loading = false;
    }, () => {
      this.loading = false;
    });
  }

  sync() {
    this.syncing = true;
    this.samplePrescriptionService.syncStandard().subscribe(res => {
      this.syncing = false;
      if (!res.created) {
        this.notifySer.notify('info', 'Cửa hàng đã có đủ đơn thuốc mẫu của hệ thống.');
        return;
      }
      this.notifySer.notify('success', 'Đã thêm ' + res.created + ' đơn thuốc mẫu'
        + (res.created_products ? ', tạo mới ' + res.created_products + ' sản phẩm (tồn 0, cần nhập hàng)' : '') + '.');
      this.load();
    }, err => {
      this.syncing = false;
      const message = err && err.error && err.error.message ? err.error.message : 'Đồng bộ đơn thuốc mẫu không thành công.';
      this.notifySer.notify('error', message);
    });
  }

  pick(row) {
    this.dialogRef.close({id: row.id, name: row.name});
  }
}
