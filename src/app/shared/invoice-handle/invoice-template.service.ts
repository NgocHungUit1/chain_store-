import { EventEmitter, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { map } from 'rxjs/operators';

//const invoiceTemplates = require('./fake-invoices.json'); // fake data for invoice templates
//const invoiceTemplates = [];

export interface InvoiceTemplate {
  id: number;
  name: string;
  body: string;
  status: number;
  store_id: any;
}

@Injectable({
  providedIn: 'root'
})
export class InvoiceTemplateService {
  private apiUrl = `${environment.apiUrl}/invoice-template`;
  templateChanged$ = new EventEmitter<InvoiceTemplate>();

  constructor(private http: HttpClient) {
  }

  // getAllTemplates(): Observable<InvoiceTemplate[]> {
  //   return this.http.get<InvoiceTemplate[]>(`${this.apiUrl}`).pipe(
  //     map(template => template.filter(t => t.status === 10)) // Filter out inactive templates
  //   );
  // }
  getAllTemplates(): Observable<InvoiceTemplate[]> {
    return this.http.get<InvoiceTemplate[]>(`${this.apiUrl}`).pipe(
      map(template => template.filter(t => t.status === 10)) // Filter out inactive templates
    );
  }

  getTemplate(id: string): Observable<InvoiceTemplate> {
    return this.http.get<InvoiceTemplate>(`${this.apiUrl}/${id}`);
  }

  createTemplate(template: Partial<InvoiceTemplate>): Observable<Partial<InvoiceTemplate>> {
    return this.http.post<Partial<InvoiceTemplate>>(`${this.apiUrl}`, template);
  }

  updateTemplate(id: number, template: Partial<InvoiceTemplate>): Observable<Partial<InvoiceTemplate>> {
    return this.http.put<Partial<InvoiceTemplate>>(`${this.apiUrl}/${id}`, template);
  }

  deleteTemplate(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
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
    } else{
      // call api to get the default template
      const selectedTemplateId = localStorage.getItem('selectedTemplateId');
      if (selectedTemplateId) {
        this.getTemplate(selectedTemplateId).subscribe(res => {
          if (res) {
            this.setActiveTemplate(res);
            return res;
          } else {
            console.error('Failed to fetch template from API:', res);
          }
        })
      }
    }
    return null;
  }

  setActiveTemplate(template: InvoiceTemplate | null) {
    if (template) {
      localStorage.setItem('selectedTemplateId', template.id?.toString() || '');
      localStorage.setItem('selectedTemplate', JSON.stringify(template));
    } else {
      localStorage.removeItem('selectedTemplateId');
      localStorage.removeItem('selectedTemplate');
    }
    this.templateChanged$.emit(template);
  }

}

