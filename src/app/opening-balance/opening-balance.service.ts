import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from '../authentication/auth.service';
import { DateFilter } from '../invoice/invoice.model';
import { OpeningBalance, OpeningBalanceFilter } from './opening-balance.model';

@Injectable({
  providedIn: 'root'
})
export class OpeningBalanceService {

  /**
   * Khoảng ngày đang lọc, dùng chung giữa màn danh sách và 2 dialog chọn thời gian —
   * đúng cơ chế các màn khác đang dùng. Để state riêng của module này để không lẫn
   * với bộ lọc của màn Hóa đơn bán / Nhập hàng.
   */
  public dateFilter: BehaviorSubject<DateFilter> = new BehaviorSubject<DateFilter>(null);
  subscribeDateFilter: Observable<DateFilter> = this.dateFilter.asObservable();

  constructor(private http: HttpClient, private auth: AuthService) {
  }

  setDateFilter(obj: DateFilter) {
    this.dateFilter.next(obj);
  }

  getDateFilter() {
    return this.dateFilter.value;
  }

  convertDateYYYYMMDD(date: Date) {
    const month = date.getMonth() + 1;
    return date.getFullYear() + '-' + month + '-' + date.getDate();
  }

  getApiUrl(filter?: OpeningBalanceFilter) {
    if (!filter.page) {
      filter.page = 1;
    }
    if (!filter.pageSize) {
      filter.pageSize = 20;
    }

    return '/opening-balance?per-page=' + filter.pageSize + '&' + filter.toFilterString();
  }

  getList(filter?: OpeningBalanceFilter): Observable<HttpResponse<any>> {
    return this.http.get<HttpResponse<any>>(environment.apiUrl + this.getApiUrl(filter), {observe: 'response'});
  }

  getDetail(id: string, expand: string = '') {
    const url = environment.apiUrl + '/opening-balance/' + id + '?expand=' + expand;
    return this.http.get<OpeningBalance>(url);
  }

  /**
   * Xuất phiếu tồn đầu kỳ đúng khuôn để nộp lên cổng csdlduoc.com.vn.
   *
   * Dùng lại nguyên API đang nằm ở ProductController - chỉ dời NÚT sang màn này
   * cho đúng chỗ nghiệp vụ, không bê hàm sang controller khác để khỏi phát sinh
   * rủi ro. Không truyền bộ lọc: xuất trọn tồn đầu kỳ của chi nhánh.
   *
   * @param date 'YYYY-MM-DD' — xuất số tồn cuối ngày này; hôm nay = tồn hiện tại.
   */
  exportNationalPharmacyOpeningStock(date: string) {
    const url = environment.apiUrl + '/product/export-national-pharmacy-opening-stock?date=' + encodeURIComponent(date);
    return this.http.get(url, {
      observe: 'response',
      responseType: 'blob'
    });
  }

  create(data) {
    return this.http.post<any>(environment.apiUrl + '/opening-balance', data);
  }

  update(id: string, data) {
    return this.http.put<any>(environment.apiUrl + '/opening-balance/' + id, data);
  }

  delete(id: string) {
    return this.http.delete<any>(environment.apiUrl + '/opening-balance/' + id);
  }

  getRenderNo() {
    return this.http.get<any>(environment.apiUrl + '/opening-balance/render-no');
  }

  /**
   * Đếm giao dịch đã phát sinh sau ngày chốt để cảnh báo trước khi chốt phiếu.
   */
  checkClosingDate(branchId: any, date: string) {
    const url = environment.apiUrl + '/opening-balance/check-closing-date?branch_id=' + branchId + '&date=' + date;
    return this.http.get<any>(url);
  }

  /**
   * Chỉ đọc + kiểm tra file, KHÔNG tạo phiếu. Kết quả được nạp vào lưới để người
   * dùng xem lại rồi mới Lưu tạm / Hoàn thành.
   */
  upload(data: FormData) {
    return this.http.post<any>(environment.apiUrl + '/opening-balance/upload', data);
  }

  getDownloadTemplateLink() {
    return environment.apiUrl + '/opening-balance/download-template?token=' + this.auth.getToken();
  }

  getDownloadLink(filter?: OpeningBalanceFilter) {
    return environment.apiUrl + '/opening-balance/export?' + filter.toFilterString() + '&token=' + this.auth.getToken();
  }
}
