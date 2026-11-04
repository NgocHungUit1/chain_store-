import {Injectable} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Observable} from 'rxjs';
import {environment} from '../../environments/environment';

export interface ClinicPartnerRow {
  id: number;
  code: string;
  name: string;
  status: string;
  status_label: string;
  phone: string;
  representative_name: string;
  branch_id: number;
  branch: string;
  sales_user: string;
  docsoft_tenant_id: string;
  docsoft_domain: string;
  docsoft_url: string;
  clinic_link_id: number;
  created_at: number;
  updated_at: number;
  /** Chỉ có ở danh sách */
  debt?: number | null;
  debt_limit?: number | null;
  contract?: ContractState | null;
}

/** Tình trạng hợp đồng: none | active | expiring (≤ 30 ngày) | expired | upcoming */
export interface ContractState {
  state: 'none' | 'active' | 'expiring' | 'expired' | 'upcoming';
  label: string;
  date_to: string | null;
  days_left: number | null;
}

export interface ClinicPartnerContract {
  id: number;
  contract_no: string;
  date_from: string;
  date_to: string | null;
  note: string | null;
  file_name: string | null;
  file_size: number | null;
  state: ContractState['state'];
  created_by: string | null;
  created_at: number;
}

export interface ClinicPartnerMonthStat {
  month: string;
  orders: number;
  completed: number;
  returned: number;
  sales: number;
  paid: number;
  closing: number;
}

export interface ClinicPartnerDoctor {
  code: string | null;
  name: string;
  phone: string | null;
  active: boolean;
  in_docsoft: boolean;
  orders: number;
  completed: number;
  returned: number;
  sales: number;
  last_order_at: number | null;
}

export interface ClinicPartnerLogRow {
  action: string;
  label: string;
  from_status: string;
  to_status: string;
  note: string;
  user: string;
  created_at: number;
}

export interface ClinicPartnerDetail extends ClinicPartnerRow {
  license_no: string;
  specialty: string;
  tax_code: string;
  address: string;
  email: string;
  representative_phone: string;
  doctor_count: number;
  sales_user_id: number;
  proposed_branch_id: number;
  note: string;
  reject_reason: string;
  price_list_id: number;
  price_list: string;
  allow_special_control: boolean;
  discount_percent: number | null;
  debt_limit: number | null;
  debt: number | null;
  contracts: ClinicPartnerContract[];
  contract: ContractState;
  customer_id: number;
  docsoft_mode: 'create' | 'connect';
  docsoft_admin_username: string;
  activation: { step: string, ok: boolean, message: string, at: number }[];
  approved_by: string;
  approved_at: number;
  suspended_at: number;
  terminated_at: number;
  link: { id: number, status: 'active' | 'suspended' | 'revoked', key_last4: string } | null;
  order_count: number;
  logs: ClinicPartnerLogRow[];
  /** Chỉ có ngay sau thao tác: mật khẩu admin DocSoft vừa tạo, hoặc khoá khi chưa đẩy được sang DocSoft */
  credentials?: { docsoft_url?: string, admin_username?: string, admin_password?: string, api_key?: string } | null;
  warning?: string | null;
}

export interface ClinicPartnerOptions {
  branches: { id: number, name: string }[];
  price_lists: { id: number, name: string }[];
  users: { id: number, name: string }[];
  docsoft_configured: boolean;
  statuses: { [status: string]: string };
}

/** Hồ sơ đăng ký (form kinh doanh) */
export interface ClinicPartnerProfile {
  name: string;
  license_no?: string;
  specialty?: string;
  tax_code?: string;
  address?: string;
  phone?: string;
  email?: string;
  representative_name?: string;
  representative_phone?: string;
  doctor_count?: number;
  sales_user_id?: number;
  proposed_branch_id?: number;
  note?: string;
  submit?: number;
}

export interface ClinicPartnerApprove {
  branch_id: number;
  price_list_id: number;
  allow_special_control: boolean;
  discount_percent: number | null;
  debt_limit: number | null;
  docsoft_mode: 'create' | 'connect';
  docsoft_tenant_id: string;
  docsoft_admin_username: string;
}

/** Màu chip theo trạng thái (class trong clinic-partner.scss) */
export const PARTNER_STATUS_CLASS = {
  draft: 'st-draft',
  pending: 'st-pending',
  rejected: 'st-rejected',
  activating: 'st-activating',
  active: 'st-active',
  suspended: 'st-suspended',
  terminated: 'st-terminated',
};

/** Chuỗi › Phòng khám đối tác (API v1/clinic-partner) */
@Injectable({
  providedIn: 'root'
})
export class ClinicPartnerService {
  private url = environment.apiUrl + '/clinic-partner';

  constructor(private http: HttpClient) {
  }

  list(status: string, keyword: string): Observable<{ items: ClinicPartnerRow[], counts: { [status: string]: number } }> {
    let params = new HttpParams();
    if (status) {
      params = params.set('status', status);
    }
    if (keyword) {
      params = params.set('keyword', keyword);
    }
    return this.http.get<{ items: ClinicPartnerRow[], counts: { [status: string]: number } }>(this.url, {params});
  }

  options(): Observable<ClinicPartnerOptions> {
    return this.http.get<ClinicPartnerOptions>(this.url + '/options');
  }

  view(id: number): Observable<ClinicPartnerDetail> {
    return this.http.get<ClinicPartnerDetail>(this.url + '/' + id);
  }

  create(data: ClinicPartnerProfile): Observable<ClinicPartnerDetail> {
    return this.http.post<ClinicPartnerDetail>(this.url, data);
  }

  update(id: number, data: ClinicPartnerProfile): Observable<ClinicPartnerDetail> {
    return this.http.put<ClinicPartnerDetail>(this.url + '/' + id, data);
  }

  remove(id: number): Observable<any> {
    return this.http.delete(this.url + '/' + id);
  }

  /**
   * Thao tác trên hồ sơ: submit, reject, approve, activate, suspend, resume, terminate, reopen, change-branch, rotate-key,
   * policy, contract-add (FormData), contract-delete
   */
  act(id: number, action: string, body: any = {}): Observable<ClinicPartnerDetail> {
    return this.http.post<ClinicPartnerDetail>(this.url + '/' + id + '/' + action, body);
  }

  stats(id: number): Observable<{ months: ClinicPartnerMonthStat[] }> {
    return this.http.get<{ months: ClinicPartnerMonthStat[] }>(this.url + '/' + id + '/stats');
  }

  doctors(id: number, month: string): Observable<{ month: string, doctors: ClinicPartnerDoctor[], warning: string | null }> {
    return this.http.get<{ month: string, doctors: ClinicPartnerDoctor[], warning: string | null }>(this.url + '/' + id + '/doctors',
      {params: new HttpParams().set('month', month)});
  }

  contractFile(id: number, contractId: number): Observable<Blob> {
    return this.http.get(this.url + '/' + id + '/contract-file', {params: new HttpParams().set('contract_id', String(contractId)), responseType: 'blob'});
  }
}
