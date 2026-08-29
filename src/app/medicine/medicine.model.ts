import {ApiFilterBase} from "../shared/base";

/**
 * Quy cách đóng gói CSDL Dược quốc gia đã đăng ký cho một thuốc.
 *
 * CSDL Dược TỪ CHỐI giao dịch nếu đơn vị trên phiếu không nằm trong danh sách này,
 * nên phải biết ngay lúc chọn thuốc thay vì để phiếu bị từ chối sau khi gửi.
 */
export interface MedicinePackaging {
  unit_id: string;
  unit_name: string;
  gtin: string | null;
}

export class Medicine {
  id: string;
  medicine_no: string;
  medicine_name: string;
  registration_no: string;
  main_active_substance: string;
  content: string;
  packing: string;
  manufacturer: string;
  made_in: string;
  unit: string;
  /** Mã định danh thuốc trên CSDL Dược quốc gia, đồng bộ theo số GPLH */
  national_drug_id: string;
  /**
   * Chỉ có ở /medicine/autocomplete (join sẵn bảng medicine_packaging).
   * Mảng rỗng nghĩa là CHƯA đồng bộ được quy cách của thuốc, không phải thuốc
   * không có đơn vị nào hợp lệ.
   */
  packagings?: MedicinePackaging[];
}


export class MedicineFilter extends ApiFilterBase{
  id = '';
  medicine_no = '';
  medicine_name = '';
  registration_no = '';
  main_active_substance = '';
  content = '';
  packing = '';
  manufacturer = '';
  made_in = '';
  unit = '';
  page = 1;
  pageSize = 15;
  sort = '';
  keyword = '';

  getModelSearch() {
    return 'MedicineSearch';
  }

}
