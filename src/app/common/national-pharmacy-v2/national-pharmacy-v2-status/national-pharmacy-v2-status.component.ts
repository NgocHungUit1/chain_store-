import { Component, Input } from '@angular/core';
import { NationalPharmacyV2Service } from '../national-pharmacy-v2.service';
import { NationalPharmacyV2Transaction } from '../national-pharmacy-v2.model';

/**
 * Hiển thị trạng thái liên thông CSDL Dược quốc gia của một phiếu.
 *
 * Trước đây trạng thái chỉ nằm trong nhãn của nút "Liên thông", lẫn giữa các nút
 * hành động khác nên rất khó biết phiếu đã liên thông hay chưa. Component này tách
 * trạng thái ra thành một dòng thông tin riêng, dùng chung cho cả 4 nghiệp vụ
 * (nhập/xuất kho, hoá đơn, trả hàng, kiểm kho) để nội dung luôn khớp nhau.
 */
@Component({
  selector: 'app-national-pharmacy-v2-status',
  templateUrl: './national-pharmacy-v2-status.component.html',
  styleUrls: ['./national-pharmacy-v2-status.component.css']
})
export class NationalPharmacyV2StatusComponent {

  /** Bản ghi liên thông, lấy qua ?expand=nationalPharmacyV2 */
  @Input() transaction: NationalPharmacyV2Transaction | null = null;

  /** Nhãn đứng trước chip trạng thái */
  @Input() label = 'Liên thông Dược Quốc gia:';

  /** Ẩn phần mã giao dịch / thời gian khi chỗ hiển thị quá hẹp */
  @Input() compact = false;

  constructor(public npV2Service: NationalPharmacyV2Service) {
  }

  /** Class chip theo trạng thái, map sang bộ label-* có sẵn trong app.scss */
  get chipClass(): string {
    if (!this.transaction || !this.transaction.status) {
      return 'label-default';
    }

    switch (this.npV2Service.statusColor(this.transaction.status)) {
      case 'success':
        return 'label-success';
      case 'primary':
        return 'label-primary';
      case 'warn':
        return 'label-danger';
      default:
        return 'label-default';
    }
  }

  /** Icon gợi ý nhanh trạng thái, đọc được cả khi người dùng không phân biệt màu */
  get chipIcon(): string {
    if (!this.transaction || !this.transaction.status) {
      return 'cloud_off';
    }
    if (this.npV2Service.isPending(this.transaction)) {
      return 'hourglass_empty';
    }
    if (this.npV2Service.isConnected(this.transaction)) {
      return 'cloud_done';
    }
    return 'error_outline';
  }

  /** Thời điểm tra trạng thái gần nhất, không có thì lấy lúc gửi */
  get timestamp(): number | null {
    if (!this.transaction) {
      return null;
    }
    return this.transaction.synced_at || this.transaction.created_at || null;
  }
}
