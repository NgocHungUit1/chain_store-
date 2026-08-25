/**
 * Liên thông CSDL Dược quốc gia v1.1 (QĐ 232/QĐ-TTYQG ngày 17/7/2026).
 *
 * v1.1 đã bỏ API hoá đơn bán lẻ và báo cáo XNT, mọi nghiệp vụ đều đẩy qua nhóm
 * API giao dịch: phiếu nhập hàng, phiếu xuất hàng, phiếu kiểm kho.
 */

/** Nghiệp vụ gốc trong hệ thống, tương ứng controller ở backend */
export type NationalPharmacyV2Source = 'warehouse' | 'invoice' | 'stock-take' | 'returns';

/** Loại phiếu kho, quyết định danh sách lý do được phép */
export type WarehouseType = 'import' | 'return';

/** Bảng mã trạng thái xử lý của hệ thống CSDL Dược — mục 6.2 */
export const NP_V2_STATUS = {
  ACCEPTED: 'accepted',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  ERROR: 'error',
  REJECTED: 'rejected',
  /** Trạng thái nội bộ: gọi API thất bại rõ ràng, chưa có mã giao dịch */
  FAILED: 'failed',
  /** Trạng thái nội bộ: mất kết nối giữa chừng, chưa rõ CSDL Dược đã nhận hay chưa */
  UNKNOWN: 'unknown',
};

export const NP_V2_STATUS_LABEL: { [key: string]: string } = {
  [NP_V2_STATUS.ACCEPTED]: 'Đã tiếp nhận',
  [NP_V2_STATUS.PROCESSING]: 'Đang xử lý',
  [NP_V2_STATUS.COMPLETED]: 'Đã xử lý xong',
  [NP_V2_STATUS.ERROR]: 'Lỗi hệ thống CSDL Dược',
  [NP_V2_STATUS.REJECTED]: 'Bị từ chối',
  [NP_V2_STATUS.FAILED]: 'Gửi thất bại',
  [NP_V2_STATUS.UNKNOWN]: 'Chưa rõ kết quả',
};

/** Màu chip hiển thị theo trạng thái */
export const NP_V2_STATUS_COLOR: { [key: string]: string } = {
  [NP_V2_STATUS.ACCEPTED]: 'primary',
  [NP_V2_STATUS.PROCESSING]: 'primary',
  [NP_V2_STATUS.COMPLETED]: 'success',
  [NP_V2_STATUS.ERROR]: 'warn',
  [NP_V2_STATUS.REJECTED]: 'warn',
  [NP_V2_STATUS.FAILED]: 'warn',
  [NP_V2_STATUS.UNKNOWN]: 'warn',
};

/** Bản ghi log liên thông, backend trả qua ?expand=nationalPharmacyV2 */
export interface NationalPharmacyV2Transaction {
  id: number;
  source_type: string;
  source_id: number;
  endpoint: string;
  reason: string | null;
  reference_number: string | null;
  transaction_id: string | null;
  status: string | null;
  error_message: string | null;
  synced_at: number | null;
  created_at: number;
}

/** Kết quả trả về của connect-v2 / check-status-v2 */
export interface NationalPharmacyV2Result {
  success: boolean;
  message?: string;
  /** Danh sách lỗi dữ liệu chi tiết theo từng sản phẩm */
  errors?: string[];
  /** Phiếu đã được tiếp nhận trước đó, cần xác nhận mới đẩy lại */
  already_synced?: boolean;
  /** Lượt gửi trước mất kết nối, chưa rõ CSDL Dược đã nhận hay chưa */
  uncertain?: boolean;
  transaction_id?: string;
  status?: string;
  status_label?: string;
  /** Lý do phiếu bị từ chối/lỗi, có cả khi success = true */
  error_message?: string;
  status_code?: number;
  data?: any;
}

/** Lý do nhập/xuất hàng — mục 6.4.1, 6.4.2 */
export interface NationalPharmacyV2ReasonOption {
  value: string;
  label: string;
}

export interface NationalPharmacyV2ReasonOptionsResult {
  success: boolean;
  /** Cơ sở bán lẻ có tập lý do hẹp hơn cơ sở bán buôn/sản xuất */
  is_retail: boolean;
  options: NationalPharmacyV2ReasonOption[];
}

/** Dữ liệu truyền vào dialog liên thông */
export interface NationalPharmacyV2DialogData {
  source: NationalPharmacyV2Source;
  id: string | number;
  /** Số phiếu, chỉ để hiển thị */
  referenceNumber?: string;
  /** Bắt buộc khi source = 'warehouse' để lấy đúng danh sách lý do */
  warehouseType?: WarehouseType;
  /** Lần liên thông gần nhất, nếu đã có */
  transaction?: NationalPharmacyV2Transaction;
}
