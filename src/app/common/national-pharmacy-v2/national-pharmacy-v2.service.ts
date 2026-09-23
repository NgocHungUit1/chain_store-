import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  NationalDrug,
  NationalPharmacyV2ReasonOptionsResult,
  NationalPharmacyV2Result,
  NationalPharmacyV2Source,
  NationalPharmacyV2Transaction,
  NP_V2_STATUS,
  NP_V2_STATUS_COLOR,
  NP_V2_STATUS_LABEL,
  WarehouseType,
} from './national-pharmacy-v2.model';

/**
 * Gọi các API liên thông CSDL Dược quốc gia v1.1 ở backend.
 *
 * Cùng một service cho cả 4 nghiệp vụ vì backend đặt tên action giống nhau
 * (connect-v2, check-status-v2) trên từng controller.
 */
@Injectable({
  providedIn: 'root'
})
export class NationalPharmacyV2Service {

  /** Field expand cần thêm khi lấy danh sách/chi tiết để có trạng thái liên thông */
  static readonly EXPAND_FIELD = 'nationalPharmacyV2';

  constructor(private http: HttpClient) {
  }

  /**
   * Tìm thuốc trong danh mục thuốc CSDL Dược quốc gia đã đồng bộ về RX20.
   *
   * Tìm theo tên, số đăng ký (cả số đăng ký cũ), hoạt chất, hãng sản xuất; gõ nhiều
   * từ thì mỗi từ phải khớp ít nhất một trong các trường đó. Chỉ đọc danh mục trong
   * RX20, không gọi sang CSDL Dược.
   */
  searchDrugs(q: string, page = 1): Observable<{ items: NationalDrug[], total: number, page: number, page_size: number }> {
    const url = environment.apiUrl + '/product/national-search?q=' + encodeURIComponent(q || '') + '&page=' + page;
    return this.http.get<{ items: NationalDrug[], total: number, page: number, page_size: number }>(url);
  }

  /**
   * Đẩy phiếu lên CSDL Dược quốc gia.
   *
   * @param source nghiệp vụ gốc
   * @param id id phiếu
   * @param options reason (chỉ phiếu kho), force = đẩy lại phiếu đã tiếp nhận
   */
  connect(
    source: NationalPharmacyV2Source,
    id: string | number,
    options: { reason?: string; force?: boolean } = {}
  ): Observable<NationalPharmacyV2Result> {
    let url = environment.apiUrl + '/' + source + '/connect-v2?id=' + id;

    if (options.reason) {
      url += '&reason=' + encodeURIComponent(options.reason);
    }
    if (options.force) {
      url += '&force=1';
    }

    return this.http.post<NationalPharmacyV2Result>(url, {});
  }

  /**
   * Tra trạng thái xử lý của phiếu đã liên thông. CSDL Dược xử lý bất đồng bộ nên
   * phiếu vừa gửi thường ở trạng thái "Đã tiếp nhận", cần tra lại mới biết kết quả.
   */
  checkStatus(
    source: NationalPharmacyV2Source,
    id: string | number,
    local: boolean = false
  ): Observable<NationalPharmacyV2Result> {
    // local = chỉ đọc trạng thái đã lưu ở backend, không gọi sang CSDL Dược.
    // Dùng lúc mở màn hình vì API trạng thái mất hơn 10 giây.
    const url = environment.apiUrl + '/' + source + '/check-status-v2?id=' + id + (local ? '&local=1' : '');
    return this.http.post<NationalPharmacyV2Result>(url, {});
  }

  /**
   * Danh sách lý do nhập/xuất hợp lệ với loại cơ sở của cửa hàng (mục 6.4.1, 6.4.2).
   * Cơ sở bán lẻ không có điều chuyển/nhập khẩu/thu hồi.
   */
  getWarehouseReasonOptions(type: WarehouseType): Observable<NationalPharmacyV2ReasonOptionsResult> {
    const url = environment.apiUrl + '/warehouse/reason-options-v2?type=' + type;
    return this.http.get<NationalPharmacyV2ReasonOptionsResult>(url);
  }

  // ---------------------------------------------------------------
  // Tiện ích hiển thị
  // ---------------------------------------------------------------

  statusLabel(status: string | null | undefined): string {
    if (!status) {
      return 'Chưa liên thông';
    }
    return NP_V2_STATUS_LABEL[status] || status;
  }

  statusColor(status: string | null | undefined): string {
    if (!status) {
      return '';
    }
    return NP_V2_STATUS_COLOR[status] || '';
  }

  /** Đã có mã giao dịch, tức là tra cứu được trạng thái bên CSDL Dược */
  hasTransaction(transaction: NationalPharmacyV2Transaction | null | undefined): boolean {
    return !!transaction && !!transaction.transaction_id;
  }

  /**
   * Phiếu đã được CSDL Dược tiếp nhận và chưa bị từ chối.
   *
   * Phải loại rejected/error giống backend: đó là phiếu hệ thống KHÔNG ghi nhận,
   * người dùng sửa dữ liệu xong phải gửi lại được như một lượt gửi bình thường
   * chứ không phải bấm "Đẩy lại".
   */
  isConnected(transaction: NationalPharmacyV2Transaction | null | undefined): boolean {
    return this.hasTransaction(transaction)
      && [NP_V2_STATUS.FAILED, NP_V2_STATUS.UNKNOWN, NP_V2_STATUS.REJECTED, NP_V2_STATUS.ERROR]
        .indexOf(transaction.status) === -1;
  }

  /** Lượt gửi trước mất kết nối: chưa rõ CSDL Dược đã nhận hay chưa */
  isUncertain(transaction: NationalPharmacyV2Transaction | null | undefined): boolean {
    return !!transaction && transaction.status === NP_V2_STATUS.UNKNOWN;
  }

  /** Đang chờ CSDL Dược xử lý xong, nên cho phép tra lại trạng thái */
  isPending(transaction: NationalPharmacyV2Transaction | null | undefined): boolean {
    return this.isConnected(transaction)
      && [NP_V2_STATUS.ACCEPTED, NP_V2_STATUS.PROCESSING].indexOf(transaction.status) !== -1;
  }

  /**
   * Dựng lại bản ghi log từ kết quả API để cập nhật model ngay trên UI,
   * khỏi phải load lại danh sách.
   */
  toTransaction(
    result: NationalPharmacyV2Result,
    current?: NationalPharmacyV2Transaction
  ): NationalPharmacyV2Transaction {
    // Tra trạng thái thành công (success = true) vẫn có thể kèm lý do bị từ chối,
    // nên không được xoá error_message chỉ vì success = true.
    const errorMessage = result.error_message
      || (result.success ? null : result.message)
      || null;

    return {
      ...(current || {} as NationalPharmacyV2Transaction),
      transaction_id: result.transaction_id || (current ? current.transaction_id : null),
      status: result.status || (current ? current.status : null),
      error_message: errorMessage,
    };
  }
}
