import {Component, Input, OnInit} from '@angular/core';
import {PerfectScrollbarConfigInterface} from 'ngx-perfect-scrollbar';
import {Router} from '@angular/router';
import {AuthService} from '../../../authentication/auth.service';
import {MatDialog} from '@angular/material/dialog';
import {UserService} from '../../../user/user.service';
import {UserFormDialogComponent} from '../../../user/user-form-dialog/user-form-dialog.component';
import {NotifierService} from 'angular-notifier';
import {User} from '../../../user/user.model';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: []
})
export class AppHeaderComponent implements OnInit {
  @Input() user: User;

  public config: PerfectScrollbarConfigInterface = {};
  userInfo: any = null;
  userLogin: any;


  // This is for Notifications
  notifications: Object[] = [
    {
      round: 'round-danger',
      icon: 'ti-link',
      title: 'Luanch Admin',
      subject: 'Just see the my new admin!',
      time: '9:30 AM'
    },
    {
      round: 'round-success',
      icon: 'ti-calendar',
      title: 'Event today',
      subject: 'Just a reminder that you have event',
      time: '9:10 AM'
    },
    {
      round: 'round-info',
      icon: 'ti-settings',
      title: 'Settings',
      subject: 'You can customize this template as you want',
      time: '9:08 AM'
    },
    {
      round: 'round-primary',
      icon: 'ti-user',
      title: 'Pavan kumar',
      subject: 'Just see the my admin!',
      time: '9:00 AM'
    }
  ];

  // This is for Mymessages
  mymessages: Object[] = [
    {
      useravatar: 'assets/images/users/1.jpg',
      status: 'online',
      from: 'Pavan kumar',
      subject: 'Just see the my admin!',
      time: '9:30 AM'
    },
    {
      useravatar: 'assets/images/users/2.jpg',
      status: 'busy',
      from: 'Sonu Nigam',
      subject: 'I have sung a song! See you at',
      time: '9:10 AM'
    },
    {
      useravatar: 'assets/images/users/2.jpg',
      status: 'away',
      from: 'Arijit Sinh',
      subject: 'I am a singer!',
      time: '9:08 AM'
    },
    {
      useravatar: 'assets/images/users/4.jpg',
      status: 'offline',
      from: 'Pavan kumar',
      subject: 'Just see the my admin!',
      time: '9:00 AM'
    }
  ];

  constructor(
    private dialog: MatDialog,
    private route: Router,
    private authSer: AuthService,
    private userService: UserService,
    private notifyService: NotifierService
  ) {
  }

  ngOnInit() {
    this.loadUserLogin();
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
      // user_id: this.authSer.getUserProfile(),
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
}
