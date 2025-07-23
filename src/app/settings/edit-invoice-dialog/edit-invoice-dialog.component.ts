import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { SharedEditorComponent, EditorConfig } from '../../shared/shared-editor/shared-editor.component';
import { Observable, of, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import {InvoiceData} from '../../shared/preview.service';

interface SuggestTemplate {
  id: string;
  name: string;
  content: string;
}

@Component({
  selector: 'app-edit-invoice-dialog',
  templateUrl: './edit-invoice-dialog.component.html',
  styleUrls: ['./edit-invoice-dialog.component.css'],
})
export class EditInvoiceDialogComponent implements OnInit {
  @ViewChild(SharedEditorComponent) sharedEditor!: SharedEditorComponent;

  editorConfig: EditorConfig;
  templateData: Partial<InvoiceData> = {};
  templateName: string = ''; // Add templateName property
  template: any = {}; // Changed to any to allow name property

  // Suggest templates properties
  suggestInvoiceTemplates: SuggestTemplate[] = [];
  selectedTemplateId: string = ''; // Default empty value
  editorContent: string = ''; // Content for the editor, can be set from data
  isEditMode: boolean = false; // Flag to check if in edit mode
  header: string = 'Chỉnh sửa mẫu in hóa đơn';
  templateId: string = ''; // Template ID for edit mode
  constructor(
    public dialogRef: MatDialogRef<EditInvoiceDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.templateData = data['templateData'] || {};
    this.templateName = data['template']?.name || 'New Template'; // Initialize templateName
    this.template = data['template'];
    this.editorContent = data['editorContent'] || ''; // Initialize editor content
    this.templateId = data['templateId'] || '';
    this.isEditMode = !!this.templateId;
    this.header = this.isEditMode ? 'Chỉnh sửa mẫu in hóa đơn' : 'Tạo mới mẫu in hóa đơn';
    // Configure editor for dialog (with toolbar enabled)
    this.editorConfig = {
      elementId: 'popup',
      height: 400,
      readOnly: false,
      showToolbar: true,
      initialContent: data['editorContent'] || ''
    };
  }

  ngOnInit(): void {
    // Load suggest templates
    this.loadSuggestTemplates();

  }

  // Load suggest templates from API (with fake data for now)
  loadSuggestTemplates(): void {
    this.getSuggestTemplates().subscribe(
      (templates: SuggestTemplate[]) => {
        this.suggestInvoiceTemplates = templates;
        // Set default empty value after loading
        this.selectedTemplateId = '';
      },
      (error) => {
        console.error('Error loading suggest templates:', error);
        // Fallback to fake data on error
        this.suggestInvoiceTemplates = this.getFakeSuggestTemplates();
        this.selectedTemplateId = '';
      }
    );
  }

  // API call method (currently returns fake data)
  getSuggestTemplates(): Observable<SuggestTemplate[]> {
    // TODO: Replace with actual API endpoint
    // return this.http.get<SuggestTemplate[]>('/api/suggest-templates');

    // For now, return fake data (without the empty option)
    return of(this.getFakeSuggestTemplates());
  }

  // Fake data for suggest templates (removed empty option)
  getFakeSuggestTemplates(): SuggestTemplate[] {
    return [
      {
        id: 'template-1',
        name: 'Mẫu hóa đơn cơ bản',
        content: `
          <div id="kv-cke-temp>
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
<td style="text-align:center"><span style="font-size:10px"><span style="font-family:Arial,Helvetica,sans-serif">{Logo_Cua_Hang}</span></span></td>
</tr>
<tr>
<td style="text-align:center"><span style="font-size:16px"><span style="font-family:Arial,Helvetica,sans-serif"><strong>{Ten_Cua_Hang}</strong></span></span></td>
</tr>
<tr>
<td style="text-align:center"><span style="font-size:10px"><span style="font-family:Arial,Helvetica,sans-serif">Địa chỉ: {Dia_Chi_Chi_Nhanh} - {Phuong_Xa_Chi_Nhanh} - {Khu_Vuc_Chi_Nhanh_QH_TP}</span></span></td>
</tr>
<tr>
<td style="text-align:center"><span style="font-size:10px"><span style="font-family:Arial,Helvetica,sans-serif">Điện thoại: {Dien_Thoai_Chi_Nhanh}</span></span></td>
</tr>
</tbody>
</table>
</td>
</tr>
</tbody>
</table>

<div style="padding:10px 0 0; text-align:center"><span style="font-size:16px"><span style="font-family:Arial,Helvetica,sans-serif"><strong>{Tieu_De_In HÓA ĐƠN BÁN LẺ|HÓA ĐƠN TẠM TÍNH}</strong></span></span></div>

<table style="width:100%">
<tbody>
<tr>
<td style="text-align:center"><span style="font-size:10px"><span style="font-family:Arial,Helvetica,sans-serif">Số HĐ: {Ma_Don_Hang}</span></span></td>
</tr>
<tr>
<td style="text-align:center"><span style="font-size:10px"><span style="font-family:Arial,Helvetica,sans-serif">Ngày {Ngay} tháng {Thang} năm {Nam}</span></span></td>
</tr>
</tbody>
</table>

<table cellpadding="3" style="width:98%">
<tbody>
<tr>
<td style="border-bottom:1px solid black; border-top:1px solid black; width:35%"><span style="font-size:10px"><span style="font-family:Arial,Helvetica,sans-serif"><strong>Tên hàng</strong></span></span></td>
<td style="border-bottom:1px solid black; border-top:1px solid black; text-align:center; width:20%"><span style="font-size:10px"><span style="font-family:Arial,Helvetica,sans-serif"><strong>Đ. giá</strong></span></span></td>
<td style="border-bottom:1px solid black; border-top:1px solid black; text-align:center; width:10%"><span style="font-size:10px"><span style="font-family:Arial,Helvetica,sans-serif"><strong>SL</strong></span></span></td>
<td style="border-bottom:1px solid black; border-top:1px solid black; text-align:right; width:22%"><span style="font-size:10px"><span style="font-family:Arial,Helvetica,sans-serif"><strong>T.tiền</strong></span></span></td>
</tr>
<tr>
<td style="border-bottom:1px dashed black"><span style="font-size:10px"><span style="font-family:Arial,Helvetica,sans-serif">{Ten_Hang_Hoa}</span></span></td>
<td style="border-bottom:1px dashed black; text-align:right"><span style="font-size:10px"><span style="font-family:Arial,Helvetica,sans-serif">{Don_Gia_Sau_Chiet_Khau}</span></span></td>
<td style="border-bottom:1px dashed black; text-align:center"><span style="font-size:10px"><span style="font-family:Arial,Helvetica,sans-serif">{So_Luong}</span></span></td>
<td style="border-bottom:1px dashed black; text-align:right"><span style="font-size:10px"><span style="font-family:Arial,Helvetica,sans-serif">{Thanh_Tien}</span></span></td>
</tr>
</tbody>
</table>

<table border="0" cellpadding="3" cellspacing="0" style="border-collapse:collapse; margin-top:20px; width:98%">
<tfoot>
<tr>
<td style="font-weight:bold; text-align:right; white-space:nowrap"><span style="font-size:10px"><span style="font-family:Arial,Helvetica,sans-serif">Tổng tiền hàng:</span></span></td>
<td style="font-weight:bold; text-align:right"><span style="font-size:10px"><span style="font-family:Arial,Helvetica,sans-serif">{Tong_Tien_Hang}</span></span></td>
</tr>
<tr>
<td style="font-weight:bold; text-align:right; white-space:nowrap"><span style="font-size:10px"><span style="font-family:Arial,Helvetica,sans-serif">Chiết khấu {Chiet_Khau_Hoa_Don_Phan_Tram}:</span></span></td>
<td style="font-weight:bold; text-align:right"><span style="font-size:10px"><span style="font-family:Arial,Helvetica,sans-serif">{Chiet_Khau_Hoa_Don}</span></span></td>
</tr>
<tr>
<td style="font-weight:bold; text-align:right; white-space:nowrap"><span style="font-size:10px"><span style="font-family:Arial,Helvetica,sans-serif">Tổng thanh toán:</span></span></td>
<td style="font-weight:bold; text-align:right"><span style="font-size:10px"><span style="font-family:Arial,Helvetica,sans-serif">{Tong_Cong}</span></span></td>
</tr>
<tr>
<td colspan="2" style="font-style:italic; text-align:left"><span style="font-size:10px"><span style="font-family:Arial,Helvetica,sans-serif">({Tong_Cong_Bang_Chu})</span></span></td>
</tr>
<tr>
<td colspan="2" style="font-weight:bold; text-align:center"><span style="font-size:10px"><span style="font-family:Arial,Helvetica,sans-serif">{Ma_QR}</span></span></td>
</tr>
</tfoot>
</table>

<table style="margin-top:20px; width:100%">
<tbody>
<tr>
<td style="font-style:italic; text-align:center"><span style="font-size:10px"><span style="font-family:Arial,Helvetica,sans-serif">Xin Cảm ơn Quý khách và Hẹn gặp lại!</span></span></td>
</tr>
<tr>
<td style="font-size:9px; font-style:italic; text-align:center">&nbsp;</td>
</tr>
</tbody>
</table>
</div>
</div>
</div>
        `
      },
      {
        id: 'template-2',
        name: 'Mẫu hóa đơn chi tiết',
        content: `
          <div style="text-align: center; margin-bottom: 30px;">
            <h1>CÔNG TY TNHH ABC</h1>
            <p>Địa chỉ: 123 Đường ABC, Quận 1, TP.HCM</p>
            <p>Điện thoại: 0123-456-789</p>
            <hr>
            <h2>HÓA ĐƠN BÁN HÀNG</h2>
            <p>Số: {{invoiceNumber}} - Ngày: {{invoiceDate}}</p>
          </div>
          <div style="margin-bottom: 20px;">
            <div style="float: left; width: 50%;">
              <strong>Thông tin khách hàng:</strong><br>
              Tên: {{customerName}}<br>
              Địa chỉ: {{customerAddress}}<br>
              Điện thoại: {{customerPhone}}<br>
              Email: {{customerEmail}}
            </div>
            <div style="float: right; width: 50%;">
              <strong>Thông tin giao hàng:</strong><br>
              Ngày giao: {{deliveryDate}}<br>
              Địa chỉ giao: {{deliveryAddress}}<br>
              Ghi chú: {{notes}}
            </div>
            <div style="clear: both;"></div>
          </div>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <thead>
              <tr style="background-color: #4CAF50; color: white;">
                <th style="border: 1px solid #ddd; padding: 12px;">STT</th>
                <th style="border: 1px solid #ddd; padding: 12px;">Mã hàng</th>
                <th style="border: 1px solid #ddd; padding: 12px;">Tên hàng</th>
                <th style="border: 1px solid #ddd; padding: 12px;">ĐVT</th>
                <th style="border: 1px solid #ddd; padding: 12px;">Số lượng</th>
                <th style="border: 1px solid #ddd; padding: 12px;">Đơn giá</th>
                <th style="border: 1px solid #ddd; padding: 12px;">Thành tiền</th>
              </tr>
            </thead>
            <tbody>
              {{#each items}}
              <tr>
                <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">{{@index}}</td>
                <td style="border: 1px solid #ddd; padding: 8px;">{{code}}</td>
                <td style="border: 1px solid #ddd; padding: 8px;">{{name}}</td>
                <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">{{unit}}</td>
                <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">{{quantity}}</td>
                <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">{{price}}</td>
                <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">{{total}}</td>
              </tr>
              {{/each}}
            </tbody>
          </table>
          <div style="text-align: right;">
            <p>Tạm tính: {{subtotal}} VNĐ</p>
            <p>VAT ({{vatRate}}%): {{vatAmount}} VNĐ</p>
            <p>Giảm giá: {{discount}} VNĐ</p>
            <h3>Tổng cộng: {{totalAmount}} VNĐ</h3>
          </div>
        `
      },
      {
        id: 'template-3',
        name: 'Mẫu hóa đơn đơn giản',
        content: `
          <div style="text-align: center;">
            <h3>HÓA ĐƠN</h3>
            <p>{{invoiceDate}}</p>
          </div>
          <p><strong>Khách hàng:</strong> {{customerName}}</p>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <th style="border: 1px solid #000; padding: 5px;">Sản phẩm</th>
              <th style="border: 1px solid #000; padding: 5px;">SL</th>
              <th style="border: 1px solid #000; padding: 5px;">Giá</th>
            </tr>
            {{#each items}}
            <tr>
              <td style="border: 1px solid #000; padding: 5px;">{{name}}</td>
              <td style="border: 1px solid #000; padding: 5px;">{{quantity}}</td>
              <td style="border: 1px solid #000; padding: 5px;">{{total}}</td>
            </tr>
            {{/each}}
          </table>
          <p style="text-align: right;"><strong>Tổng: {{totalAmount}} VNĐ</strong></p>
        `
      }
    ];
  }



  onContentChanged(content: string): void {
    console.log('Content changed in dialog:', content.length);
  }

  onDataChanged(data: Partial<InvoiceData>): void {
    this.templateData = data;
  }

  onClose(): void {
    this.dialogRef.close();
  }

  onSave(): void {
    const result = {
      editorContent: this.sharedEditor.getContent(),
      templateData: this.templateData,
      template: {
        ...this.data.template,
        name: this.template.name || this.templateName
      },
      action: 'save'
    };
    this.dialogRef.close(result);
  }

  onDelete(): void {
    if (this.isEditMode && this.templateId) {
      // Show confirmation dialog
      if (confirm(`Bạn có chắc chắn muốn xóa mẫu in "${this.template.name || this.templateName}"?`)) {
        const result = {
          templateId: this.templateId,
          action: 'delete'
        };
        this.dialogRef.close(result);
      }
    }
  }

  // Handle suggest template selection
  onChangeInvoiceTemplate(event: any): void {
    const selectedTemplate = this.suggestInvoiceTemplates.find(
      template => template.id === event.value
    );

    if (selectedTemplate && this.sharedEditor) {
      // Update editor content with selected template


      this.sharedEditor.setContent(selectedTemplate.content);
    }
  }
}
