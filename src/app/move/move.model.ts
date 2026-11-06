import { ApiFilterBase } from '../shared/base';

export class User {
  username: string;
}

export class Store {
  name: string;
}

export class Branch {
  name: string;
}

/** Trạng thái phiếu chuyển (gửi / nhận hai bước, 06/11/2026) */
export const MOVE_STATUS = {DRAFT: 9, SENT: 5, RECEIVED: 10, CANCELLED: 1};
export const MOVE_STATUS_LABELS = {'9': 'Khởi tạo', '5': 'Đang chuyển', '10': 'Đã nhận', '1': 'Đã huỷ'};
export const MOVE_STATUS_COLORS = {'9': 'label label-warning', '5': 'label label-info', '10': 'label label-success', '1': 'label label-danger'};

export class Move {
  id: string;
  no: string;
  date: string;
  branch_from: number;
  branch_to: number;
  sent_at: number;
  received_at: number;
  cancelled_at: number;
  receive_note: string;
  status_label: string;
  sentBy: User;
  receivedBy: User;
  cancelledBy: User;
  balance_at: number;
  balance_by: number;
  note: string;
  store: Store;
  balance_status: string;
  user: User;
  created_at: any;
  status: string;
  doneBy: object;
  branchFrom: Branch;
  branchTo: Branch;
  done_at: string;
}


export class MoveFilter extends ApiFilterBase {
  id = '';
  no = '';
  status = '';
  page = 1;
  pageSize = 15;
  sort = '';
  date_from = '';
  date_to = '';
  keyword = '';
  done_at = '';

  getModelSearch() {
    return 'MoveSearch';
  }
}

/** Lô của dòng chuyển; số lượng theo đơn vị cơ bản. stock: tồn lô ở chi nhánh gửi (khi chọn lô) */
export class MoveDetailParcel {
  id?: number;
  parcel_no: string;
  expiration_date: string;
  quantity: number;
  received_quantity?: number;
  stock?: number;
}

/** Lô còn tồn ở chi nhánh đang làm việc (move/lots) */
export class MoveLot {
  parcel_no: string;
  expiration_date: string;
  manufacture_date: string;
  stock: number;
  expired: boolean;
}

export class MoveDetail {
  id: string;
  parcels: MoveDetailParcel[] = [];
  lots: MoveLot[];
  received_quantity: number;
  productUnit: any;
  sample_prescription_id: string;
  product_id: string;
  product_no: string;
  amount: number;
  note: number;
  product: object;
  product_unit_id: string;
  productUnits: object[];
}

export class MoveDetailFilter extends ApiFilterBase {
  id = '';
  no = '';
  move_id = '';
  product_id = '';
  product_no = '';
  product_unit_id = '';
  amount = '';
  note = '';
  page = 1;
  pageSize = 15;
  sort = '';

  getModelSearch() {
    return 'MoveDetailSearch';
  }
}


