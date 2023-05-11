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


  private getSubDomain()
  {
    const domain = window.location.hostname;
    let subDomain = '';
    if (domain.indexOf('.') < 0 ||
      domain.split('.')[0] === 'example' || domain.split('.')[0] === 'lvh' || domain.split('.')[0] === 'www') {
      subDomain = '';
    } else {
      subDomain = domain.split('.')[0];
    }
    return subDomain;
  }

  getLogo() {
    const url = environment.apiUrl + '/store/get-logo?subdomain=' + this.getSubDomain();
    return this.http.get<string>(url);
  }

  getDetail() {
    const url = environment.apiUrl + '/store/get-detail';
    return this.http.get<Store>(url);
  }

  uploadLogo(formData) {
    const url = environment.apiUrl + '/store/upload-logo';
    return this.http.post(url, formData);
  }

  updateInfo(formData) {
    const url = environment.apiUrl + '/store/update-info';
    return this.http.post(url, formData);
  }

}
