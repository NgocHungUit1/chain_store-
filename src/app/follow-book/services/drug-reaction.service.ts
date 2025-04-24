import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DrugReactionService {
  private apiUrl = `${environment.apiUrl}/adverse-drug-reaction`;

  constructor(private http: HttpClient) { }

  getDrugReactions(filter: any): Observable<any> {
    let params = new HttpParams()
      .set('page', filter.page || 1)
      .set('per-page', filter.pageSize || 10);

    if (filter.date_from) {
      params = params.set('AdverseDrugReactionSearch[date_from]', filter.date_from);
    }

    if (filter.date_to) {
      params = params.set('AdverseDrugReactionSearch[date_to]', filter.date_to);
    }

    if (filter.search_string) {
      params = params.set('search', filter.search_string);
    }

    return this.http.get(this.apiUrl, {
      params: params,
      observe: 'response'
    });
  }

  getDrugReactionById(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`);
  }

  createDrugReaction(drugReaction: any): Observable<any> {
    return this.http.post(`${this.apiUrl}`, drugReaction);
  }

  updateDrugReaction(id: number, drugReaction: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, drugReaction);
  }

  deleteDrugReaction(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  exportToExcel(filter: any): Observable<Blob> {
    let params = new HttpParams();

    if (filter.date_from) {
      params = params.set('AdverseDrugReactionSearch[date_from]', filter.date_from);
    }

    if (filter.date_to) {
      params = params.set('AdverseDrugReactionSearch[date_to]', filter.date_to);
    }

    return this.http.get(`${this.apiUrl}/export`, {
      params: params,
      responseType: 'blob'
    });
  }
}
