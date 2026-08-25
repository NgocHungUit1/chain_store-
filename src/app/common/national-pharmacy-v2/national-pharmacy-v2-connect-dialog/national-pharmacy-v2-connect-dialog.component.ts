import { Component, Inject, OnInit, Optional } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { NotifierService } from 'angular-notifier';
import { NationalPharmacyV2Service } from '../national-pharmacy-v2.service';
import {
  NationalPharmacyV2DialogData,
  NationalPharmacyV2ReasonOption,
  NationalPharmacyV2Result,
  NationalPharmacyV2Transaction,
} from '../national-pharmacy-v2.model';

/**
 * Dialog liên thông một phiếu lên CSDL Dược quốc gia v1.1.
 *
 * Với phiếu kho, người dùng phải chọn lý do nhập/xuất (mục 6.4.1, 6.4.2) vì cùng
 * một loại phiếu trong hệ thống có thể ứng với nhiều lý do bên CSDL Dược
 * (nhập từ NCC / nhập tồn đầu kỳ, xuất trả NCC / xuất huỷ...).
 *
 * v1.1 không có API xoá hay sửa giao dịch, nên phiếu đã tiếp nhận chỉ được đẩy lại
 * sau khi người dùng xác nhận — tránh tạo bản ghi trùng ở phía cơ quan quản lý.
 */
@Component({
  selector: 'app-national-pharmacy-v2-connect-dialog',
  templateUrl: './national-pharmacy-v2-connect-dialog.component.html',
  styleUrls: ['./national-pharmacy-v2-connect-dialog.component.css']
})
export class NationalPharmacyV2ConnectDialogComponent implements OnInit {

  isLoading = false;

  /** Lý do nhập/xuất, chỉ dùng cho phiếu kho */
  reason: string = null;
  reasonOptions: NationalPharmacyV2ReasonOption[] = [];
  isRetail = true;

  /** Lần liên thông gần nhất */
  transaction: NationalPharmacyV2Transaction = null;

  /** Kết quả lượt gửi vừa rồi */
  result: NationalPharmacyV2Result = null;

  /** Đã có thay đổi cần trả về cho component cha */
  private changed = false;

  /** Người dùng đã bấm "Đẩy lại" một lần và đang được hỏi xác nhận */
  resubmitConfirming = false;

  constructor(
    public dialogRef: MatDialogRef<NationalPharmacyV2ConnectDialogComponent>,
    public service: NationalPharmacyV2Service,
    public notifySer: NotifierService,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: NationalPharmacyV2DialogData
  ) {
    this.transaction = data.transaction || null;
  }

  ngOnInit(): void {
    if (this.data.source === 'warehouse') {
      this.loadReasonOptions();
    }

    this.loadSavedStatus();
  }

  /**
   * Nạp trạng thái lần liên thông gần nhất khi mở dialog.
   *
   * Không dựa vào `data.transaction` do component cha truyền vào: danh sách nạp
   * trước lúc phiếu được gửi sẽ không có quan hệ nationalPharmacyV2, khi đó mở
   * dialog lên sẽ trống trơn dù phiếu đã liên thông rồi.
   *
   * Đọc trạng thái đã lưu ở backend (không gọi sang CSDL Dược) nên nhanh, và im
   * lặng khi phiếu chưa từng liên thông — đó là trường hợp bình thường.
   */
  private loadSavedStatus() {
    this.service.checkStatus(this.data.source, this.data.id, true).subscribe(res => {
      if (res.success) {
        this.transaction = this.service.toTransaction(res, this.transaction);
      }
    }, () => {
      // Không báo lỗi: đây chỉ là nạp thông tin nền khi mở dialog
    });
  }

  get title(): string {
    const titles = {
      'warehouse': this.data.warehouseType === 'return' ? 'Phiếu xuất hàng' : 'Phiếu nhập hàng',
      'invoice': 'Hoá đơn bán lẻ',
      'stock-take': 'Phiếu kiểm kho',
      'returns': 'Phiếu khách trả hàng',
    };

    // Ghi rõ đích đến để không lẫn với liên thông hệ thống cũ
    return (titles[this.data.source] ? titles[this.data.source] + ' — ' : '') + 'Liên thông CSDL Dược Quốc gia';
  }

  get isConnected(): boolean {
    return this.service.isConnected(this.transaction);
  }

