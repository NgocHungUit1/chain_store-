import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { environment } from '../../environments/environment';

export interface InvoiceTemplate {
  id: string;
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


  constructor(private http: HttpClient) {
  }

  // API Methods
  getAllTemplates(): Observable<TemplateResponse> {
    //return this.http.get<TemplateResponse>(`${this.apiUrl}`);

    // Return fake data instead of API call since API is not working
    return new Observable(observer => {
      setTimeout(() => {
        observer.next({ data: this.getFallbackTemplates(), success: true });
        observer.complete();
      }, 500); // Simulate network delay
    });
  }

  getTemplate(id: number): Observable<{data: InvoiceTemplate, success: boolean}> {
    return this.http.get<{data: InvoiceTemplate, success: boolean}>(`${this.apiUrl}/${id}`);
  }


  // Selection Management
  setSelectedTemplate(templateId: string): void {
    localStorage.setItem('selectedInvoiceTemplate', templateId.toString());
  }


  // Mock API methods to return fake responses
  createTemplate(template: Partial<InvoiceTemplate>): Observable<{data: InvoiceTemplate, success: boolean}> {
    // Return fake success response
    const newTemplate: InvoiceTemplate = {
      id: Date.now().toString(), // Generate fake ID
      name: template.name || 'New Template',
      content: template.content || this.getDefaultTemplateContent(1),
      isDefault: template.isDefault || false,
    };

    // Return observable with fake response
    return new Observable(observer => {
      setTimeout(() => {
        observer.next({ data: newTemplate, success: true });
        observer.complete();
      }, 500); // Simulate network delay
    });
  }
  updateTemplate(id: string, template: Partial<InvoiceTemplate>): Observable<{data: InvoiceTemplate, success: boolean}> {
    // Return fake success response
    const updatedTemplate: InvoiceTemplate = {
      id,
      name: template.name || 'Updated Template',
      content: template.content || this.getDefaultTemplateContent(1),
      isDefault: template.isDefault || false,
    };

    // Return observable with fake response
    return new Observable(observer => {
      setTimeout(() => {
        observer.next({ data: updatedTemplate, success: true });
        observer.complete();
      }, 500); // Simulate network delay
    });
  }

  deleteTemplate(id: string): Observable<{success: boolean}> {
    // Return fake success response
    return new Observable(observer => {
      setTimeout(() => {
        observer.next({ success: true });
        observer.complete();
      }, 500); // Simulate network delay
    });
  }
  getSelectedTemplate(): InvoiceTemplate | null {
    const templateId = localStorage.getItem('selectedInvoiceTemplate');
    if (templateId) {
      const templates = this.getFallbackTemplates();
      return templates.find(template => template.id === templateId) || null;
    }
    return null;
  }


  private getFallbackTemplates(): InvoiceTemplate[] {
    return [
      {
        id: '1',
        name: 'Mẫu in số 1',
        content: this.getDefaultTemplateContent(1),
        isDefault: true,
      },
      {
        id: '2',
        name: 'Mẫu in số 2',
        content: this.getDefaultTemplateContent(2),
        isDefault: false,
      },
      {
        id: '',
        name: 'Mẫu in số 3',
        content: this.getDefaultTemplateContent(3),
        isDefault: false,
      }
    ];
  }

