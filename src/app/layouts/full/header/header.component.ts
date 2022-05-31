import {Component, Input, OnInit} from '@angular/core';
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

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class AppHeaderComponent implements OnInit{
  @Input() user: User;

  public config: PerfectScrollbarConfigInterface = {};
  userInfo: any = null;
  userLogin: any;


  // This is for Notifications
  notifications: NotificationUser[] = [
  ];
  countUnread = 0;
  notiClass = {
    'contract_expired_alert': 'round-danger',
    'contract_nearly_alert': 'round-warning',
  };
  notiIcon = {
    'contract_expired_alert': 'priority_high',
    'contract_nearly_alert': 'running_with_errors',
  };

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
    this.notiUserService.countUnread().subscribe(res => {
      this.countUnread = res;
    });
  }

  makeAsRead(item, view = false) {
    this.notiUserService.update(item.id, {is_read: 1}).subscribe(x => {
      if (x) {
        // this.notifyService.notify('success', 'Đã xem thông báo!');
        item.is_read = 1;
        this.loadNotification();

        if (view) {
          if (item.notification.notification_type === 'lower_stock') {
            this.router.navigateByUrl('/store/product?quota_stock=lower');
          }
        }
      }
    });
  }
}