  /** Đã có mã giao dịch: tra được trạng thái kể cả khi phiếu bị từ chối */
  get hasTransaction(): boolean {
    return this.service.hasTransaction(this.transaction);
  }

  /** Lượt gửi trước mất kết nối, chưa rõ CSDL Dược đã nhận hay chưa */
  get isUncertain(): boolean {
    return this.service.isUncertain(this.transaction) || !!(this.result && this.result.uncertain);
  }

  get canSubmit(): boolean {
    if (this.isLoading) {
      return false;
    }
    // Phiếu kho bắt buộc chọn lý do
    return this.data.source !== 'warehouse' || !!this.reason;
  }

  loadReasonOptions() {
    this.isLoading = true;
    this.service.getWarehouseReasonOptions(this.data.warehouseType || 'import').subscribe(res => {
      this.isLoading = false;
      this.reasonOptions = res.options || [];
      this.isRetail = res.is_retail;

      // Mặc định theo loại phiếu: nhập từ nhà cung cấp / xuất trả nhà cung cấp
      const preferred = this.data.warehouseType === 'return' ? 'return' : 'supplier';
      const matched = this.reasonOptions.find(option => option.value === preferred);
      this.reason = matched ? matched.value : (this.reasonOptions.length ? this.reasonOptions[0].value : null);
    }, error => {
      this.isLoading = false;
      this.notifySer.notify('error', error?.error?.message || 'Không lấy được danh sách lý do nhập/xuất.');
    });
  }

  /**
   * @param force đẩy lại phiếu đã được tiếp nhận
   */
  submit(force = false) {
    // Chặn cứng ngay trong handler: [disabled] chỉ có hiệu lực sau change detection
    // nên double-click vẫn kịp gọi hàm hai lần. v1.1 không có API xoá giao dịch, một
    // lần gửi trùng là một bản ghi thừa vĩnh viễn ở phía cơ quan quản lý.
    if (this.isLoading) {
      return;
    }

    // Đẩy lại phiếu đã được tiếp nhận phải qua một bước xác nhận
    if (force && !this.resubmitConfirming) {
      this.resubmitConfirming = true;
      return;
    }

    this.isLoading = true;
    this.resubmitConfirming = false;
    this.result = null;
    this.dialogRef.disableClose = true;

    this.service.connect(this.data.source, this.data.id, {reason: this.reason, force}).subscribe(res => {
      this.isLoading = false;
      this.dialogRef.disableClose = false;
      this.result = res;

      if (res.success) {
        this.changed = true;
        this.transaction = this.service.toTransaction(res, this.transaction);
        this.notifySer.notify('success', 'Đã gửi phiếu lên CSDL Dược quốc gia.');
        return;
      }

      // already_synced không phải lỗi: hỏi lại người dùng có muốn đẩy lại không
      if (!res.already_synced) {
        this.notifySer.notify('error', res.message || 'Liên thông thất bại.');
      }
    }, error => {
      this.isLoading = false;
      this.dialogRef.disableClose = false;
      this.notifySer.notify('error', error?.error?.message || 'Có lỗi xảy ra khi liên thông.');
    });
  }

  cancelResubmit() {
    this.resubmitConfirming = false;
  }

  checkStatus() {
    if (this.isLoading) {
      return;
    }

    this.isLoading = true;

    this.service.checkStatus(this.data.source, this.data.id).subscribe(res => {
      this.isLoading = false;
      this.result = res;

      if (res.success) {
        this.changed = true;
        this.transaction = this.service.toTransaction(res, this.transaction);

        // Tra được trạng thái không có nghĩa phiếu đã vào: báo đúng theo trạng thái
        // thật, kèm lý do để người dùng biết phải sửa gì.
        const label = this.service.statusLabel(res.status);
        const isProblem = !this.service.isConnected(this.transaction);

        this.notifySer.notify(isProblem ? 'error' : 'success',
          'Trạng thái: ' + label + (res.error_message ? ' — ' + res.error_message : ''));
      } else {
        this.notifySer.notify('error', res.message || 'Không tra được trạng thái.');
      }
    }, error => {
      this.isLoading = false;
      this.notifySer.notify('error', error?.error?.message || 'Có lỗi xảy ra khi tra trạng thái.');
    });
  }

  statusLabel(status: string): string {
    return this.service.statusLabel(status);
  }

  close() {
    if (this.isLoading) {
      return;
    }

    this.dialogRef.close(this.changed ? {event: 'changed', transaction: this.transaction} : {event: 'cancel'});
  }
}
