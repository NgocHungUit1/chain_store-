
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
import {UserService} from '../../user/user.service';
import {NotifierService} from 'angular-notifier';

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

  name_store: string = "Admin";
  branchList: any;
  branchLoginId: number;

  public showSearch = false;

  public config: PerfectScrollbarConfigInterface = {};
  private _mobileQueryListener: () => void;

  constructor(
    changeDetectorRef: ChangeDetectorRef,
    media: MediaMatcher,
    public menuItems: MenuItems,
    public router: Router,
    public customerService: CustomerService,
    public userService: UserService,
    public notifySer: NotifierService,
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
    this.customerService.getNameStore().subscribe(name => {
      this.name_store = name;
    });
    this.userService.getStoreBranchList().subscribe(res => {
      this.branchList = res.body;

    });

    this.userService.getBranchLogin().subscribe(branchLogin => {
      this.branchLoginId = branchLogin;
    });
    this.menuItems.refreshMenuItem();
  }

  public changeBranch(event) {
    console.log(event.value);
    const data = {'branch_store_id': event.value};
    this.userService.updateBranchLogin(data).subscribe(res => {
      if (res === true) {
        this.notifySer.notify('success', 'Chuyển chi nhánh thành công.');
        setTimeout(function() {
          location.reload();
        }, 500);
      } else {
        this.notifySer.notify('error', 'Đã có lỗi xảy ra, vui lòng kiểm tra lại.');
      }
    }, (error) => {
    });
  }
}
