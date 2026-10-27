import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {forkJoin, Observable, of} from 'rxjs';
import {catchError, map} from 'rxjs/operators';
import * as numeral from 'numeral';
import {environment} from '../../../environments/environment';
import {InvoiceData, PreviewService} from './preview.service';
import {PrintService} from './print.service';
import {InvoiceTemplate, InvoiceTemplateService} from './invoice-template.service';

export interface InvoicePrintContext {
  logo?: string;        // URL logo cửa hàng; trống thì dùng logo mặc định
  staffName?: string;   // người in / thu ngân
  greeting?: string;    // lời chào cuối (mô tả cửa hàng)
}

/**
 * In hoá đơn bán theo mẫu (invoice_template type=invoice), dùng chung cho màn bán hàng và nút In ở danh sách hoá đơn.
 * Dữ liệu lấy từ POST invoice/get-data-invoice-print.
 */
@Injectable({
  providedIn: 'root'
})
export class InvoicePrintService {

  constructor(
    private http: HttpClient,
    private previewService: PreviewService,
    private printService: PrintService,
    private invoiceTemplateService: InvoiceTemplateService,
  ) {
  }

  /**
   * In lại một hoá đơn đã lưu bằng mẫu đang chọn (hoặc mẫu đầu tiên đang hoạt động).
   * @returns false nếu không có mẫu nào -> bên gọi tự dùng cách in cũ
   */
  printInvoice(invoiceId: number, ctx: InvoicePrintContext = {}): Observable<boolean> {
    const data$ = this.http.post<any>(environment.apiUrl + '/invoice/get-data-invoice-print/', {invoice_id: invoiceId});
    const active = this.invoiceTemplateService.getActiveTemplate();
    const template$: Observable<InvoiceTemplate> = active && active.body
      ? of(active)
      : this.invoiceTemplateService.getAllTemplates().pipe(
        map(list => (list || [])[0] || null),
        catchError(() => of(null)),
      );

    return forkJoin([data$, template$]).pipe(map(([data, template]) => {
      if (!template || !template.body) {
        return false;
      }
      const printData = this.buildData(data, {...ctx, staffName: ctx.staffName || data?.created_user?.username});
      printData.Ma_QR = '';
      this.print(template.body, printData);
      return true;
    }));
  }

