import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {environment} from '../../environments/environment';

/** Lý do trả hàng; is_shared = lý do dùng chung của hệ thống (không sửa/xoá được) */
export class ReturnReason {
  id: number;
  store_id: number;
  name: string;
  sort_order: number;
  status: number;
  is_shared: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ReturnReasonService {
  private url = environment.apiUrl + '/return-reason';

  constructor(private http: HttpClient) {
  }

  getList(): Observable<ReturnReason[]> {
    return this.http.get<ReturnReason[]>(this.url + '?per-page=100');
  }

  create(name: string): Observable<ReturnReason> {
    return this.http.post<ReturnReason>(this.url, {name});
  }

  update(id: number, data: Partial<ReturnReason>): Observable<ReturnReason> {
    return this.http.put<ReturnReason>(this.url + '/' + id, data);
  }

  delete(id: number): Observable<any> {
    return this.http.delete(this.url + '/' + id);
  }
}
