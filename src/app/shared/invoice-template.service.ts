import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { environment } from '../../environments/environment';

export interface InvoiceTemplate {
  id: number;
  name: string;
  content: string;
  isDefault: boolean;
}

export interface TemplateResponse {
  data: InvoiceTemplate[];
  message?: string;
  success: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class InvoiceTemplateService {
  private apiUrl = `${environment.apiUrl}/invoice-templates`;

  // Cache templates in memory
  private templatesSubject = new BehaviorSubject<InvoiceTemplate[]>([]);
  public templates$ = this.templatesSubject.asObservable();

  // Track selected template
  private selectedTemplateSubject = new BehaviorSubject<number>(1);
  public selectedTemplate$ = this.selectedTemplateSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadTemplatesFromStorage();
  }

  // API Methods
  getAllTemplates(): Observable<TemplateResponse> {
    return this.http.get<TemplateResponse>(`${this.apiUrl}`);
  }

  getTemplate(id: number): Observable<{data: InvoiceTemplate, success: boolean}> {
    return this.http.get<{data: InvoiceTemplate, success: boolean}>(`${this.apiUrl}/${id}`);
  }

  // State Management Methods
  loadTemplates(): void {
    // Return fake data instead of API call since API is not working
    const fakeTemplates = this.getFallbackTemplates();
    this.templatesSubject.next(fakeTemplates);
    this.saveTemplatesToStorage(fakeTemplates);

    // Comment out API call for now
    /*
    this.getAllTemplates().subscribe({
      next: (response) => {
        if (response.success) {
          this.templatesSubject.next(response.data);
          this.saveTemplatesToStorage(response.data);
        }
      },
      error: (error) => {
        console.error('Failed to load templates:', error);
        // Fallback to cached data
        this.loadTemplatesFromStorage();
      }
    });
    */
  }

  getTemplatesFromCache(): InvoiceTemplate[] {
    return this.templatesSubject.value;
  }

  // Selection Management
  setSelectedTemplate(templateId: number): void {
    this.selectedTemplateSubject.next(templateId);
    localStorage.setItem('selectedInvoiceTemplate', templateId.toString());
  }

  getSelectedTemplate(): number {
    return this.selectedTemplateSubject.value;
  }

  getSelectedTemplateData(): InvoiceTemplate | null {
    const selectedId = this.getSelectedTemplate();
    const templates = this.getTemplatesFromCache();
    return templates.find(t => t.id === selectedId) || null;
  }

  // Mock API methods to return fake responses
  createTemplate(template: Partial<InvoiceTemplate>): Observable<{data: InvoiceTemplate, success: boolean}> {
    // Return fake success response
    const newTemplate: InvoiceTemplate = {
      id: Date.now(), // Generate fake ID
      name: template.name || 'New Template',
      content: template.content || this.getDefaultTemplateContent(1),
      isDefault: template.isDefault || false,
    };

    // Add to local cache
    const currentTemplates = this.getTemplatesFromCache();
    const updatedTemplates = [...currentTemplates, newTemplate];
    this.templatesSubject.next(updatedTemplates);
    this.saveTemplatesToStorage(updatedTemplates);

    // Return observable with fake response
    return new Observable(observer => {
      setTimeout(() => {
        observer.next({ data: newTemplate, success: true });
        observer.complete();
      }, 500); // Simulate network delay
    });
  }
  getAllTemplate(): Observable<InvoiceTemplate[]> {
    // get 3 fake templates
    return new Observable(observer => {
      setTimeout(() => {
        observer.next(this.getFallbackTemplates());
        observer.complete();
      }, 500); // Simulate network delay
    });
  }

