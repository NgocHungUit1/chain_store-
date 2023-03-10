import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { AuthService } from '../authentication/auth.service';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import {Store} from './store.model';

@Injectable({
  providedIn: 'root'
})
export class StoreService {

  constructor(
    private http: HttpClient,
    private auth: AuthService
  ) {
  }


  getLogo() {
    const url = environment.apiUrl + '/store/get-logo'
    return this.http.get<string>(url);
  }

  getDetail() {
    const url = environment.apiUrl + '/store/get-detail'
    return this.http.get<object>(url);
  }

  uploadLogo(formData) {
    const url = environment.apiUrl + '/store/upload-logo';
    return this.http.post(url, formData);
  }

}