  /** Dựng biến cho mẫu in từ dữ liệu get-data-invoice-print */
  buildData(preInvoiceData: any, ctx: InvoicePrintContext = {}): Partial<InvoiceData> {
    const {nationalPrescription} = preInvoiceData || {};
    let customer_info = '';
    if (nationalPrescription) {
      customer_info = `
      <p>Mã đơn thuốc: <b>${nationalPrescription?.nationalPrescriptionId || ''}</b></p>
      <p>Tên đơn vị: <b>${nationalPrescription?.medicalFacilityName || ''}</b></p>
      <p>Họ tên: <b>${nationalPrescription?.patientName || ''}</b></p>
      <p>SĐT: <b>${nationalPrescription?.patientPhoneNumber || ''}</b></p>
      <p>Ngày sinh: <b>${nationalPrescription?.patientDOB || ''}</b>
        Cân nặng: <b>${nationalPrescription?.patientWeight || ''}</b>
        Giới tính: <b>${nationalPrescription?.patientSex || ''}</b></p>
      <br>
      <p><b>Chẩn đoán:</b> ${nationalPrescription?.diagnostics?.[0]?.conclusion || ''}</p>
        `;
    } else {
      const customer_name = preInvoiceData?.customer?.name || preInvoiceData?.prescription?.name || 'Khách lẻ';
      customer_info += `<p>Khách hàng: ${customer_name}</p>`;
      const customer_phone = preInvoiceData?.customer?.phone || '';
      if (customer_phone) {
        customer_info += `<p>SĐT: ${customer_phone}</p>`;
      }
    }
    // Giá bán đã gồm VAT (total_vat = 0): tách ngược VAT từ thành tiền từng dòng để bill ghi
    // đúng "Tổng tiền hàng (chưa VAT)" và "VAT" như HĐĐT. Hoá đơn cũ có cộng thêm VAT thì giữ nguyên.
    const savedVat = numeral(preInvoiceData?.total_vat).value() || 0;
    const totalPrice = numeral(preInvoiceData?.total_price || 0).value() || 0;
    const billVat = savedVat > 0 ? savedVat : (preInvoiceData?.detail || []).reduce((sum, item) => {
      const percent = Number(item?.vat_percent) || 0;
      const line = numeral(item?.total || 0).value() || 0;
      return percent > 0 ? sum + Math.round(line - line / (1 + percent / 100)) : sum;
    }, 0);
    const billBeforeVat = savedVat > 0 ? totalPrice : totalPrice - billVat;
    const paid = numeral(preInvoiceData?.sum_payment || 0).value() || 0;
    const debt = numeral(preInvoiceData?.debt || 0).value() || 0;
    const created = new Date(preInvoiceData?.created_at_iso);

    return {
      Logo: ctx.logo ? `<img src="${ctx.logo}" style="max-width: 60px;">` :
        `<img src="assets/images/Rx20_16x16_op1-1207.png" style="max-width: 60px;">`,
      Ten_Cua_Hang: preInvoiceData?.store?.name || 'Chi nhánh trung tâm',
      Dia_Chi_Cua_Hang: preInvoiceData?.store?.address || '',
      So_Dien_Thoai_Cua_Hang: preInvoiceData?.created_user?.phone_number || '',
      Tieu_De_In: preInvoiceData?.header || 'HÓA ĐƠN BÁN HÀNG',
      So_Hoa_Don: preInvoiceData?.invoice_no || '',
      Ma_Don_Hang: preInvoiceData?.invoice_no || '',
      Ngay: created.getDate().toString().padStart(2, '0'),
      Thang: (created.getMonth() + 1).toString().padStart(2, '0'),
      Nam: created.getFullYear().toString(),
      Ngay_Ban: created.toLocaleDateString('vi-VN'),
      Gio_Ban: created.toLocaleTimeString('vi-VN', {hour: '2-digit', minute: '2-digit'}),
      Nhan_Vien: ctx.staffName || '',
      Khach_Hang: preInvoiceData?.customer?.name || 'Khách lẻ',
      So_Dien_Thoai: preInvoiceData?.customer?.phone || '',
      Dia_Chi_Khach_Hang: preInvoiceData?.customer?.address || '',
      Phuong_Xa_Khach_Hang: preInvoiceData?.customer?.ward?.name || '',
      Khu_Vuc_Khach_Hang_QH_TP: preInvoiceData?.customer?.province?.name || '',
      Don_Vi_Co_Quan_Khach_Hang: preInvoiceData?.customer?.company_name || '',
      items: preInvoiceData?.detail?.map((item, index) => ({
        STT: index + 1,
        Ten_Hang_Hoa: item?.product?.product_name || '',
        Don_Gia_Chiet_Khau: numeral(item?.price || 0).format('0,0'),
        So_Luong: (item.amount || 0).toString(),
        Thanh_Tien: numeral(item?.total || 0).format('0,0'),
        Don_Vi: item?.base_unit,
        Don_Gia: numeral(item?.price || 0).format('0,0'),
        So_Lo: item?.so_lo || '',
        Ghi_Chu: item?.note || '',
        VAT: item?.vat_percent,
        Anh_San_Pham: item?.product?.default_image || '/assets/images/default-product.png',
      })) || [],
      Tong_Tien_Hang: numeral(numeral(preInvoiceData?.total_price || 0).value() + numeral(preInvoiceData?.total_vat).value()).format('0,0'),
      Tong_Cong: numeral(paid).format('0,0'),
      Thu_Khac: numeral(preInvoiceData?.expenses_order_price || 0).format('0,0'), // phí thu khác khi bán
      // Tổng phải trả của hoá đơn: đã trả + còn nợ (debt = tổng - chiết khấu - đã trả, tính ở backend)
      Tong_Phai_Tra: numeral(paid + debt).format('0,0'),
      Tong_Phai_Tra_Bang_Chu: this.numberToVietnameseText(paid + debt),
      Tong_Tien_Hang_Bang_Chu: this.numberToVietnameseText(paid),
      Tong_So_Luong: preInvoiceData?.detail?.reduce((acc, item) => acc + (item?.amount || 0), 0).toString(),
      Chiet_Khau: preInvoiceData?.discount || '0',
      Khach_Thanh_Toan: numeral(paid).format('0,0'),
      Con_Lai: numeral(debt).format('0,0'),
      Thong_Tin_Khach_Hang: customer_info,
      Ghi_Chu_Don_Hang: preInvoiceData?.note,
      VAT_Tong: numeral(billVat).format('0,0'),
      Tong_Tien_Hang_Chua_VAT: numeral(billBeforeVat).format('0,0'),
      Loi_Chao_Cuoi: ctx.greeting,
    };
  }