  updateTemplate(id: number, template: Partial<InvoiceTemplate>): Observable<{data: InvoiceTemplate, success: boolean}> {
    // Update template in local cache
    const currentTemplates = this.getTemplatesFromCache();
    const templateIndex = currentTemplates.findIndex(t => t.id === id);
    if (templateIndex !== -1) {
      const updatedTemplate = { ...currentTemplates[templateIndex], ...template };
      currentTemplates[templateIndex] = updatedTemplate;
      this.templatesSubject.next([...currentTemplates]);
      this.saveTemplatesToStorage(currentTemplates);

      return new Observable(observer => {
        setTimeout(() => {
          observer.next({ data: updatedTemplate, success: true });
          observer.complete();
        }, 500);
      });
    }

    // Return error if template not found
    return new Observable(observer => {
      setTimeout(() => {
        observer.error({ success: false, message: 'Template not found' });
      }, 500);
    });
  }

  deleteTemplate(id: number): Observable<{success: boolean, message: string}> {
    // Remove from local cache
    const currentTemplates = this.getTemplatesFromCache();
    const updatedTemplates = currentTemplates.filter(t => t.id !== id);
    this.templatesSubject.next(updatedTemplates);
    this.saveTemplatesToStorage(updatedTemplates);

    return new Observable(observer => {
      setTimeout(() => {
        observer.next({ success: true, message: 'Template deleted successfully' });
        observer.complete();
      }, 500);
    });
  }



  setDefaultTemplate(id: number): Observable<{success: boolean, message: string}> {
    // Update default status in local cache
    const currentTemplates = this.getTemplatesFromCache();
    const updatedTemplates = currentTemplates.map(t => ({
      ...t,
      isDefault: t.id === id
    }));
    this.templatesSubject.next(updatedTemplates);
    this.saveTemplatesToStorage(updatedTemplates);

    return new Observable(observer => {
      setTimeout(() => {
        observer.next({ success: true, message: 'Default template updated' });
        observer.complete();
      }, 500);
    });
  }

  // Storage Methods (for offline support)
  private saveTemplatesToStorage(templates: InvoiceTemplate[]): void {
    localStorage.setItem('invoiceTemplates', JSON.stringify(templates));
  }

  private loadTemplatesFromStorage(): void {
    const savedTemplates = localStorage.getItem('invoiceTemplates');
    if (savedTemplates) {
      const templates = JSON.parse(savedTemplates);
      this.templatesSubject.next(templates);
    } else {
      // Fallback to hardcoded templates
      this.templatesSubject.next(this.getFallbackTemplates());
    }

    // Load selected template
    const savedTemplateId = localStorage.getItem('selectedInvoiceTemplate');
    if (savedTemplateId) {
      this.selectedTemplateSubject.next(parseInt(savedTemplateId));
    }
  }

  private getFallbackTemplates(): InvoiceTemplate[] {
    return [
      {
        id: 1,
        name: 'Mẫu in số 1',
        content: this.getDefaultTemplateContent(1),
        isDefault: true,
      },
      {
        id: 2,
        name: 'Mẫu in số 2',
        content: this.getDefaultTemplateContent(2),
        isDefault: false,
      },
      {
        id: 3,
        name: 'Mẫu in số 3',
        content: this.getDefaultTemplateContent(3),
        isDefault: false,
      }
    ];
  }

