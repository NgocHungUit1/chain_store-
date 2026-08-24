import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { PopupConfirmDialogComponent } from '../common/popup-confirm-dialog/popup-confirm-dialog.component';

/**
 * Xác nhận rủi ro khi cửa hàng tự đổi cấu hình "Quản lý theo lô" của một sản phẩm.
 * Dùng chung cho form thuốc và form hàng hoá để nội dung cảnh báo luôn khớp nhau.
 */
@Injectable({
  providedIn: 'root'
})
export class BatchTrackingConfirmService {

  constructor(private dialog: MatDialog) {
  }

  /**
   * @param enable true = đang bật lô, false = đang tắt lô
   * @returns Observable<boolean> — true nếu người dùng bấm Đồng ý
   */
  confirmChange(enable: boolean): Observable<boolean> {
    const dialogRef = this.dialog.open(PopupConfirmDialogComponent, {
      width: '600px',
      data: {
        title: enable ? 'Xác nhận BẬT quản lý theo lô' : 'Xác nhận TẮT quản lý theo lô',
        content: enable ? this.enableContent() : this.disableContent(),
      }
    });

    return dialogRef.afterClosed().pipe(map(res => !!res && res.event === 'confirm'));
  }

  private disableContent(): string {
    return '<span style="color:#d32f2f"><b>Cửa hàng tự chịu trách nhiệm với các rủi ro sau:</b></span>'
      + '<ul style="font-weight:400">'
      + '<li>Sản phẩm này sẽ <b>không còn ghi số lô và hạn dùng</b> khi nhập kho và khi bán '
      + '→ không truy xuất được lô khi có sự cố về thuốc, không cảnh báo được hàng cận date.</li>'
      + '<li><b>Rủi ro pháp lý</b>: dữ liệu phát sinh trong thời gian tắt lô không đáp ứng yêu cầu '
      + 'truy xuất nguồn gốc theo lô khi thanh tra dược.</li>'
      + '<li>Tồn theo lô hiện có được <b>giữ nguyên nhưng sẽ không bị trừ</b> khi bán '
      + '→ báo cáo tồn kho theo lô, hạn dùng của sản phẩm này không còn chính xác.</li>'
      + '</ul>'
      + 'Bạn có chắc chắn muốn tắt quản lý theo lô cho sản phẩm này?';
  }

  private enableContent(): string {
    return 'Sau khi bật, <b>mỗi lần nhập hàng phải nhập số lô và hạn dùng</b>, khi bán hệ thống tự xuất lô theo cấu hình FEFO/FIFO.'
      + '<ul style="font-weight:400">'
      + '<li>Phần tồn hiện có mà chưa gắn lô sẽ được hệ thống gom vào <b>một lô "tồn cũ" (hạn 31/12/2028)</b> '
      + 'để sản phẩm vẫn bán được bình thường.</li>'
      + '<li><span style="color:#d32f2f">Số lô và hạn dùng thật của phần tồn đó <b>không khôi phục được</b></span> '
      + '— nếu cần đúng lô, hãy kiểm kho lại sau khi bật.</li>'
      + '</ul>'
      + 'Bạn có chắc chắn muốn bật quản lý theo lô cho sản phẩm này?';
  }
}