  private getDefaultTemplateContent(id: any): string {
    if(id ===2){
      return `
      <div id="kv-cke-temp">
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
<td style="font-size: 11px; text-align: left;"><strong>PH&Acirc;N PHỐI THUỐC &amp; VTY TẾ</strong></td>
</tr>
</tbody>
</table>
</td>
</tr>
</tbody>
</table>

<div style="padding:10px 0 0; text-align:center"><strong style="font-size:12px">{Tieu_De_In}</strong></div>

<table style="margin:10px 0 15px; width:100%">
<tbody>
<tr>
<td style="font-size: 11px; width: 60%;">Kh&aacute;ch h&agrave;ng: {Khach_Hang}</td>
<td colspan="2" style="font-size: 11px;">Số HĐ: {So_Hoa_Don}</td>
</tr>
<tr>
<td rowspan="2" style="font-size: 11px;">SĐT: {So_Dien_Thoai}</td>
<td colspan="1" rowspan="2" style="font-size: 11px;">Ng&agrave;y giờ b&aacute;n:</td>
<td style="font-size: 11px;">{Ngay_Ban}</td>
</tr>
<tr>
<td style="font-size: 11px;">{Gio_Ban}</td>
</tr>
<tr>
<td style="font-size: 11px;">Địa chỉ: {Dia_Chi_Khach_Hang} - {Phuong_Xa_Khach_Hang} - {Khu_Vuc_Khach_Hang_QH_TP}</td>
<td colspan="2" style="font-size: 11px;">Nh&acirc;n vi&ecirc;n: {Nhan_Vien}</td>
</tr>
</tbody>
</table>

<table border="1" cellpadding="3" style="width:98%;">
<thead>
<tr>
<th scope="col" style="border-bottom: 1px solid black; border-top: 1px solid black; width: 10%;">STT</th>
<th scope="col" style="border-bottom: 1px solid black; border-top: 1px solid black; width: 35%;"><b>T&ecirc;n h&agrave;ng</b></th>
<th scope="col" style="border-bottom: 1px solid black; border-top: 1px solid black; width: 15%;">Đơn vị</th>
<th scope="col" style="border-bottom: 1px solid black; border-top: 1px solid black; text-align: right; width: 7%;"><strong><span style="font-size:11px">SL</span></strong></th>
<th scope="col" style="border-bottom: 1px solid black; border-top: 1px solid black; text-align: right; width: 15%;">Đơn Gi&aacute;</th>
<th scope="col" style="border-bottom: 1px solid black; border-top: 1px solid black; text-align: right;"><strong><span style="font-size:11px">Th&agrave;nh tiền</span></strong></th>
</tr>
</thead>
<tbody>
<tr>
<td style="border-bottom:1px solid black">{STT}</td>
<td style="border-bottom:1px solid black"><span style="font-size:12px">{Ten_Hang_Hoa}</span></td>
<td style="border-bottom:1px solid black">{Don_Vi}</td>
<td style="border-bottom:1px solid black; text-align:right"><span style="font-size:11px">{So_Luong}</span></td>
<td style="border-bottom:1px solid black; text-align:right">{Don_Gia}</td>
<td style="border-bottom:1px solid black; text-align:right"><span style="font-size:11px">{Thanh_Tien}</span></td>
</tr>
</tbody>
</table>

<table border="1" cellpadding="1" cellspacing="1" style="width:98%; margin-bottom:0;">
<tbody>
<tr>
<td style="width: 60%; text-align: right;"><strong>Tổng tiền h&agrave;ng:</strong></td>
<td style="width: 7%;"><strong>{Tong_So_Luong}</strong></td>
<td><strong>{Tong_Tien_Hang}</strong></td>
</tr>
<tr>
<td style="text-align: right;">Chiết khấu</td>
<td>&nbsp;</td>
<td>{Chiet_Khau}</td>
</tr>
<tr>
<td style="text-align: right;"><strong>Tổng cộng:</strong></td>
<td>&nbsp;</td>
<td><strong>{Tong_Cong}</strong></td>
</tr>
<tr>
<td style="text-align: right;"><strong>Kh&aacute;ch thanh to&aacute;n:</strong></td>
<td>&nbsp;</td>
<td>{Khach_Thanh_Toan}</td>
</tr>
<tr>
<td style="text-align: right;"><strong>C&ograve;n lại:</strong></td>
<td>&nbsp;</td>
<td>{Con_Lai}</td>
</tr>
</tbody>
</table>

<table cellpadding="1" cellspacing="1" style="width:98%;">
<tbody>
<tr>
<td><strong>Bằng chữ: {Tong_Tien_Hang_Bang_Chu}&nbsp;</strong></td>
</tr>
</tbody>
</table>

<p>&nbsp;</p>

<table style="margin-top:20px; width:100%">
<tbody>
<tr>
<td style="font-size:11px; font-style:italic; text-align:center">
<p><strong><em><u>Lưu &yacute;:&nbsp; Giải quyết đổi trả trong v&ograve;ng 3 ng&agrave;y</u></em></strong></p>

<p>Cảm ơn Q&uacute;y kh&aacute;ch!</p>
</td>
</tr>
<tr>
<td style="font-size:9px; font-style:italic; text-align:center">&nbsp;</td>
</tr>
</tbody>
</table>
</div>
</div>

      `
    }
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