  /** Ghép mẫu + dữ liệu rồi in qua iframe (chờ ảnh QR tải xong nếu có) */
  print(templateBody: string, dataToPrint: Partial<InvoiceData>) {
    const content = this.previewService.fillTemplate(templateBody, dataToPrint);
    const styleMatch = content.match(/<style[^>]*>([\s\S]*?)<\/style>/i);
    const extractedStyle = styleMatch?.[1] || '';
    const contentWithoutStyle = content.replace(styleMatch?.[0] || '', '');
    const printHtml = `
        <!DOCTYPE html>
        <html lang="vi">
          <head>
            <title>In hóa đơn</title>
            <style>
              @media print {
               @page {
                  margin: 0;
                  size: auto;
                }
                ${extractedStyle}
                table td {
                  word-break: normal;
                  overflow-wrap: break-word;
                  white-space: pre-line;
                }
              }
            </style>
          </head>
          <body>
            ${contentWithoutStyle}
            <script>
               var qrLoaded = false;

              function onQrLoaded() {
                qrLoaded = true;
                window.parent.postMessage({ action: 'PRINT_READY' }, '*');
              }

              window.onload = function () {
                if (!qrLoaded) {
                  window.parent.postMessage({ action: 'PRINT_READY' }, '*');
                }
              };
            </script>
          </body>
        </html>
      `;
    this.printService.print(printHtml);
  }

  numberToVietnameseText(number) {
    if (isNaN(number) || number < 0) {
      return 'Invalid input';
    }
    return `${this.convertNumberToVietnameseWords(number)} đồng chẵn`;
  }

  convertNumberToVietnameseWords(number: number) {
    const scales = ['', 'nghìn', 'triệu', 'tỷ', 'nghìn tỷ', 'triệu tỷ'];
    if (number === 0) {
      return 'Không';
    }
    let numStr = Math.round(number).toString();
    const remainder = numStr.length % 3;
    if (remainder > 0) {
      numStr = '0'.repeat(3 - remainder) + numStr;
    }
    const groups = [];
    for (let i = 0; i < numStr.length; i += 3) {
      groups.push(numStr.substring(i, i + 3));
    }
    const results = [];
    groups.forEach((group, index) => {
      const groupIndex = groups.length - 1 - index;
      if (parseInt(group, 10) > 0) {
        results.push(this.convertGroupToVietnamese(group) + (groupIndex > 0 ? ' ' + scales[groupIndex] : ''));
      }
    });
    const result = results.join(' ');
    return result.charAt(0).toUpperCase() + result.slice(1);
  }

  convertGroupToVietnamese(group: string) {
    const units = ['', 'một', 'hai', 'ba', 'bốn', 'năm', 'sáu', 'bảy', 'tám', 'chín'];
    const digits = group.split('').map(d => parseInt(d, 10));
    let result = '';
    if (digits[0] > 0) {
      result += units[digits[0]] + ' trăm';
    }
    if (digits[1] > 0) {
      if (result !== '') {
        result += ' ';
      }
      result += digits[1] === 1 ? 'mười' : units[digits[1]] + ' mươi';
      if (digits[2] > 0) {
        if (digits[2] === 1 && digits[1] > 1) {
          result += ' mốt';      // hai mươi mốt; 11 vẫn là "mười một"
        } else if (digits[2] === 5) {
          result += ' lăm';      // mười lăm, hai mươi lăm
        } else {
          result += ' ' + units[digits[2]];
        }
      }
    } else if (digits[2] > 0) {
      if (result !== '') {
        result += ' lẻ ';
      }
      result += units[digits[2]];
    }
    return result;
  }
}
