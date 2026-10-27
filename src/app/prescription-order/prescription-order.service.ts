import {Injectable} from '@angular/core';
import {HttpClient, HttpParams, HttpResponse} from '@angular/common/http';
import {Observable} from 'rxjs';
import {environment} from '../../environments/environment';

/** Một dòng ở danh sách đơn đặt thuốc */
export interface PrescriptionOrderRow {
  id: number;
  code: string;
  status: string;
  status_label: string;
  clinic_name: string;
  patient_name: string;
  patient_phone: string;
  doctor_name: string;
  item_count: number;
  total_quote: number;
  created_at: number;
  updated_at: number;
}

export interface PrescriptionOrderSummary {
  status: string;
  label: string;
  count: number;
}

export interface PrescriptionOrderItem {
  line_no: number;
  product_id: number;
  product_no: string;
  product_name: string;
  active_substance: string;
  strength: string;
  batch_tracking: boolean;
  unit_id: number;
  unit: string;
  unit_factor: number;
  quantity: number;
  price_quote: number;
  usage: string;
  stock_in_unit: number;
  enough_stock: boolean;
}

export interface PrescriptionOrderHistory {
  from: string;
  to: string;
  to_label: string;
  by: 'clinic' | 'staff' | 'system';
  by_name: string;
  note: string;
  at: number;
}

export interface PrescriptionOrderDetail {
  id: number;
  code: string;
  status: string;
  status_label: string;
  clinic: { link_id: number, name: string, customer_id: number, price_list_id: number };
  doctor: { code: string, name: string };
  patient: { name: string, phone: string, dob: string, gender: string, code: string };
  dtqg_code: string;
  diagnosis: string;
  note: string;
  return_reason: string;
  return_note: string;
  cancel_reason: string;
  invoice_id: number;
  total_quote: number;
  all_in_stock: boolean;
  items: PrescriptionOrderItem[];
  history: PrescriptionOrderHistory[];
  created_at: number;
  updated_at: number;
}

export interface PrescriptionOrderFilter {
  status?: string;
  keyword?: string;
  date_from?: string;
  date_to?: string;
  page?: number;
  perPage?: number;
}

/** Màu chip theo trạng thái (class trong prescription-order.scss) */
export const ORDER_STATUS_CLASS = {
  new: 'st-new',
  confirmed: 'st-confirmed',
  returned: 'st-returned',
  cancelled: 'st-cancelled',
  preparing: 'st-preparing',
  delivering: 'st-delivering',
  completed: 'st-completed',
};

/**
 * Đơn đặt thuốc phòng khám gửi tới chi nhánh đang làm việc (API v1/prescription-order).
 */
@Injectable({
  providedIn: 'root'
})
export class PrescriptionOrderService {
  private url = environment.apiUrl + '/prescription-order';

  constructor(private http: HttpClient) {
  }

  list(filter: PrescriptionOrderFilter): Observable<HttpResponse<PrescriptionOrderRow[]>> {
    let params = new HttpParams()
      .set('page', String(filter.page || 1))
      .set('per-page', String(filter.perPage || 20));
    ['status', 'keyword', 'date_from', 'date_to'].forEach(key => {
      if (filter[key]) {
        params = params.set(key, filter[key]);
      }
    });
    return this.http.get<PrescriptionOrderRow[]>(this.url, {params, observe: 'response'});
  }

  summary(): Observable<PrescriptionOrderSummary[]> {
    return this.http.get<PrescriptionOrderSummary[]>(this.url + '/summary');
  }

  view(id: number): Observable<PrescriptionOrderDetail> {
    return this.http.get<PrescriptionOrderDetail>(this.url + '/' + id);
  }

  confirm(id: number): Observable<PrescriptionOrderDetail> {
    return this.http.post<PrescriptionOrderDetail>(this.url + '/' + id + '/confirm', {});
  }

  returnOrder(id: number, reason: string, note: string): Observable<PrescriptionOrderDetail> {
    return this.http.post<PrescriptionOrderDetail>(this.url + '/' + id + '/return', {reason, note});
  }
}
