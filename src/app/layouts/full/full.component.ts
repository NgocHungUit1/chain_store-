import { MediaMatcher } from '@angular/cdk/layout';
import { Router } from '@angular/router';
import {
  ChangeDetectorRef,
  Component,
  NgZone,
  OnDestroy,
  ViewChild,
  HostListener,
  Directive
} from '@angular/core';

import { MenuItems } from '../../shared/menu-items/menu-items';
import { AppHeaderComponent } from './header/header.component';
import { AppSidebarComponent } from './sidebar/sidebar.component';
import { AppBreadcrumbComponent } from './breadcrumb/breadcrumb.component';
import { PerfectScrollbarConfigInterface } from 'ngx-perfect-scrollbar';
import { CustomerService } from '../../customer/customer.service';
import { UserService } from '../../user/user.service';
import { NotifierService } from 'angular-notifier';
import {StoreService} from '../../store/store.service';
import {AuthService} from '../../authentication/auth.service';

/** @title Responsive sidenav */
@Component({
  selector: 'app-full-layout',
  templateUrl: 'full.component.html',
  styleUrls: []
})
export class FullComponent implements OnDestroy {
  mobileQuery: MediaQueryList;
  dir = 'ltr';
  green: boolean = true;
  blue: boolean = false;
  dark: boolean;
  minisidebar: boolean;
  boxed: boolean;
  danger: boolean = false;
  showHide: boolean;
  sidebarOpened;

  name_store: string = 'Admin';
  branchList: any;
  branchLoginId: number;

  public showSearch = false;

  public config: PerfectScrollbarConfigInterface = {};
  private _mobileQueryListener: () => void;

  public storeDetail: object = null;
  logo = 'assets/images/Rx20_16x16_op1-1207.png';

  constructor(
    changeDetectorRef: ChangeDetectorRef,
    media: MediaMatcher,
    public menuItems: MenuItems,
    public router: Router,
    public customerService: CustomerService,
    public userService: UserService,
    public notifySer: NotifierService,
    public authService: AuthService,
    public storeSer: StoreService,
  ) {
    this.mobileQuery = media.matchMedia('(min-width: 768px)');
    this._mobileQueryListener = () => changeDetectorRef.detectChanges();
    this.mobileQuery.addListener(this._mobileQueryListener);
  }

  ngOnDestroy(): void {
    this.mobileQuery.removeListener(this._mobileQueryListener);
  }

  // Mini sidebar
  ngOnInit(): void {
    this.userService.getRemainingExpiryDate().subscribe(day => {
      if (day < 4) {
        this.notifySer.notify('warning', 'Cửa hàng của bạn còn ' + day + ' ngày sử dụng, vui lòng liên hệ để gia hạn.');
      }

      this.customerService.getNameStore().subscribe(name => {
        this.name_store = name;
      });

      this.userService.getStoreBranchList().subscribe(res => {
        this.branchList = res.body;
      });

      this.userService.getBranchLogin().subscribe(branchLogin => {
        this.branchLoginId = branchLogin;
      });

      this.userService.getAllPermission().subscribe(res => {
        sessionStorage.setItem('allPermission', res.toString());
      });

      this.userService.isAdminStore().subscribe(isAdminStore => {
        sessionStorage.setItem('isAdminStore', String(isAdminStore));
      });

      this.authService.getPermissions().subscribe(res => {
        this.authService.setPermissions(res);
      });
    });

    this.storeSer.getDetail().subscribe(res => {
      this.storeDetail = res;
      const hostingExpirationDate = this.storeDetail['hosting_expiration_date'] || null; // NULL or YYYY-MM-DD
      // Check hosting expiration date vs current date
      if (hostingExpirationDate !== null) {
        const currentDate = new Date();
        const expirationDate = new Date(hostingExpirationDate);
        const timeDiff = expirationDate.getTime() - currentDate.getTime();
        const dayDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
        if (dayDiff < 4 && dayDiff >= 0) {
          this.notifySer.notify(
            'warning', 'Cửa hàng của bạn còn ' + dayDiff + ' ngày hosting, vui lòng liên hệ LH 0972 574 506 để được tư vấn.'
          );
        }
        // else if (dayDiff < 0) {
        //   this.notifySer.notify('error', 'Tài khoản cần nâng cấp phí hosting – LH 0972 574 506');
        // }
        localStorage.setItem('isExpiredHosting', dayDiff < 0 ? '1' : '0');
      } else {
        localStorage.setItem('isExpiredHosting', '0');
      }

      if (this.storeDetail['features'].indexOf('logo') >= 0 && this.storeDetail['logo'] !== null) {
        this.logo = this.storeDetail['logo'];
      }
    });

  }

  public changeBranch(event) {
    // console.log(event.value);
    const data = {'branch_store_id': event.value};
    this.userService.updateBranchLogin(data).subscribe(res => {
      if (res === true) {
        this.notifySer.notify('success', 'Chuyển chi nhánh thành công.');
        setTimeout(function () {
          location.reload();
        }, 500);
      } else {
        this.notifySer.notify('error', 'Đã có lỗi xảy ra, vui lòng kiểm tra lại.');
      }
    }, (error) => {
    });
  }

  public clickHelp() {
    window.open('https://rx20.vn/huong-dan-su-dung/', '_black');
  }

  public clickDownloadDriver() {
    window.open('https://drive.google.com/file/d/1SV3I9RfnrbdsvC6n8wluBKrDaptf3r9l/view?usp=sharing', '_black');
  }

  public clickVideoInstallDriver() {
    window.open('https://youtu.be/gSiGmhvGdmE', '_black');
  }


  public clickVideoUseBill() {
    window.open('https://youtu.be/EGzEaS5jFOI', '_black');
  }


}