  private getDefaultTemplateContent(id: any): string {
    return `<div id="kv-cke-temp">
<style type="text/css">.printBox {
        font-family: Arial, sans-serif;
        font-size: 11px;
    }

    table {
        page-break-inside: auto;
        border-collapse: collapse;
    }

        table td {
            word-wrap: break-word;
            word-break: break-all;
        }

    tr {
        page-break-inside: avoid;
        page-break-after: auto
    }

    img {
        max-width: 100%;
        height: auto;
    }
</style>
<div class="printBox">
<table style="width:100%">
<tbody>
<tr>
<td style="text-align:center">
<table style="width:100%">
<tbody>
<tr>
<td style="font-size:11px; text-align:center">&nbsp;</td>
</tr>
<tr>
<td style="font-size:11px; text-align:center"><span style="font-size:16px"><span style="font-family:Arial,Helvetica,sans-serif"><strong>NHÀ THUỐC MINH CHÂU ${id}</strong></span></span></td>
</tr>
<tr>
<td style="font-size:11px; text-align:center">Địa chỉ: A27, KP.Bình Đức, P.Bình Nhâm, Thuận An, BD</td>
</tr>
<tr>
<td style="font-size:11px; text-align:center">Điện thoại: 0918 859 754</td>
</tr>
</tbody>
</table>
</td>
</tr>
</tbody>
</table>

<div style="padding:10px 0 0; text-align:center"><strong style="font-size:12px">{Tieu_De_In HÓA ĐƠN BÁN HÀNG|HÓA ĐƠN TẠM TÍNH}</strong></div>

<table style="width:100%">
<tbody>
<tr>
<td style="font-size:11px; text-align:center">Số HĐ: {Ma_Don_Hang}</td>
</tr>
<tr>
<td style="font-size:11px; text-align:center">Ngày {Ngay} tháng {Thang} năm {Nam}</td>
</tr>
</tbody>
</table>

<table style="margin:10px 0 15px; width:100%">
<tbody>
<tr>
<td style="font-size:11px">Khách hàng: {Khach_Hang}</td>
</tr>
<tr>
<td style="font-size:11px">SĐT: {So_Dien_Thoai}</td>
</tr>
<tr>
<td style="font-size:11px">Địa chỉ: {Dia_Chi_Khach_Hang} - {Phuong_Xa_Khach_Hang} - {Khu_Vuc_Khach_Hang_QH_TP}</td>
</tr>
</tbody>
</table>

<table cellpadding="3" style="width:98%">
<tbody>
<tr>
<td style="border-bottom:1px solid black; border-top:1px solid black; width:35%"><strong><span style="font-size:11px">Đơn giá</span></strong></td>
<td style="border-bottom:1px solid black; border-top:1px solid black; text-align:right; width:30%"><strong><span style="font-size:11px">SL</span></strong></td>
<td style="border-bottom:1px solid black; border-top:1px solid black; text-align:right"><strong><span style="font-size:11px">Thành tiền</span></strong></td>
</tr>
<tr>
<td colspan="3" style="padding-top:3px"><span style="font-size:12px">{Ten_Hang_Hoa}</span></td>
</tr>
<tr>
<td style="border-bottom:1px dashed black"><span style="font-size:11px">{Don_Gia_Chiet_Khau}</span></td>
<td style="border-bottom:1px dashed black; text-align:right"><span style="font-size:11px">{So_Luong}</span></td>
<td style="border-bottom:1px dashed black; text-align:right"><span style="font-size:11px">{Thanh_Tien}</span></td>
</tr>
</tbody>
</table>

<table border="0" cellpadding="3" cellspacing="0" style="border-collapse:collapse; margin-top:20px; width:98%">
<tfoot>
<tr>
<td style="font-size:11px; font-weight:bold; text-align:right; white-space:nowrap">Tổng tiền hàng:</td>
<td style="font-size:11px; font-weight:bold; text-align:right">{Tong_Tien_Hang}</td>
</tr>
<tr>
<td style="font-size:11px; font-weight:bold; text-align:right; white-space:nowrap">Chiết khấu {Chiet_Khau_Hoa_Don_Phan_Tram}:</td>
<td style="font-size:11px; font-weight:bold; text-align:right">{Chiet_Khau_Hoa_Don}</td>
</tr>
<tr>
<td style="font-size:11px; font-weight:bold; text-align:right; white-space:nowrap">Tổng thanh toán:</td>
<td style="font-size:11px; font-weight:bold; text-align:right">{Tong_Cong}</td>
</tr>
<tr>
<td colspan="2" style="font-size:11px; font-style:italic; text-align:left">&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; ({Tong_Cong_Bang_Chu})</td>
</tr>
</tfoot>
</table>

<table style="margin-top:20px; width:100%">
<tbody>
<tr>
<td style="font-size:11px; font-style:italic; text-align:center">
<p><strong><em><u>Chú ý : Đổi trả trong vòng 2 ngày (không áp dụng với thuốc kê đơn)</u></em></strong></p>

<p>Cảm ơn và hẹn gặp lại!</p>
</td>
</tr>
<tr>
<td style="font-size:9px; font-style:italic; text-align:center">&nbsp;</td>
</tr>
</tbody>
</table>
</div>
</div>`;
  }
}
