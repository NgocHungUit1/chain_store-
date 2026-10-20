import {Component, OnInit} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {format, startOfMonth, subMonths} from 'date-fns';
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

  setBy(by: 'product' | 'group') {
    if (this.by !== by) {
      this.by = by;
      this.load();
    }
  }
}
