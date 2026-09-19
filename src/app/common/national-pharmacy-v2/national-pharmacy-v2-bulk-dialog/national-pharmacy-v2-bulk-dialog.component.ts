import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { EMPTY, from, of, Subscription } from 'rxjs';
import { catchError, concatMap, map } from 'rxjs/operators';
import { NationalPharmacyV2Service } from '../national-pharmacy-v2.service';
import {
  NationalPharmacyV2BulkDialogData,
  NationalPharmacyV2ReasonOption,
  NationalPharmacyV2Result,
} from '../national-pharmacy-v2.model';

/** Kết quả của từng phiếu trong lượt gửi */
type BulkRowStatus = 'pending' | 'running' | 'sent' | 'already' | 'failed' | 'ineligible';

interface BulkRow {
  id: string | number;
  referenceNumber: string;
  status: BulkRowStatus;
  /** Lý do lỗi / trạng thái trả về */
  message: string;
  /** Sản phẩm không gửi vì không phải thuốc (TPCN, mỹ phẩm, TBYT) */
  skipped: string[];
}

/**
 * Liên thông hàng loạt nhiều phiếu lên CSDL Dược quốc gia v1.1.
 *
 * Thay cho nút "Liên thông" hàng loạt cũ vốn gọi API của hệ thống liên thông Cục
 * Quản lý Dược (đã đóng, luôn báo "đang bảo trì").
 *
 * Gửi LẦN LƯỢT từng phiếu chứ không song song: CSDL Dược giới hạn tần suất và chặn
 * đăng nhập khi bị gọi dồn, còn backend khoá theo từng phiếu để chống gửi trùng.
 * Không truyền `force`: phiếu đã được tiếp nhận thì backend trả `already_synced` và
 * không gửi lại — v1.1 không có API xoá, gửi trùng là bản ghi thừa vĩnh viễn.
 */
@Component({
  selector: 'app-national-pharmacy-v2-bulk-dialog',
  templateUrl: './national-pharmacy-v2-bulk-dialog.component.html',
  styleUrls: ['./national-pharmacy-v2-bulk-dialog.component.css']
})
export class NationalPharmacyV2BulkDialogComponent implements OnInit, OnDestroy {

  stage: 'confirm' | 'running' | 'done' = 'confirm';
  rows: BulkRow[] = [];

  /** Lý do nhập/xuất, chỉ dùng cho phiếu kho */
  reason: string = null;
  reasonOptions: NationalPharmacyV2ReasonOption[] = [];
  loadingReasons = false;
  reasonError: string = null;

  /** Người dùng bấm Dừng: gửi xong phiếu đang chạy thì thôi, không gửi tiếp */
  private stopRequested = false;
  private sub: Subscription = null;

  /** Có phiếu nào vừa được gửi — để màn danh sách tải lại */
  changed = false;

  constructor(
    public dialogRef: MatDialogRef<NationalPharmacyV2BulkDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: NationalPharmacyV2BulkDialogData,
    public service: NationalPharmacyV2Service,
  ) {
  }

  ngOnInit() {
    this.rows = (this.data.items || []).map(item => ({
      id: item.id,
      referenceNumber: item.referenceNumber,
      status: item.ineligibleReason ? 'ineligible' : 'pending',
      message: item.ineligibleReason || '',
      skipped: [],
    } as BulkRow));

    if (this.data.source === 'warehouse') {
      this.loadReasonOptions();
    }
  }

  ngOnDestroy() {
    if (this.sub) {
      this.sub.unsubscribe();
    }
  }

  get pendingRows(): BulkRow[] {
    return this.rows.filter(row => row.status === 'pending');
  }

  count(status: BulkRowStatus): number {
    return this.rows.filter(row => row.status === status).length;
  }

  get processed(): number {
    return this.rows.filter(row => ['sent', 'already', 'failed'].indexOf(row.status) !== -1).length;
  }

  get total(): number {
    return this.rows.filter(row => row.status !== 'ineligible').length;
  }

  get canStart(): boolean {
    if (this.pendingRows.length === 0) {
      return false;
    }
    // Phiếu kho bắt buộc có lý do nhập/xuất
    return this.data.source !== 'warehouse' || !!this.reason;
  }

  loadReasonOptions() {
    this.loadingReasons = true;
    this.service.getWarehouseReasonOptions(this.data.warehouseType || 'import').subscribe(res => {
      this.loadingReasons = false;
      this.reasonOptions = res.options || [];

      // Mặc định giống liên thông từng phiếu: nhập từ NCC / xuất trả NCC
      const preferred = this.data.warehouseType === 'return' ? 'return' : 'supplier';
      const matched = this.reasonOptions.find(option => option.value === preferred);
      this.reason = matched ? matched.value : (this.reasonOptions.length ? this.reasonOptions[0].value : null);
    }, error => {
      this.loadingReasons = false;
      this.reasonError = error?.error?.message || 'Không lấy được danh sách lý do nhập/xuất.';
    });
  }

  start() {
    if (!this.canStart || this.stage !== 'confirm') {
      return;
    }

    this.stage = 'running';
    this.stopRequested = false;
    this.dialogRef.disableClose = true;

    const queue = this.pendingRows;

    // concatMap chỉ gọi hàm chiếu khi phiếu trước đã xong, nên kiểm cờ Dừng ở đây mới
    // có tác dụng; đặt takeWhile trước concatMap thì cả hàng đợi đã được phát ra ngay.
    this.sub = from(queue).pipe(
      concatMap(row => {
        if (this.stopRequested) {
          return EMPTY;
        }
        row.status = 'running';
        return this.service.connect(this.data.source, row.id, {reason: this.reason}).pipe(
          map(res => ({row, res})),
          catchError(error => of({
            row,
            res: {
              success: false,
              message: error?.error?.message || 'Không kết nối được máy chủ.',
            } as NationalPharmacyV2Result,
          })),
        );
      }),
    ).subscribe(({row, res}) => this.applyResult(row, res), () => this.finish(), () => this.finish());
  }

  stop() {
    this.stopRequested = true;
  }

  private applyResult(row: BulkRow, res: NationalPharmacyV2Result) {
    row.skipped = res.skipped || [];

    if (res.success) {
      this.changed = true;
      row.status = 'sent';
      row.message = res.status_label ? 'Trạng thái: ' + res.status_label : 'Đã gửi.';
      return;
    }

    if (res.already_synced) {
      row.status = 'already';
      row.message = res.message || 'Phiếu đã được liên thông trước đó.';
      return;
    }

    // Backend đã gộp mọi lỗi dữ liệu vào `message` (getErrorSummary), nối thêm
    // `errors` sẽ in mỗi lỗi hai lần.
    row.status = 'failed';
    row.message = res.message || (res.errors || []).join(' ') || 'Liên thông thất bại.';
  }

  private finish() {
    // Phiếu chưa kịp gửi vì người dùng bấm Dừng thì trả về trạng thái chờ
    this.rows.forEach(row => {
      if (row.status === 'running') {
        row.status = 'pending';
      }
    });

    this.stage = 'done';
    this.dialogRef.disableClose = false;
  }

  statusLabel(status: BulkRowStatus): string {
    switch (status) {
      case 'running':
        return 'Đang gửi';
      case 'sent':
        return 'Đã gửi';
      case 'already':
        return 'Đã liên thông trước đó';
      case 'failed':
        return 'Lỗi';
      case 'ineligible':
        return 'Không gửi';
      default:
        return 'Chờ gửi';
    }
  }

  close() {
    this.dialogRef.close({changed: this.changed});
  }
}
