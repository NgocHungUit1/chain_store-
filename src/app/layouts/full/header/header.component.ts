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
  // Hỏi lại số chưa đọc mỗi 30 giây: đơn đặt thuốc từ phòng khám cần nhà thuốc thấy sớm (chốt 02/11/2026)
  private pollSub: Subscription;
  // Id thông báo đơn đặt thuốc mới nhất đã thấy (null = chưa tải lần nào), để chỉ báo đơn mới đến sau
  private orderNotiBaseline: number = null;

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
    this.pollSub = interval(30 * 1000).subscribe(() => this.refreshUnread());
  }

  ngOnDestroy() {
    this.pollSub?.unsubscribe();
  }

  /** Chỉ tải lại danh sách khi số chưa đọc thay đổi, đỡ gọi API thừa */
  refreshUnread() {
    this.notiUserService.countSummary().subscribe(res => {
      if (res.unread !== this.countUnread || res.read !== this.countRead) {
        this.loadNotification(res.unread > this.countUnread);
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

  loadNotification(alertNewOrders = false) {
    const notiUserFilter = new NotificationUserFilter();
    notiUserFilter.expand = 'notification,agentCount';
    notiUserFilter.sort = '-created_at';
    this.notiUserService.getList(notiUserFilter).subscribe(res => {
      this.notifications = res.body;
      this.alertNewPrescriptionOrders(alertNewOrders);
    });
    this.notiUserService.countSummary().subscribe(res => {
      this.countUnread = res.unread;
      this.countRead = res.read;
    });
  }

  /**
   * Có đơn đặt thuốc mới chưa đọc: hiện thông báo góc màn hình + kêu một tiếng.
   * Lần tải đầu chỉ ghi nhận mốc, không kêu cho các đơn cũ.
   */
  private alertNewPrescriptionOrders(alert: boolean) {
    const orders = (this.notifications || []).filter(n => !n.is_read && n.notification?.notification_type === 'prescription_order');
    const newest = orders.reduce((max, n) => Math.max(max, Number(n.id) || 0), 0);
    if (this.orderNotiBaseline === null) {
      this.orderNotiBaseline = newest;
      return;
    }
    const fresh = orders.filter(n => Number(n.id) > this.orderNotiBaseline);
    if (alert && fresh.length) {
      fresh.slice(0, 3).forEach(n => this.notifyService.notify('info', n.notification?.title || 'Có đơn đặt thuốc mới'));
      this.playBeep();
    }
    this.orderNotiBaseline = Math.max(this.orderNotiBaseline, newest);
  }

  /** Âm báo ngắn bằng Web Audio (không cần file âm thanh); trình duyệt chặn khi chưa tương tác thì bỏ qua */
  private playBeep() {
    try {
      const Ctx = (window as any).AudioContext || (window as any).webkitAudioContext;
      if (!Ctx) {
        return;
      }
      const ctx = new Ctx();
      [0, 0.25].forEach(offset => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.value = 880;
        gain.gain.setValueAtTime(0.0001, ctx.currentTime + offset);
        gain.gain.exponentialRampToValueAtTime(0.3, ctx.currentTime + offset + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + offset + 0.2);
        osc.connect(gain).connect(ctx.destination);
        osc.start(ctx.currentTime + offset);
        osc.stop(ctx.currentTime + offset + 0.22);
      });
      setTimeout(() => ctx.close(), 1000);
    } catch (e) {
    }
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
