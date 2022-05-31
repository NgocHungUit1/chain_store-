import {Component, OnInit, ViewChild} from '@angular/core';
import {ListComponentBase} from '../../shared/base';
import {ActivatedRoute, Router} from '@angular/router';
import {Location} from '@angular/common';
import {NotifierService} from 'angular-notifier';
import {AuthService} from '../../authentication/auth.service';
import {NotificationUserFilter} from '../../notification/notification-user.model';
import {NotificationUserService} from '../../notification/notification-user.service';
import {PriceListProductFilter} from '../../price-book/price-list-product.model';

@Component({
  selector: 'app-notification-list',
  templateUrl: './notification-list.component.html',
  styleUrls: ['./notification-list.component.css']
})
export class NotificationListComponent extends ListComponentBase implements OnInit {
  sidePanelOpened = true;
  notes = [];
  searchText;
  clrName = 'warning';
  colors = [{ colorName: 'info' }, { colorName: 'warning' }, { colorName: 'danger' }, { colorName: 'success' }];

  @ViewChild('sidenav') sidenav;

  apiFilter: NotificationUserFilter = new NotificationUserFilter();
  columnsToDisplay = [
    'created_at',
    'title',
    'description',
    'is_read',
    'actions',
  ];
  columnsHeader = {
    'title': 'Tiêu đề',
    'description': 'Mô tả',
    'is_read': '',
    'created_at': 'Ngày nhận',
    'actions': 'Hành động'
  };

  constructor(
    private mainSer: NotificationUserService,
    private route: ActivatedRoute,
    private router: Router,
    private location: Location,
    private notifier: NotifierService,
    public authSer: AuthService) {
    super();
  }

  ngOnInit() {
    this.selectedColumns = [...this.columnsToDisplay];
    this.apiFilter = this.buildFilterFromParams();
    this.loadData();
  }

  isOver(): boolean {
    return window.matchMedia(`(max-width: 960px)`).matches;
  }

  buildFilterFromParams(): NotificationUserFilter {
    function write<K extends keyof NotificationUserFilter>(arg: NotificationUserFilter, key: K, value: NotificationUserFilter[K]): void {
      arg[key] = value;
    }

    const filter = new NotificationUserFilter();
    const objectKeys = Object.keys(filter) as Array<keyof NotificationUserFilter>;

    for (const attr of objectKeys) {
      write(filter, attr, this.route.snapshot.queryParams['NotificationUserSearch[' + attr + ']']);
    }
    filter.page = this.route.snapshot.queryParams['page'];
    filter.pageSize = this.route.snapshot.queryParams['pageSize'];
    filter.sort = this.route.snapshot.queryParams['sort'];
    filter.expand = 'notification';
    return filter;
  }

  loadData(): void {
    this.loading = true;
    this.mainSer.getList(this.apiFilter).subscribe(res => {
      this.dataSource = res.body;
      this.pageTotalCount = Number(res.headers.get('X-Pagination-Total-Count'));
      this.pageSize = Number(res.headers.get('X-Pagination-Per-Page'));
      this.page = Number(res.headers.get('X-Pagination-Current-Page'));
      this.apiFilter.pageSize = this.pageSize;
      this.apiFilter.page = this.page;
      let url = '/setting/notification';
      url += '?' + this.apiFilter.toFilterString();
      this.location.go(url);
      this.loading = false;
    });
  }

  makeAsRead(item, view = false) {
    this.mainSer.update(item.id, {is_read: 1}).subscribe(x => {
      if (x) {
        // this.notifier.notify('success', 'Đã xem thông báo!');
        item.is_read = 1;
        this.sidenav.loadNotification();

        if (view) {
          if (item.notification.notification_type === 'lower_stock') {
            this.router.navigateByUrl('/store/product?quota_stock=lower');
          }
        }
      }
    });
  }

  delete(item) {
    this.mainSer.delete(item.id).subscribe(x => {
      this.notifier.notify('warning', 'Đã xóa thông báo!');
      this.loadData();
    });
  }

}
