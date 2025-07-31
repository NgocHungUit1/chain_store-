import { Injectable } from '@angular/core';
import { EditorInstance } from '../editor.service';
const sampleFields = require('./invoice-data-sample.json');

export interface InvoiceData {
  Ten_Cua_Hang: string;
  Dia_Chi_Cua_Hang: string;
  So_Dien_Thoai_Cua_Hang: string;
  Logo: string;
  Tieu_De_In: string;
  Ma_Don_Hang: string;
  So_Hoa_Don?: string; // Optional field for invoice number

  Ngay: string;
  Thang: string;
  Nam: string;
  Ngay_Ban: string; // Optional field for sale date
  Gio_Ban?: string; // Optional field for sale time
  Khach_Hang: string;
  Nhan_Vien: string;
  So_Dien_Thoai: string;
  Dia_Chi_Khach_Hang: string;
  Phuong_Xa_Khach_Hang: string;
  Khu_Vuc_Khach_Hang_QH_TP: string;
  items: Array<{
    Ten_Hang_Hoa: string;
    Don_Gia_Chiet_Khau: string;
    So_Luong: string;
    Thanh_Tien: string;
    Don_Vi?: string; // Optional field for unit
    Don_Gia?: string; // Optional field for unit price
    So_Lo?: string;
  }>;

  Tong_Tien_Hang: string;
  Chiet_Khau_Hoa_Don_Phan_Tram: string;
  Chiet_Khau_Hoa_Don: string;
  Tong_Cong: string;
  Khach_Thanh_Toan: string;
  Con_Lai: string;
  Tong_Tien_Hang_Bang_Chu: string;
  Tong_So_Luong: string;
  Chiet_Khau: string;
  Ma_QR: string;
  Thong_Tin_Khach_Hang: string;
}

@Injectable({
  providedIn: 'root'
})
export class PreviewService {

  constructor() {}

  /**
   * Update the template content in the preview area
   * This method fills the template with sample data and updates the preview element.
   * @param id
   * @param content
   */
  updateTemplateContent(id:string, content: string): void {
    const contentWithData = this.fillTemplate(content, this.getSampleData());
    const previewElement = document.getElementById('preview-content-'+id);
    if (previewElement) {
      previewElement.innerHTML = contentWithData;
    }
  }

  /**
   * Sets up synchronization between the editor and the template preview.
   * This method listens for changes in the editor and updates the preview content accordingly.
   * @param id
   * @param editor
   */
  setupEditorSync(id:string, editor: EditorInstance): void {
    // Update template content when editor changes
    editor.on('change', () => {
      this.updateTemplateContent(id, editor.getData());
    });

    // Set initial content
    this.updateTemplateContent(id, editor.getData());
  }


  getSampleData(): InvoiceData {
    const today = new Date();
    // Build data object from JSON fields
    const data: any = {};
    (sampleFields as Array<{name: string, sampleValue: any}>).forEach(field => {
      data[field.name] = field.sampleValue;
    });
    // Override date fields dynamically
    data.Ngay = today.getDate().toString().padStart(2, '0');
    data.Thang = (today.getMonth() + 1).toString().padStart(2, '0');
    data.Nam = today.getFullYear().toString();
    data.Ngay_Ban = today.toLocaleDateString('vi-VN', { year: 'numeric', month: '2-digit', day: '2-digit' });
    data.Gio_Ban = today.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });

    return data as InvoiceData;
  }

  /**
   * Fills the template with provided data.
   * This method replaces placeholders in the template with actual data values.
   * @param template
   * @param data
   */
  fillTemplate(template: string, data: Partial<InvoiceData>): string {
    let filledTemplate = template;

    // Handle the specific table pattern for items auto-generation
    const tableMatch = filledTemplate.match(/<table[^>]*>.*?\{Ten_Hang_Hoa\}.*?<\/table>/s);

    if (tableMatch) {
      const tableHtml = tableMatch[0];

      // Get all <tr> elements using a loop instead of matchAll
      const trMatches: string[] = [];
      const trRegex = /<tr>.*?<\/tr>/gs;
      let match;

      while ((match = trRegex.exec(tableHtml)) !== null) {
        trMatches.push(match[0]);
      }

      let found = false;
      const resultRows: string[] = [];

      for (const tr of trMatches) {
        // Start when we find the row containing {Ten_Hang_Hoa}
        if (!found && tr.includes('{Ten_Hang_Hoa}')) {
          found = true;
        }

        if (found) {
          // If the row doesn't contain any placeholder, stop
          if (!/{.*?}/.test(tr)) break;

          resultRows.push(tr);
        }
      }
      filledTemplate = filledTemplate.replace(resultRows[0], '{productRows}');
      console.log('F1: ', filledTemplate);
      if(resultRows.length >1) {
        resultRows.slice(1).forEach(element => {
          filledTemplate = filledTemplate.replace(element, '');
          console.log('F2: ', filledTemplate);

        })
      }

      const possiblePlaceHolders = [
        'Ten_Hang_Hoa',
        'Don_Gia_Chiet_Khau',
        'So_Luong',
        'Thanh_Tien',
        'Don_Vi',
        'So_Luong',
        'Don_Gia',
        'Thanh_Tien',
        'STT',
        'So_Lo'
      ]

      // Generate rows for each item
      if (resultRows.length > 0 && data.items && Array.isArray(data.items)) {
        const generatedRows = data.items.map(item => {
          return resultRows.map(row => {
            let newRow = row;
            possiblePlaceHolders.forEach(placeholder => {
              const regex = new RegExp(`\\{${placeholder}\\}`, 'g');
              newRow = newRow.replace(regex, item[placeholder] || '');
            })
            return newRow;
          }).join('\n');
        }).join('\n');

        filledTemplate = filledTemplate.replace('{productRows}', generatedRows);
        console.log('F3: ', filledTemplate);
      }
    }

    // Replace all other placeholders with actual data
    Object.keys(data).forEach(key => {
      const value = data[key as keyof InvoiceData];

      // Skip arrays as they're already handled above
      if (Array.isArray(value)) {
        return;
      }

      const stringValue = value || '';

      // Handle conditional placeholders like {Tieu_De_In HÓA ĐƠN BÁN HÀNG|HÓA ĐƠN TẠM TÍNH}
      const conditionalRegex = new RegExp(`\\{${key}\\s+([^|]+)\\|([^}]+)\\}`, 'g');
      filledTemplate = filledTemplate.replace(conditionalRegex, (match, option1, option2) => {
        return stringValue.includes(option1.trim()) ? option1.trim() : option2.trim();
      });

      // Replace simple placeholders like {{key}}
      const simpleRegex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
      filledTemplate = filledTemplate.replace(simpleRegex, stringValue);

      // Replace legacy placeholders like {key}
      const legacyRegex = new RegExp(`\\{${key}\\}`, 'g');
      filledTemplate = filledTemplate.replace(legacyRegex, stringValue);
    });

    return filledTemplate;
  }
}
