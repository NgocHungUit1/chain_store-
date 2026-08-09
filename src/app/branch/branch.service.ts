import { Injectable } from '@angular/core';
import {BehaviorSubject, Observable} from 'rxjs';
import {HttpClient, HttpResponse} from '@angular/common/http';
import {environment} from '../../environments/environment';
import {Branch, BranchFilter} from './branch.model';

@Injectable({
  providedIn: 'root'
})
export class BranchService {


  private loadBranch: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  subscribeLoadBranch: Observable<boolean> = this.loadBranch.asObservable();

  setLoadBranch(action: boolean) {
    this.loadBranch.next(action);
  }

  constructor(private http: HttpClient) { }

  getApiUrl(filter?: BranchFilter) {
    if (!filter.page) {
      filter.page = 1;
    }

    if (!filter.pageSize) {
      filter.pageSize = 20;
    }

    let url = '/branch?per-page=' + filter.pageSize;

    url += '&' + filter.toFilterString();
    return url;
  }

  getStateUrl(filter?: BranchFilter) {

    let url = '/branch/list';
    if (!filter.page) {
      filter.page = 1;
    }
    if (!filter.pageSize) {
      filter.pageSize = 20;
    }
    url += '?' + filter.toFilterString();
    return url;
  }

  getList(filter?: BranchFilter): Observable<HttpResponse<any>> {
    const url = environment.apiUrl + this.getApiUrl(filter);
    return this.http.get<HttpResponse<any>>(url, { observe: 'response' });
  }

  getDetail(id: string) {
    const url = environment.apiUrl + '/branch/' + id;
    return this.http.get<Branch>(url);
  }

  getConnect() {
    const url = environment.apiUrl + '/branch/get-connect';
    return this.http.get<object>(url);
  }

  updateConnect(data) {
    const url = environment.apiUrl + '/branch/update-connect';
    return this.http.post<object>(url, data);
  }

  /**
   * Thử đăng nhập CSDL Dược quốc gia bằng tài khoản đang nhập trên form.
   *
   * Gửi kèm username/password để kiểm tra được giá trị vừa nhập mà chưa cần lưu.
   */
  testConnectionV2(username: string, password: string) {
    const url = environment.apiUrl + '/branch/test-connection-v2';
    return this.http.post<{ success: boolean; message: string }>(url, {
      national_pharmacy_v2_login_username: username,
      national_pharmacy_v2_login_password: password,
    });
  }

  update(id: string, pos: any) {
    const url = environment.apiUrl + '/branch/' + id;
    return this.http.put(url, pos);
  }

  create(data) {
    const url = environment.apiUrl + '/branch';
    return this.http.post(url, data);
  }

  delete(id: string) {
    const url = environment.apiUrl + '/branch/' + id;
    return this.http.delete(url);
  }
}
