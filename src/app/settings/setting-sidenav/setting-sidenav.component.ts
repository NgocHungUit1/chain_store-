import {Component, HostBinding, Input, OnInit} from '@angular/core';
import {UserService} from '../../user/user.service';
import {Router} from '@angular/router';
import {NotificationUserService} from '../../notification/notification-user.service';

@Component({
  selector: 'app-setting-sidenav',
  templateUrl: './setting-sidenav.component.html',
  styleUrls: ['./setting-sidenav.component.css']
})
export class SettingSidenavComponent implements OnInit {
  public profile: {};
  public currentRouteLink = '/setting/notification';
  public countUnread = 0;

  constructor(
    private userSer: UserService,
    private router: Router,
    private notiUserService: NotificationUserService,
  ) {
  }

  ngOnInit() {
    this.userSer.getProfile().subscribe(res => {
      this.profile = res;
    });
    this.currentRouteLink = this.router.url;
    this.loadNotification();
  }

  loadNotification() {
    this.notiUserService.countUnread().subscribe(res => {
      this.countUnread = res;
    });
  }
}
