import {Component, OnInit} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {format, startOfMonth, startOfYear, subMonths} from 'date-fns';
import {NotifierService} from 'angular-notifier';
import {environment} from '../../environments/environment';

/**
 * Báo cáo vòng quay hàng tồn kho (chi nhánh đang đăng nhập).
 * Vòng quay = giá vốn hàng bán / giá trị tồn bình quân; hàng quay chậm xếp lên đầu.
 */
@Component({
  selector: 'app-inventory-turnover',
  templateUrl: './inventory-turnover.component.html',
  styleUrls: ['./inventory-turnover.component.scss']
})
export class InventoryTurnoverComponent implements OnInit {
  dateFrom = format(startOfMonth(subMonths(new Date(), 2)), 'YYYY-MM-DD');
  dateTo = format(new Date(), 'YYYY-MM-DD');
  by: 'product' | 'group' = 'product';
  loading = false;
  summary: any = null;
  items: any[] = [];
  showCount = 200;

  constructor(private http: HttpClient, private notify: NotifierService) {
  }

  ngOnInit(): void {
    this.load();
  }

  load() {
    this.loading = true;
    this.showCount = 200;
    const params = {date_from: this.dateFrom, date_to: this.dateTo, by: this.by};
    this.http.get<any>(environment.apiUrl + '/report/inventory-turnover', {params}).subscribe(res => {
      this.summary = res?.summary;
      this.items = res?.items || [];
      this.loading = false;
    }, err => {
      this.loading = false;
      this.notify.notify('error', err?.error?.message || 'Không tải được báo cáo');
    });
  }

  /** Chọn nhanh khoảng thời gian rồi xem luôn */
  setRange(range: 'month' | '3m' | 'year') {
    const today = new Date();
    const from = range === 'month' ? startOfMonth(today)
      : range === '3m' ? startOfMonth(subMonths(today, 2))
        : startOfYear(today);
    this.dateFrom = format(from, 'YYYY-MM-DD');
    this.dateTo = format(today, 'YYYY-MM-DD');
    this.load();
  }

  setBy(by: 'product' | 'group') {
    if (this.by !== by) {
      this.by = by;
      this.items = []; // bỏ dữ liệu của chế độ cũ, tránh bảng nhóm hiện tạm dòng sản phẩm trong lúc tải
      this.load();
    }
  }
}
