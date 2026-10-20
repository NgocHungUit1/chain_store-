import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {forkJoin, Observable, of} from 'rxjs';
import {catchError, map} from 'rxjs/operators';
import {environment} from '../../../environments/environment';
import {PreviewService} from './preview.service';
import {PrintService} from './print.service';

/**
 * In phiếu tư vấn dùng thuốc cho một hoá đơn.
 * Mẫu lấy từ invoice_template type=consult (mẫu riêng của cửa hàng trước, sau đó mẫu dùng chung).
 * Biến dùng trong mẫu: các biến của hoá đơn + {Di_Ung_Thuoc}, {Benh_Nen}; mỗi dòng thuốc có
 * {Hoat_Chat}, {Cach_Dung} (cách dùng của sản phẩm + ghi chú dòng lúc bán).
 */
@Injectable({
  providedIn: 'root'
})
export class ConsultPrintService {

  constructor(
    private http: HttpClient,
    private previewService: PreviewService,
    private printService: PrintService,
  ) {
  }

  /** @returns false nếu không có mẫu phiếu tư vấn nào */
  print(invoiceId: number, staffName = ''): Observable<boolean> {
    const data$ = this.http.post<any>(environment.apiUrl + '/invoice/get-data-invoice-print/', {invoice_id: invoiceId});
    const template$ = this.http
      .get<any[]>(environment.apiUrl + '/invoice-template?per-page=50&InvoiceTemplateSearch[type]=consult')
      .pipe(catchError(() => of([])));

    return forkJoin([data$, template$]).pipe(map(([data, templates]) => {
      const active = (templates || []).filter(t => Number(t.status) === 10);
      // Ưu tiên mẫu riêng của cửa hàng
      const template = active.find(t => t.store_id) || active[0];
      if (!template) {
        return false;
      }
      this.printService.print(this.wrap(this.previewService.fillTemplate(template.body, this.buildData(data, staffName))));
      return true;
    }));
  }

  private buildData(data: any, staffName: string): any {
    const created = data?.created_at_iso ? new Date(data.created_at_iso) : new Date();
    return {
      Ten_Cua_Hang: data?.store?.name || '',
      Dia_Chi_Cua_Hang: data?.store?.address || '',
      So_Hoa_Don: data?.invoice_no || '',
      Ma_Don_Hang: data?.invoice_no || '',
      Ngay: created.getDate().toString().padStart(2, '0'),
      Thang: (created.getMonth() + 1).toString().padStart(2, '0'),
      Nam: created.getFullYear().toString(),
      Ngay_Ban: created.toLocaleDateString('vi-VN'),
      Khach_Hang: data?.customer?.name || data?.prescription?.name || 'Khách lẻ',
      So_Dien_Thoai: data?.customer?.phone || '',
      Nhan_Vien: staffName || data?.created_user?.username || '',
      Di_Ung_Thuoc: data?.customer?.drug_allergy || 'Không ghi nhận',
      Benh_Nen: data?.customer?.medical_history || 'Không ghi nhận',
      items: (data?.detail || []).map((item, index) => ({
        STT: index + 1,
        Ten_Hang_Hoa: item?.product?.product_name || '',
        So_Luong: (item?.amount || 0).toString(),
        Don_Vi: item?.base_unit || '',
        Hoat_Chat: item?.hoat_chat || '',
        Cach_Dung: item?.cach_dung || '',
        Ghi_Chu: item?.note || '',
      })),
    };
  }

  /** Cùng khung HTML với bản in hoá đơn ở màn bán hàng (iframe + PRINT_READY) */
  private wrap(content: string): string {
    const styleMatch = content.match(/<style[^>]*>([\s\S]*?)<\/style>/i);
    const style = styleMatch?.[1] || '';
    const body = content.replace(styleMatch?.[0] || '', '');
    return `
      <!DOCTYPE html>
      <html lang="vi">
        <head>
          <title>Phiếu tư vấn dùng thuốc</title>
          <style>
            @media print { @page { margin: 0; size: auto; } }
            ${style}
          </style>
        </head>
        <body>
          ${body}
          <script>
            window.onload = function () { window.parent.postMessage({ action: 'PRINT_READY' }, '*'); };
          </script>
        </body>
      </html>
    `;
  }
}
