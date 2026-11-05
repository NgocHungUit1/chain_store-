import {Injectable} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Observable} from 'rxjs';
import {environment} from '../../environments/environment';

export type ShipperTab = 'waiting' | 'mine' | 'done';
export type CollectMethod = 'cash' | 'transfer' | 'debt';

/** Một phiếu giao trên trang shipper */
export interface ShipperDelivery {
  id: number;
  status: 'created' | 'picking' | 'delivering' | 'delivered' | 'failed';
  status_label: string;
  order_code: string;
  clinic: { name: string, address: string | null, phone: string | null };
  patient_name: string;
  doctor_name: string;
  item_count: number;
  /** Phải thu (chưa giao) hoặc đã thu (đã giao) */
  amount: number;
  collect_method: CollectMethod | null;
  collect_label: string | null;
  cash_received: boolean;
  receiver_name: string | null;
  assigned_to_me: boolean;
  shipper_name: string | null;
  created_at: number;
  delivering_at: number | null;
  finished_at: number | null;
  // chỉ có ở chi tiết
  items?: { name: string, quantity: number, unit: string }[];
  note?: string;
  patient_phone?: string;
  fail_reason?: string;
  fail_note?: string;
}

export interface ShipperSummary {
  me: { id: number, name: string };
  branch_name: string;
  counts: { waiting: number, mine: number, done: number };
  holding_count: number;
  holding_amount: number;
  fail_reasons: string[];
}

export interface ShipperCashRow {
  shipper_id: number;
  shipper_name: string;
  shipper_phone: string | null;
  count: number;
  amount: number;
  since: number;
}

export interface ShipperCashItem {
  id: number;
  order_code: string;
  clinic_name: string;
  patient_name: string;
  amount: number;
  delivered_at: number;
  receiver_name: string | null;
  shipper_name: string;
  received_at: number | null;
  received_by: string | null;
}

/** Trang giao hàng (API v1/shipper) và thu ngân nhận tiền shipper (v1/shipper-cash) */
@Injectable({
  providedIn: 'root'
})
export class ShipperService {
  private url = environment.apiUrl + '/shipper';
  private cashUrl = environment.apiUrl + '/shipper-cash';

  constructor(private http: HttpClient) {
  }

  summary(): Observable<ShipperSummary> {
    return this.http.get<ShipperSummary>(this.url + '/summary');
  }

  list(tab: ShipperTab): Observable<ShipperDelivery[]> {
    return this.http.get<ShipperDelivery[]>(this.url, {params: new HttpParams().set('tab', tab)});
  }

  view(id: number): Observable<ShipperDelivery> {
    return this.http.get<ShipperDelivery>(this.url + '/' + id);
  }

  take(id: number): Observable<ShipperDelivery> {
    return this.http.post<ShipperDelivery>(this.url + '/' + id + '/take', {});
  }

  pickup(ids: number[]): Observable<{ success: boolean, count: number }> {
    return this.http.post<{ success: boolean, count: number }>(this.url + '/pickup', {ids});
  }

  deliver(id: number, method: CollectMethod, receiverName: string): Observable<ShipperDelivery> {
    return this.http.post<ShipperDelivery>(this.url + '/' + id + '/deliver', {method, receiver_name: receiverName});
  }

  fail(id: number, reason: string, note: string): Observable<ShipperDelivery> {
    return this.http.post<ShipperDelivery>(this.url + '/' + id + '/fail', {reason, note});
  }

  cashList(): Observable<ShipperCashRow[]> {
    return this.http.get<ShipperCashRow[]>(this.cashUrl);
  }

  cashItems(shipperId: number): Observable<ShipperCashItem[]> {
    return this.http.get<ShipperCashItem[]>(this.cashUrl + '/items', {params: new HttpParams().set('shipper_id', String(shipperId))});
  }

  cashHistory(): Observable<ShipperCashItem[]> {
    return this.http.get<ShipperCashItem[]>(this.cashUrl + '/items', {params: new HttpParams().set('received', '1')});
  }

  receive(ids: number[]): Observable<{ success: boolean, count: number }> {
    return this.http.post<{ success: boolean, count: number }>(this.cashUrl + '/receive', {ids});
  }
}
