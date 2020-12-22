import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { OptionStore } from './option-store.model';

@Injectable({
  providedIn: 'root'
})

export class OptionStoreService {

  constructor(private http: HttpClient) {
  }


  getDetail(id: string) {
    const url = environment.apiUrl + '/option-store/' + id;
    return this.http.get<OptionStore>(url);
  }

  update(id: string, pos: any) {
    const url = environment.apiUrl + '/option-store/' + id;
    return this.http.put(url, pos);
  }

  create(data) {
    const url = environment.apiUrl + '/expenses-order';
    return this.http.post(url, data);
  }

  delete(id: string) {
    const url = environment.apiUrl + '/option-store/' + id;
    return this.http.delete(url);
  }

  getValue(name: string) {
    const url = environment.apiUrl + '/option-store/value?name=' + name;
    return this.http.get<OptionStore>(url);
  }

}
