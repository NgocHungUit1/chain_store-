import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
const invoiceTemplates = require('./fake-invoices.json'); // fake data for invoice templates
//const invoiceTemplates = [];

export interface InvoiceTemplate {
  id?: number;
  name: string;
  body: string;
  status?: number;
}


export interface TemplateResponse {
  data: InvoiceTemplate[];
  message?: string;
  success: boolean;
}

export interface TemplateDetailResponse {
  data: InvoiceTemplate;
  message?: string;
  success: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class InvoiceTemplateService {
  private apiUrl = `${environment.apiUrl}/invoice-template`;

  constructor(private http: HttpClient) {
  }

  // API Methods
  getAllTemplates(): Observable<InvoiceTemplate[]> {
    //return this.http.get<InvoiceTemplate[]>(`${this.apiUrl}`);

    // Return fake data instead of API call since API is not working
    return new Observable(observer => {
      setTimeout(() => {
        observer.next(this.getFallbackTemplates());
        observer.complete();
      }, 500); // Simulate network delay
    });
  }

  getTemplate(id: string): Observable<TemplateDetailResponse> {
    return this.http.get<TemplateDetailResponse>(`${this.apiUrl}/${id}`);
  }

  createTemplate(template: Partial<InvoiceTemplate>): Observable<Partial<InvoiceTemplate>> {
    return this.http.post<Partial<InvoiceTemplate>>(`${this.apiUrl}`, template);
  }

  updateTemplate(id: number, template: Partial<InvoiceTemplate>): Observable<Partial<InvoiceTemplate>> {
    return this.http.put<Partial<InvoiceTemplate>>(`${this.apiUrl}/${id}`, template);
  }

  deleteTemplate(id: number): Observable<{ success: boolean, message?: string }> {
    return this.http.delete<{ success: boolean, message?: string }>(`${this.apiUrl}/${id}`);
  }

  activateTemplate(id: number): Observable<{ success: boolean, message?: string }> {
    return this.http.post<{ success: boolean, message?: string }>(`${this.apiUrl}/activate?id=${id}`, {});
  }

  deactivateTemplate(id: number): Observable<{ success: boolean, message?: string }> {
    return this.http.post<{ success: boolean, message?: string }>(`${this.apiUrl}/deactivate?id=${id}`, {});
  }

  // Local storage methods
  getActiveTemplate(): InvoiceTemplate | null {
    const template = localStorage.getItem('selectedTemplate');
    if (template) {
      return JSON.parse(template);
    }
    return null;
  }

  setActiveTemplate(template: InvoiceTemplate | null) {
    if (template) {
      localStorage.setItem('selectedTemplate', JSON.stringify(template));
    } else {
      localStorage.removeItem('selectedTemplate');
    }
  }

  private getFallbackTemplates(): InvoiceTemplate[] {
    // Return templates from the JSON file
    return invoiceTemplates as InvoiceTemplate[];
  }
}

