import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from '../authentication/auth.service';
import { NationalPrescription } from './national-prescription.model';
import { Product } from '../product/product.model';

@Injectable({
  providedIn: 'root'
})
export class NationalPrescriptionService {

  constructor(
    private http: HttpClient,
    private auth: AuthService
  ) {
  }

  autocomplete(term: string) {
    const url = environment.apiUrl + '/national-prescription/autocomplete?term=' + term;
    return this.http.get<NationalPrescription[]>(url);
  }

  addToCart(id: string) {
    const url = environment.apiUrl + '/national-prescription/cart';
    return this.http.post<Product[]>(url, {id: id});
  }

}




