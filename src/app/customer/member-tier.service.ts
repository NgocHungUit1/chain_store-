import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {environment} from '../../environments/environment';

/** Hạng thành viên: khách đạt tổng chi tiêu >= min_spend vào hạng, điểm tích nhân point_multiplier */
export class MemberTier {
  id: number;
  name: string;
  min_spend: number;
  point_multiplier: number;
}

@Injectable({
  providedIn: 'root'
})
export class MemberTierService {
  private url = environment.apiUrl + '/member-tier';

  constructor(private http: HttpClient) {
  }

  getList(): Observable<MemberTier[]> {
    return this.http.get<MemberTier[]>(this.url);
  }

  create(data: Partial<MemberTier>): Observable<MemberTier> {
    return this.http.post<MemberTier>(this.url, data);
  }

  update(id: number, data: Partial<MemberTier>): Observable<MemberTier> {
    return this.http.put<MemberTier>(this.url + '/' + id, data);
  }

  delete(id: number): Observable<any> {
    return this.http.delete(this.url + '/' + id);
  }
}
