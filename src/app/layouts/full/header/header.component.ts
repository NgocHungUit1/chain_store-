import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {interval, Subscription} from 'rxjs';
import {PerfectScrollbarConfigInterface} from 'ngx-perfect-scrollbar';
import {Router} from '@angular/router';
import {AuthService} from '../../../authentication/auth.service';
import {MatDialog} from '@angular/material/dialog';
import {UserService} from '../../../user/user.service';
import {UserFormDialogComponent} from '../../../user/user-form-dialog/user-form-dialog.component';
import {NotifierService} from 'angular-notifier';
import {User} from '../../../user/user.model';
import {NotificationUser, NotificationUserFilter} from '../../../notification/notification-user.model';
import {NotificationUserService} from '../../../notification/notification-user.service';
import {NOTIFICATION_CLASS, NOTIFICATION_ICON, notificationLink} from '../../../notification/notification-link';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class AppHeaderComponent implements OnInit, OnDestroy {
  @Input() user: User;

  public config: PerfectScrollbarConfigInterface = {};
  userInfo: any = null;
  userLogin: any;


  // This is for Notifications
  notifications: NotificationUser[] = [
  ];
  countUnread = 0;
  countRead = 0;
  notiClass = NOTIFICATION_CLASS;
  notiIcon = NOTIFICATION_ICON;
  // Cảnh báo tồn thấp/hạn dùng do worker tạo trong ngày: hỏi lại số chưa đọc mỗi 2 phút
  private pollSub: Subscription;

  constructor(
    private dialog: MatDialog,
    private route: Router,
    private authSer: AuthService,
    private userService: UserService,
    private notiUserService: NotificationUserService,
    private notifyService: NotifierService,
    private router: Router,
  ) {
  }

  ngOnInit() {
    this.userService.getUserLogin().subscribe(res => {
      this.userLogin = res;
    });
    this.loadNotification();
    this.pollSub = interval(2 * 60 * 1000).subscribe(() => this.refreshUnread());
  }

  ngOnDestroy() {
    this.pollSub?.unsubscribe();
  }

  /** Chỉ tải lại danh sách khi số chưa đọc thay đổi, đỡ gọi API thừa */
  refreshUnread() {
    this.notiUserService.countSummary().subscribe(res => {
      if (res.unread !== this.countUnread || res.read !== this.countRead) {
        this.loadNotification();
      }
    });
  }

  loadUser(id) {
    this.userService.getUser(id).subscribe(res => {
      this.user = res;
    });
  }

  loadUserLogin() {
    this.userService.getUserLogin().subscribe(res => {
      this.userLogin = res;
    });
  }

  openUserFormDialog() {
    const obj = {
      action: 'Update',
      title: 'Cập nhật tài khoản',
      user_id: this.userLogin.id,
      update_pw: true
    };

    const dialogRef = this.dialog.open(UserFormDialogComponent, {
      data: obj,
      width: '50%',
      minHeight: '80%',
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadUser(result.id);
      }
    });
  }

  logout() {
    this.authSer.logout().subscribe(res => {
      if (res) {
        this.route.navigate(['/', 'authentication', 'login']);
      }
    });
  }

  loadNotification() {
    const notiUserFilter = new NotificationUserFilter();
    notiUserFilter.expand = 'notification,agentCount';
    notiUserFilter.sort = '-created_at';
    this.notiUserService.getList(notiUserFilter).subscribe(res => {
      this.notifications = res.body;
    });
    this.notiUserService.countSummary().subscribe(res => {
      this.countUnread = res.unread;
      this.countRead = res.read;
    });
  }

  /** Đánh dấu tất cả đã đọc, giữ menu mở */
  markAllRead(event: MouseEvent) {
    event.stopPropagation();
    if (this.countUnread === 0) {
      return;
    }
    this.notiUserService.markAllRead().subscribe(() => this.loadNotification());
  }

  makeAsRead(item, view = false) {
    // Bấm vào = đã đọc (API chỉ cho đánh dấu thông báo của chính mình)
    this.notiUserService.markRead(item.id).subscribe(x => {
      if (x) {
        // this.notifyService.notify('success', 'Đã xem thông báo!');
        item.is_read = 1;
        this.loadNotification();

        const link = view ? notificationLink(item.notification) : null;
        if (link) {
          this.router.navigateByUrl(link);
        }
      }
    });
  }
}
