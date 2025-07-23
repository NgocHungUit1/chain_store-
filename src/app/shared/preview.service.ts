import { Injectable } from '@angular/core';
import { EditorInstance } from './editor.service';

export interface InvoiceData {
  Tieu_De_In: string;
  Ma_Don_Hang: string;
  Ngay: string;
  Thang: string;
  Nam: string;

  Khach_Hang: string;
  So_Dien_Thoai: string;
  Dia_Chi_Khach_Hang: string;
  Phuong_Xa_Khach_Hang: string;
  Khu_Vuc_Khach_Hang_QH_TP: string;

  items: Array<{
    Ten_Hang_Hoa: string;
    Don_Gia_Chiet_Khau: string;
    So_Luong: string;
    Thanh_Tien: string;
  }>;

  Tong_Tien_Hang: string;
  Chiet_Khau_Hoa_Don_Phan_Tram: string;
  Chiet_Khau_Hoa_Don: string;
  Tong_Cong: string;
  Tong_Cong_Bang_Chu: string;
}

@Injectable({
  providedIn: 'root'
})
export class PreviewService {

  constructor() {}

  // Update template content (from editor)
  updateTemplateContent(id:string, content: string): void {
    const contentWithData = this.fillTemplate(content, this.getSampleData());
    const previewElement = document.getElementById('preview-content-'+id);
    if (previewElement) {
      previewElement.innerHTML = contentWithData;
    }
  }

  // Setup editor change listener
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
    return {
      Tieu_De_In: 'HÓA ĐƠN BÁN HÀNG',
      Ma_Don_Hang: 'HD001234',
      Ngay: today.getDate().toString().padStart(2, '0'),
      Thang: (today.getMonth() + 1).toString().padStart(2, '0'),
      Nam: today.getFullYear().toString(),

      Khach_Hang: 'Nguyễn Văn A',
      So_Dien_Thoai: '0123456789',
      Dia_Chi_Khach_Hang: '123 Đường ABC',
      Phuong_Xa_Khach_Hang: 'Phường XYZ',
      Khu_Vuc_Khach_Hang_QH_TP: 'Quận 1, TP.HCM',

      // Array of 3 items for table rows using Vietnamese field names
      items: [
        {
          Ten_Hang_Hoa: 'Paracetamol 500mg',
          Don_Gia_Chiet_Khau: '15,000',
          So_Luong: '10',
          Thanh_Tien: '150,000',
        },
        {
          Ten_Hang_Hoa: 'Vitamin C 1000mg',
          Don_Gia_Chiet_Khau: '25,000',
          So_Luong: '5',
          Thanh_Tien: '125,000',
        },
        {
          Ten_Hang_Hoa: 'Aspirin 100mg',
          Don_Gia_Chiet_Khau: '12,000',
          So_Luong: '8',
          Thanh_Tien: '96,000',
        }
      ],

      Tong_Tien_Hang: '371,000',
      Chiet_Khau_Hoa_Don_Phan_Tram: '5%',
      Chiet_Khau_Hoa_Don: '18,550',
      Tong_Cong: '352,450',
      Tong_Cong_Bang_Chu: 'Ba trăm năm mươi hai nghìn bốn trăm năm mươi đồng'
    };
  }

  fillTemplate(template: string, data: Partial<InvoiceData>): string {
    let filledTemplate = template;

    // Handle {{#each items}} loops first


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
      // Fix: Assign the result of replace back to filledTemplate
      filledTemplate = filledTemplate.replace(resultRows[0], '{productRows}');
      console.log('F1: ', filledTemplate);
      if(resultRows.length >1) {
        resultRows.slice(1).forEach(element => {
          filledTemplate = filledTemplate.replace(element, '');
          console.log('F2: ', filledTemplate);

        })
      }
      debugger;
      // Generate rows for each item
      if (resultRows.length > 0 && data.items && Array.isArray(data.items)) {
        const generatedRows = data.items.map(item => {
          return resultRows.map(row => {
            let newRow = row;
            // Replace placeholders with actual item data
            newRow = newRow.replace(/\{Ten_Hang_Hoa\}/g, item.Ten_Hang_Hoa || '');
            newRow = newRow.replace(/\{Don_Gia_Chiet_Khau\}/g, item.Don_Gia_Chiet_Khau || '');
            newRow = newRow.replace(/\{So_Luong\}/g, item.So_Luong || '');
            newRow = newRow.replace(/\{Thanh_Tien\}/g, item.Thanh_Tien || '');
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
